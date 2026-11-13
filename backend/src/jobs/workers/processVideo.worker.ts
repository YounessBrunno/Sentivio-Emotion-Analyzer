import '../../config/dotenv';
import { Worker, Job, UnrecoverableError } from "bullmq";
import { redis } from "../../config/redis";
import { videoProcessingEvents } from "../events/processVideo.event";
import { SessionsRepository } from "../../modules/sessions/sessions.repository";
import { VideoService } from "../../modules/videos/videos.service";
import { SummariesRepository } from "../../modules/summaries/summaries.repository";
import { EmotionsRepository } from "../../modules/emotions/emotions.repository";

export const worker = new Worker("video-processing", async (job: Job) => {
  const { filePath, session_id } = job.data;

  try {
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
   console.log("RAW EMOTIONS COUNT:", rawEmotions.length);
   console.log("RAW EMOTIONS FRAME IDS:", rawEmotions.map(e => e.frameId));

   if (rawEmotions.length === 0) {
      throw new Error("No persisted or newly analysed emotions were found for the extracted frames");
   }

   job.updateProgress(70)
   await SessionsRepository.updateSessionProgress(70, session_id)

   const emotionPhases = await VideoService.smoothAndAggregateEmotions(rawEmotions)
   if (emotionPhases.length === 0) {
      throw new Error("Cannot persist phases without an emotion timeline");
   }

   await EmotionsRepository.deleteEmotionPhasesBySessionId(session_id);
   for (const phase of emotionPhases) {
      await EmotionsRepository.addEmotionPhases(session_id, phase.phaseIndex, phase.dominantEmotion,phase.startFrame, phase.endFrame, phase.avgConfidence, phase.stability, "v1");
   }

   job.updateProgress(80)
   await SessionsRepository.updateSessionProgress(80, session_id)


   const { summary } = await VideoService.generateSummary(emotionPhases);
   await SummariesRepository.replaceSummary(session_id, summary)

   job.updateProgress(90);
   await SessionsRepository.updateSessionProgress(90, session_id)


   await SessionsRepository.updateSessionStatus(session_id, "done")
   await SessionsRepository.updateSessionProgress(100, session_id)

   job.updateProgress(100);

  } catch(err: any) {
    console.error("Error in job:", err);
    if (isPaymentError(err)) {
      throw new UnrecoverableError("Summary provider rejected the request due to payment or quota (HTTP 402)");
    }
    throw err;
  } finally {
   
    await VideoService.cleanupSessionTempFiles(session_id);
  }
},{
  concurrency: 1,
  lockDuration: 120_000,
  lockRenewTime: 8000,
  maxStalledCount: 4,
  connection : redis,
  // Do not claim a job until all logging listeners below are attached.
  autorun: false,
});

function isPaymentError(error: any) {
  return error?.status === 402 ||
    error?.statusCode === 402 ||
    error?.httpResponse?.status === 402 ||
    error?.httpResponse?.statusCode === 402 ||
    /\b402\b/.test(String(error?.message ?? ""));
}

worker.on("progress", (job: Job, progress) => {
  console.log(`[PROGRESS] job=${job.id}: ${progress}%`);
});

worker.on("failed", (job, error) => {
  console.error(`[FAILED] job=${job?.id}`, error);
});

void (async () => {
  try {
    await videoProcessingEvents.waitUntilReady();
    console.log("Video-processing worker is ready and listening for jobs");
    await worker.run();
  } catch (error) {
    console.error("Video-processing worker failed to start:", error);
  }
})();

worker.on("active", (job: Job) => {
  console.log(`Job ${job.id} is Active ✔`);
});

worker.on("stalled", (err, reason) => {
  console.error(`Job stalled ❌`, err, `reason is: ${reason}`);
});

worker.on("failed", (err) => {
  console.error(`Job failed ❌`, err);
});


worker.on("completed", (job: Job) => {
  console.log(`Job ${job.id} done ✔`);
});
