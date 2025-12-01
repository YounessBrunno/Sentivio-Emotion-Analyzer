import z from "zod"

export const uploadUrlSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  size: z.number()
});


export const MarkUploadedSchema = z.object({
  sessionId: z.uuid(),
  filePath: z.string()
});