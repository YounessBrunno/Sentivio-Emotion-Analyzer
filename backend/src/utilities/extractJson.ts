export const extractJson = (text: string): string => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/(\{[\s\S]*?\}|\[[\s\S]*?\])/);

  if (!match) {
    throw new Error("No JSON found in AI response");
  }

  return match[1];
};
