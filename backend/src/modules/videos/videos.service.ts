import fs from "fs"
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import supabase from "../../config/supabase"

export const VideoService = {
   async downloadVideo(session_id: string, filePath: string) {
     const bucket = "videos";
     const remotePath = filePath

     const LocalFileName = `./${session_id}-video.mp4`;
     const localPath = path.resolve("tmp", LocalFileName);

     const { data, error } = await supabase.storage.from(bucket).download(remotePath)

     if(error||!data) throw new Error(`Failed to download video from storage, error: ${error.message}`);

     const webStream = (data as Blob).stream();
     const nodeStream = Readable.fromWeb(webStream as any);
     
     const stream = fs.createWriteStream(localPath)

     await pipeline(nodeStream, stream);
     
     return localPath;
   },

   async extractFrames(localPath: string) {},
   async analyzeFrames(session_id: string, frames: string[]) {},
   async generateSummary(emotionTimeline: string) {},
}