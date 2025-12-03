import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis";

export const worker = new Worker("video-processing", async (job: Job) => {
  console.log("Processing:", job.id);
  
},{
  concurrency: 2,
  connection : redis
});

worker.on("completed", (job: Job) => {
  console.log(`Job ${job.id} done ✔`);
});

worker.on("failed", (err) => {
  console.error(`Job failed ❌`, err);
});