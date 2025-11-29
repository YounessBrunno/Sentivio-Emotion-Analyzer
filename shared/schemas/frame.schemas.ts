import z from "zod"
import { EmotionSchema } from "./emotion.schemas";

export const FrameSchema = z.object({
  id: z.uuid(),
  timestamp: z.number(),
  frameUrl: z.url(),
  emotions: z.array(EmotionSchema)
});