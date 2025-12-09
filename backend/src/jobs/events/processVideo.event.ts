import { QueueEvents } from "bullmq";
import { redis } from "../../config/redis";

export const videoProcessingEvents = new QueueEvents("video-processing", {connection: redis});


videoProcessingEvents.on("completed", ({ jobId }) => {
  console.log(`QueueEvents: job ${jobId} completed`);
});

videoProcessingEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`QueueEvents: job ${jobId} failed: ${failedReason}`);
});
