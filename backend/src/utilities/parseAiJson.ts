import { extractJson } from "./extractJson";
import { normalizeContent } from "./normalizeContent";

export const parseAiJson = (content: unknown)  => {
  const rawText = normalizeContent(content);
  const jsonText = extractJson(rawText);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Failed to parse AI JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not an array");
  }

  return parsed;
}
