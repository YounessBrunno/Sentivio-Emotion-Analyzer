import { extractJson } from "./extractJson";
import { normalizeContent } from "./normalizeContent";

type EmotionResult = {
  emotion: string;
  confidence: number;
};

export const parseAiJson = (content: unknown): EmotionResult => {
  const rawText = normalizeContent(content);

  const match = extractJson(rawText)


  let parsed: unknown;

  try {

    parsed = JSON.parse(match);

  } catch {

    throw new Error("Failed to parse AI JSON");
  }

 
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("AI response is not an object");
  

  const obj = parsed as any;

  if (typeof obj.emotion !== "string" || typeof obj.confidence !== "number") {
    throw new Error("AI response missing emotion or confidence");
  }

  return {
    emotion: obj.emotion,
    confidence: obj.confidence,
  };
};
