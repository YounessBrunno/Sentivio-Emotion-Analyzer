export const  normalizeContent = (content: unknown): string => {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) return content.filter(c => typeof c?.text === "string").map(c => c.text).join("");
  

  throw new Error("Unsupported AI content format");
}
