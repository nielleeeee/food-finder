import { NextRequest, NextResponse } from "next/server";
import { getParsedParamsFromLLM } from "@/lib/function/geminiParser";
import { getFoursquarePlacesData } from "@/lib/function/fouresquarePlaces";
import { ratelimit } from "@/lib/rateLimiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const foursquareApiKey = process.env.FOURSQUARE_API_KEY;

  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    const resetDate = new Date(reset);

    console.log(
      `Rate limit exceeded for IP: ${ip}. Limit: ${limit}, Remaining: ${remaining}, Resets at: ${resetDate.toLocaleTimeString()}`
    );

    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: `You have exceeded the request limit. Please try again after ${resetDate.toLocaleTimeString()}.`,
        limit,
        remaining,
        reset: resetDate.toISOString(),
      },
      { status: 429 }
    );
  }

  console.log(`Rate limit check passed for IP: ${ip}. Remaining: ${remaining}`);

  if (!geminiApiKey || !foursquareApiKey) {
    return NextResponse.json(
      { error: "API Key not configured on server." },
      { status: 500 }
    );
  }

  let userMessage: string;

  // Parse request body
  try {
    const body = await request.json();

    userMessage = body.message;

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

  // LLM Translation & Foursquare API Call
  try {
    const parsedResponse = await getParsedParamsFromLLM(userMessage);

    const fourSquareData = await getFoursquarePlacesData(
      parsedResponse,
      foursquareApiKey
    );

    return NextResponse.json(fourSquareData, { status: 200 });
  } catch (error) {
    console.error(
      "Error processing LLM request or Foursquare API call:",
      error
    );

    return NextResponse.json({ error: error }, { status: 500 });
  }
}
