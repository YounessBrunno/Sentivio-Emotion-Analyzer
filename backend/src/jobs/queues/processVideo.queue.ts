import { Queue } from "bullmq";
import { redis } from "../../config/redis";

export const videoProcessingQueue = new Queue("video-processing",{connection: redis});
