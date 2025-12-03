import { Worker, Job } from "bullmq";

export const worker = new Worker("video-processing", async (job: Job) => {
  console.log("Processing:", job.id);
  
});

worker.on("completed", (job: Job) => {
  console.log(`Job ${job.id} done ✔`);
});

worker.on("failed", (err) => {
  console.error(`Job failed ❌`, err);
});