import { SessionsRepository } from "../sessions/sessions.repository"

export const UploadsService = {
   async uploadUrl(video_url: string, status = "uploading") {
      const session = SessionsRepository.createSession(video_url, status)
   }
}