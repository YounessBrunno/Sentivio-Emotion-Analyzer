import { UploadsService } from "../uploads/uploads.service"
import { SessionsRepository } from "./sessions.repository";

export const SessionsService = {
  async markUploaded(session_id: string,filePath: string) {
   
    const sessionExists = await SessionsRepository.checkSessionExistence(session_id);
    if(!sessionExists)  throw new Error("Session Does not Exists");

    await UploadsService.verifyUploadSucceeded("videos", filePath);

    const video_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/videos/${filePath}`;
    const status = "uploaded"
    await SessionsRepository.updateSession(video_url, status, session_id)
    
    // Triggering background worker later


    return {
      session_id,
      status,
      video_url
    }
  }
}