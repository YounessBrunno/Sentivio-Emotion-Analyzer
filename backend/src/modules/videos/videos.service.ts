import fs, { globSync } from "fs"
import { spawn } from "child_process";
import path from "path";
import { Readable } from "stream";
import { ReadableStream as WebReadableStream } from "stream/web";
import { pipeline } from "stream/promises";
import supabase from "../../config/supabase"
import { promisify } from "util";

export const VideoService = {
   async downloadVideo(session_id: string, filePath: string) {
     const bucket = "videos";
     const remotePath = filePath

     const LocalFileName = `./${session_id}-video.mp4`;
     const localPath = path.resolve("tmp", LocalFileName);

     const { data, error } = await supabase.storage.from(bucket).download(remotePath)

     if(error||!data) throw new Error(`Failed to download video from storage, error: ${error.message}`);

     const webStream = (data as Blob).stream();
     const nodeStream = Readable.fromWeb(webStream as WebReadableStream<Uint8Array>);
     
     const stream = fs.createWriteStream(localPath)

     await pipeline(nodeStream, stream);
     
     return localPath;
   },

   async extractFrames(session_id: string, localPath: string) {
      
      const mkdir = promisify(fs.mkdir);
      const framesDir = path.resolve(`tmp/frames/${session_id}`);
      await mkdir(framesDir, { recursive: true });

      const spawnArgs = [
         "-i", localPath,            
         "-vf", "fps=1",             
         "-q:v", "2",                
         "-hide_banner",             
         "-loglevel", "error",       
         "-y",                     
         path.join(framesDir, "frame_%04d.jpg") 
      ];
      const ffmpeg = spawn("ffmpeg", spawnArgs, { stdio: "pipe" })

      let stderr = "";
      ffmpeg.stderr.on("data", (chunk) => {
         stderr += chunk.toString();
      });

      
      const exitCode: number = await new Promise((resolve, reject) => {
         ffmpeg.on("close", resolve);
         ffmpeg.on("error", reject);
      });

      if (exitCode !== 0) {
         throw new Error(`FFmpeg failed with code ${exitCode}. Details:\n${stderr}`);
      }

      
      const files = globSync(path.join(framesDir, "*.jpg"));
      if (files.length === 0) {
         throw new Error("No frames extracted. Video may be corrupted.");
      }

      console.log(`[extractFrames] Extracted ${files.length} frames for session ${session_id}`);

      
      return {
         framesDir,
         frameCount: files.length
      };
   },
   async analyzeFrames(session_id: string, framesDir: string) {
       const 
   },
   
   async generateSummary(emotionTimeline: string) {

   },
}