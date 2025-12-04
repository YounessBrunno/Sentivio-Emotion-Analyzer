import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis";
import { SessionsRepository } from "../../modules/sessions/sessions.repository";
import { VideoService } from "../../modules/videos/videos.service";

export const worker = new Worker("video-processing", async (job: Job) => {
   const { video_url, session_id } = job.data;
  
   job.updateProgress(0);

   const session = await SessionsRepository.getSession(session_id);
   if(!session) throw new Error("Session not found");

   const localPath = await VideoService.downloadVideo(video_url);
   const frames = await VideoService.extractFrames(localPath);
   const analysis = await VideoService.analyzeFrames(frames);
   const results = await VideoService.generateSummary(analysis);
   
  
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