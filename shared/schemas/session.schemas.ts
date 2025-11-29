import z from "zod"
import { FrameSchema } from "./frame.schemas";

export const CreateSessionSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1)
});

export const PresignedUrlResponseSchema = z.object({
  uploadUrl: z.url(),
  sessionId: z.uuid()
});

export const MarkUploadCompleteSchema = z.object({
  sessionId: z.uuid()
});

export const SessionStatusResponseSchema = z.object({
  sessionId: z.uuid(),
  status: z.enum([
    'uploading',
    'uploaded',
    'processing',
    'done',
    'failed'
  ]),
  progress: z.number().min(0).max(100).optional()
});

export const SessionResultsSchema = z.object({
  sessionId: z.uuid(),
  summary: z.string(),
  frames: z.array(FrameSchema)
})
