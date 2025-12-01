import { Worker } from "bullmq";

export const worker = new Worker("video-processing", async job => {
  console.log("Processing:", job.id);
});
