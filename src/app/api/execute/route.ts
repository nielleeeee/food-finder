import { NextRequest, NextResponse } from "next/server";

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const restaurantParametersResponseSchema = {
  type: Type.OBJECT,
  properties: {
    query: {
      type: Type.STRING,
    },
    near: {
      type: Type.STRING,
    },
    price: {
      type: Type.STRING,
    },
    open_now: {
      type: Type.BOOLEAN,
    },
  },

  required: ["query", "near"],
};

const systemInstruction = `You are an AI assistant for a restaurant finder app.
Your task is to analyze the user's message and extract parameters for a restaurant search.
You must output these parameters as a JSON object strictly adhering to the provided schema.
The JSON object should only contain the following properties: "query", "near", and optionally "price" and "open_now".

Parameter extraction guidelines:
- "query" (string, required): Extract the main food type, cuisine (e.g., 'sushi', 'Italian food'), or a specific restaurant name.
- "near" (string, required): Extract the location where the user wants to search.
    - This should be a string naming a recognizable locality in the world that is likely to be geocodable (e.g., "Chicago, IL", "Paris, France", "Shibuya, Tokyo").
    - Vague terms like "around here" should be resolved to a more specific place if possible from context, or the user might need to clarify. For now, extract the location as best as possible, aiming for specificity. If the value is not geocodable by a service like Foursquare, it may result in an error later.
- "price" (string, optional):
    - If the user mentions price, map qualitative descriptions to Foursquare price tiers (1=cheap, 2=moderate, 3=expensive, 4=very expensive).
    - Examples: "cheap", "affordable", "budget" -> "1"; "moderate", "mid-range" -> "2"; "expensive" -> "3"; "very expensive", "fancy", "high-end" -> "4".
    - For ranges like "cheap to moderate", use a comma-separated list (e.g., "1,2").
    - If no price is mentioned by the user, DO NOT include the "price" field in the output JSON.
- "open_now" (boolean, optional):
    - If the user explicitly asks for places "open now", "currently open", etc., set this to true.
    - If not mentioned by the user, DO NOT include the "open_now" field in the output JSON.

Strictly follow the schema. Do not add extra fields. Only include optional fields if specified by the user.`;

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY || !process.env.FOURSQUARE_API_KEY) {
    return NextResponse.json(
      { error: "API Key not configured on server." },
      { status: 500 }
    );
  }

  let userMessage: string;

  // Parse request body
  try {
    const body = await request.json();

    userMessage = body.query;

    if (!userMessage) {
      return NextResponse.json(
        { error: "Missing 'query' parameter in request body" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error parsing request body:", error);

    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  // AI Translation
  let parsedResponse: ParsedResponse;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      contents: userMessage,

      config: {
        responseMimeType: "application/json",

        systemInstruction: systemInstruction,

        responseSchema: restaurantParametersResponseSchema,
      },
    });

    if (!response || response.text === undefined) {
      return NextResponse.json(
        { error: "No response from AI model" },
        { status: 500 }
      );
    }

    parsedResponse = JSON.parse(response.text);
  } catch (error) {
    console.error("Error processing AI request:", error);

    return NextResponse.json({ error: error }, { status: 500 });
  }

  // Foursquare API Call
  const foursquareBaseUrl = "https://api.foursquare.com/v3/places/search";
  const searchParams = new URLSearchParams();

  if (parsedResponse.query) {
    searchParams.append("query", parsedResponse.query);
  }
  if (parsedResponse.near) {
    searchParams.append("near", parsedResponse.near);
  }
  if (parsedResponse.price) {
    searchParams.append("price", parsedResponse.price);
  }
  if (parsedResponse.open_now === true) {
    searchParams.append("open_now", "true");
  }

  // Constant params
  searchParams.append(
    "fields",
    "fsq_id,name,location,categories,rating,price,hours,description,stats"
  );
  searchParams.append("sort", "RATING");
  searchParams.append("limit", "10");

  const dynamicUrl = `${foursquareBaseUrl}?${searchParams.toString()}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: process.env.FOURSQUARE_API_KEY,
    },
  };

  try {
    const foursquareResponse = await fetch(dynamicUrl, options);

    if (!foursquareResponse || foursquareResponse.status !== 200) {
      console.error("Error fetching Foursquare data:", foursquareResponse);

      return NextResponse.json(
        { error: "Foursquare API request failed" },
        { status: 500 }
      );
    }

    const foursquareData = await foursquareResponse.json();

    console.log(foursquareData);

    return NextResponse.json(foursquareData, { status: 200 });
  } catch (error) {
    console.error("Error processing foursquare request:", error);

    return NextResponse.json({ error: error }, { status: 500 });
  }
}
