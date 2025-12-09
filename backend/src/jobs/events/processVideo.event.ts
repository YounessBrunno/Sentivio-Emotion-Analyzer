import { QueueEvents } from "bullmq";
import { redis } from "../../config/redis";

export const videoProcessingEvents = new QueueEvents("video-processing", {connection: redis});



videoProcessingEvents.on("waiting", ({ jobId }) => {
  console.log(`Job ${jobId} is waiting`);
});

videoProcessingEvents.on("active", ({ jobId }) => {
  console.log(`Job ${jobId} is now active`);
});

videoProcessingEvents.on("stalled", ({ jobId }) => {
  console.warn(`⚠️ Job ${jobId} stalled!`);
});

videoProcessingEvents.on("progress", ({ jobId, data }) => {
  console.log(`Job ${jobId} progress:`, data);
});

videoProcessingEvents.on("completed", ({ jobId }) => {
  console.log(`✅ Job ${jobId} completed`);
});

videoProcessingEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed: ${failedReason}`);
});

videoProcessingEvents.on("drained", () => {
  console.log(`Queue drained`);
});

videoProcessingEvents.on("delayed", ({ jobId, delay }) => {
  console.log(`Job ${jobId} delayed for ${delay} ms`);
});
