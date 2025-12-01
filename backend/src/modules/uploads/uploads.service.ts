import supabase from "../../config/supabase";
import { SessionsRepository } from "../sessions/sessions.repository"

const ALLOWED_EXTENSIONS = ["mp4", "mov"];
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;

export const UploadsService = {
   validateUploadFile(fileName: string, fileType: string, size: number) {
      const extension = fileName.split(".").pop()?.toLowerCase();

      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) throw new Error("Invalid file extension");
    
      if (!fileType.startsWith("video/")) throw new Error("Invalid content type");
      
      if (size > MAX_FILE_SIZE_BYTES) throw new Error("File too large");
      
   },

   async generatePresignedUrl( bucket: string, path: string, expiresIn: number) {

     const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

     if (error) throw new Error(error.message);

     return data.signedUrl;
   },

   async uploadUrl(fileName: string, fileType: string, size: number) {
     this.validateUploadFile(fileName, fileType, size);

     const session = await SessionsRepository.createSession(null, "uploading");

     const extension = fileName.split(".").pop();
     const filePath = `videos/${session.id}-${crypto.randomUUID()}.${extension}`;

     const uploadUrl = await this.generatePresignedUrl("videos", filePath, 300);
     
     return {
      sessionId: session.id,
      uploadUrl,
      filePath
     };
   }

}