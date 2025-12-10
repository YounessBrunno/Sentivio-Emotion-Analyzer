import { videoProcessingQueue } from "../../jobs/queues/processVideo.queue";
import { FramesRepository } from "../frames/frames.repository";
import { UploadsService } from "../uploads/uploads.service"
import { SessionsRepository } from "./sessions.repository";

export const SessionsService = {
  async markUploaded(session_id: string,filePath: string) {
   
    const sessionExists = await SessionsRepository.checkSessionExistence(session_id);
    if(!sessionExists)  throw new Error("Session Does not Exists");

    await UploadsService.verifyUploadSucceeded("videos", filePath);

  
    const video_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/videos/${filePath}`;
    const status = "uploaded"
    await SessionsRepository.updateSession(video_url, status, 0,session_id)
    
    
    await videoProcessingQueue.add("video-processing",{video_url, filePath, session_id,},{
      attempts: 3,
      backoff: 5000
    });


    return {
      session_id,
      status,
      video_url
    }
  },

  async getSessionStatus(session_id: string) {
      const session = await SessionsRepository.getSession(session_id);
      if(!session) throw new Error("Session Does not Exists");
      
      return {
        session_id,
        status: session.status,
        progress : session.progress,
        video_url: session.video_url
      };
  },

  async getResults(session_id: string) {
      const results = await SessionsRepository.getResults(session_id)
      if(!results || results.length === 0) throw new Error("No results Found");
      

      return {
        summary: results[0].summary_text,
        phases: results.map(r => ({
          phase_index: r.phase_index,
          dominant_emotion: r.dominant_emotion,
          start_frame: r.start_frame,
          end_frame: r.end_frame,
          average_confidence: r.average_confidence,
      })),
  };      
  }
}