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
      if (!session) throw new Error("Session not found");

      let progress = 0;
      switch(session.status) {
         case "uploading": progress = 20; break;
         case "uploaded": progress = 50; break;
         case "processing": progress = session.progress || 80; break;
         case "done": progress = 100; break;
         case "failed": progress = session.progress || 0; break;
      }

      return {
        session_id,
        status: session.status,
        progress,
        video_url: session.video_url
      };
  },

  async getResults() {

  }
}