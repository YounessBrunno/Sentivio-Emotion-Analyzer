import supabase from "../../config/supabase";
import { SessionsRepository } from "../sessions/sessions.repository"

export const UploadsService = {
   async generatePresignedUrl( bucket: string, path: string, expiresIn = 300) {

     const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

     if (error) throw new Error(error.message);

     return data.signedUrl;
   },

   async uploadUrl(path: string, video_url: string, status = "uploading") {
     const session = await SessionsRepository.createSession(video_url, status);
     const uploadUrl = await UploadsService.generatePresignedUrl("videos",path);
     
     return {session, uploadUrl, status} 
   }

}