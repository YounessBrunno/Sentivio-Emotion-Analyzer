import { Worker, Job } from "bullmq";
import { redis } from "../../config/redis";
import { SessionsRepository } from "../../modules/sessions/sessions.repository";
import { VideoService } from "../../modules/videos/videos.service";
import { SummariesRepository } from "../../modules/summaries/summaries.repository";
import { EmotionsRepository } from "../../modules/emotions/emotions.repository";

export const worker = new Worker("video-processing", async (job: Job) => {
   const { filePath, session_id, frame_id } = job.data;
  
   job.updateProgress(0);

   const session = await SessionsRepository.getSession(session_id);
   if(!session) throw new Error("Session not found");

   job.updateProgress(5);
   await SessionsRepository.updateSessionProgress(5, session_id)

   const localPath = await VideoService.downloadVideo(session_id, filePath);
   job.updateProgress(15)
   await SessionsRepository.updateSessionProgress(15, session_id)

   const { frames } = await VideoService.extractFrames(session_id, localPath);
   job.updateProgress(35)
   await SessionsRepository.updateSessionProgress(35, session_id)


   const rawEmotions = await VideoService.analyzeFrames(session_id, frames);
   for(const emotion of rawEmotions) {
      await EmotionsRepository.addEmotion(frame_id, emotion.emotion, emotion.confidence)
   }
   job.updateProgress(70)
   await SessionsRepository.updateSessionProgress(70, session_id)

   const emotionPhases = await VideoService.smoothAndAggregateEmotions(rawEmotions)
   for (const phase of emotionPhases) {
      await EmotionsRepository.addEmotionPhases(session_id, phase.phaseIndex, phase.dominantEmotion,phase.startFrame, phase.endFrame, phase.avgConfidence, phase.stability, "v1");
   }
   job.updateProgress(80)
   await SessionsRepository.updateSessionProgress(80, session_id)


   const { summary } = await VideoService.generateSummary(emotionPhases);
   await SummariesRepository.addSummary(summary, session_id)
   job.updateProgress(90);
   await SessionsRepository.updateSessionProgress(90, session_id)


   await SessionsRepository.updateSessionStatus(session_id, "done")
   await SessionsRepository.updateSessionProgress(100, session_id)
   
   job.updateProgress(100);
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