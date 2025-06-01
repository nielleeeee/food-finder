// lib/llmService.ts (example path)
import { GoogleGenAI } from "@google/genai";
import {
  GEMINI_MODEL,
  SYSTEM_INSTRUCTION,
  PLACE_PARAMETERS_RESPONSE_SCHEMA,
} from "@/lib/constant";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const getParsedParamsFromLLM = async (
  userMessage: string
): Promise<ParsedResponse> => {
  console.log("Sending to Gemini:", { model: GEMINI_MODEL, userMessage });

  try {
    const generationResult = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userMessage,
      config: {
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTION,
        responseSchema: PLACE_PARAMETERS_RESPONSE_SCHEMA,
      },
    });

    const responseText = generationResult.text;

    if (responseText === undefined || responseText.trim() === "") {
      console.error("AI response text is undefined or empty", generationResult);

      throw new Error("No content from AI model");
    }

    const parsed = JSON.parse(responseText) as ParsedResponse;

    console.log("Parsed LLM Response:", parsed);

    if (!parsed.query || !parsed.near) {
      throw new Error(
        "LLM output missing required fields (query or near): " + parsed
      );
    }

    return parsed;
  } catch (error) {
    console.error("Error in getParsedParamsFromLLM:", error);

    throw new Error("AI translation request failed");
  }
};
