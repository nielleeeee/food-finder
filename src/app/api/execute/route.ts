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
    rating: {
      type: Type.NUMBER,
    },
  },

  required: ["query", "near"],
};

const systemInstruction = `You are an AI assistant for a restaurant finder app.
Your task is to analyze the user's message and extract parameters for a restaurant search.
You must output these parameters as a JSON object strictly adhering to the provided schema.
The output JSON object MUST use the exact property names defined in the schema: "query", "near", and optionally "price", "open_now", and "min_rating_out_of_10".

Parameter extraction guidelines:

- "query" (string, required): Extract the main food type, cuisine (e.g., 'sushi', 'Italian food'), or a specific restaurant name.

- "near" (string, required): Extract the location where the user wants to search.
    - This should be a string naming a recognizable locality in the world that is likely to be geocodable (e.g., "Chicago, IL", "Paris, France", "Shibuya, Tokyo").
    - Vague terms like "around here" should be resolved to a more specific place if possible from context. If the value is not geocodable by a service like Foursquare, it may result in an error later.

- "price" (string, optional):
    - If the user mentions price (e.g., "cheap", "moderate", "expensive"), map qualitative descriptions to Foursquare price tiers (1=cheap, 2=moderate, 3=expensive, 4=very expensive).
    - Examples: "cheap", "affordable", "budget" -> "1"; "moderate", "mid-range" -> "2"; "expensive" -> "3"; "very expensive", "fancy", "high-end" -> "4".
    - For ranges like "cheap to moderate", use a comma-separated list (e.g., "1,2").
    - If no price is mentioned by the user, the "price" field MUST BE COMPLETELY OMITTED from the output JSON. Do not include it as null or an empty string.

- "open_now" (boolean, optional):
    - If the user's message explicitly contains phrases like "open now", "currently open", or "open at this time", you MUST include the "open_now" field in the output JSON and set its value to true.
    - If such phrases are NOT present in the user's message, the "open_now" field MUST BE COMPLETELY OMITTED from the output JSON. Do not include it as false unless explicitly negated by the user (which is not the primary use case here for omission).

- "min_rating_out_of_10" (number, optional):
    - The property name in the JSON output for rating MUST BE "min_rating_out_of_10". Do not use "rating" or any other name.
    - If the user mentions a minimum star rating (e.g., "4 stars", "at least 3.5 stars", "rated 5 out of 5", "four and a half stars"), first identify this star value. Assume this user-mentioned star rating is on a scale of 1 to 5 stars.
    - Convert this 1-5 star rating to a 0-10 scale by multiplying the star value by 2.
        - Example: "4 stars" (out of 5) should result in the number 8.
        - Example: "3.5 stars" (out of 5) should result in the number 7.
    - If the resulting number on the 0-10 scale has more than two decimal places, round it to a maximum of two decimal places.
        - Example: Input "3.125 stars" (3.125 * 2 = 6.25) -> output 6.25.
        - Example: Input "2.333 stars" (2.333 * 2 = 4.666...) -> output 4.67.
    - If a rating is extracted and converted, include "min_rating_out_of_10" in the output JSON with the calculated numerical value.
    - If no rating is mentioned by the user, the "min_rating_out_of_10" field MUST BE COMPLETELY OMITTED from the output JSON. Do not include it with a value of 0 or null.

Strictly follow the schema for property names and types. Only include optional fields if the user's message provides relevant information for them. Do not add extra fields not defined in the schema.
Ensure the output is a single, valid JSON object only.`;

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

    console.log(parsedResponse);
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

    const foursquareData =
      (await foursquareResponse.json()) as FoursquareAPIResponse;

    let finalResultsArray: FoursquarePlace[];

    const messageSpecifiedRating = parsedResponse.rating;

    if (typeof messageSpecifiedRating === "number") {
      finalResultsArray = foursquareData.results.filter(
        (restoItem: FoursquarePlace) => {
          if (typeof restoItem.rating === "number") {
            return restoItem.rating >= messageSpecifiedRating;
          }

          return false;
        }
      );
    }

    finalResultsArray = foursquareData.results;

    const responseData = {
      results: finalResultsArray,
      total: finalResultsArray.length,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error processing foursquare request:", error);

    return NextResponse.json({ error: error }, { status: 500 });
  }
}
