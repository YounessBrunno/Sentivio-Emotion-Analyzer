import { Queue } from "bullmq";

export const videoProcessingQueue = new Queue("video-processing");
