import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis";
import { SessionsRepository } from "../../modules/sessions/sessions.repository";
import { VideoService } from "../../modules/videos/videos.service";

export const worker = new Worker("video-processing", async (job: Job) => {
   const { video_url, filePath, session_id } = job.data;
  
   job.updateProgress(0);

   const session = await SessionsRepository.getSession(session_id);
   if(!session) throw new Error("Session not found");

   job.updateProgress(5);

   const localPath = await VideoService.downloadVideo(session_id, filePath);
   job.updateProgress(15)

   const { framesDir, frameCount } = await VideoService.extractFrames(session_id, localPath);
   job.updateProgress(40)

   const emotionTimeline = await VideoService.analyzeFrames(session_id, framesDir);
   job.updateProgress(75)

   const results = await VideoService.generateSummary(emotionTimeline);
   job.updateProgress(90);
   
   await SessionsRepository.updateSessionStatus(session_id, "done")


   job.updateProgress(100)
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