import z from "zod"

export const EmotionSchema = z.object({
  emotionName: z.string(),
  emotionScore: z.number()
});
