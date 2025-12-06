import fs, { globSync } from "fs"
import { spawn } from "child_process";
import path from "path";
import { Readable } from "stream";
import { ReadableStream as WebReadableStream } from "stream/web";
import { pipeline } from "stream/promises";
import supabase from "../../config/supabase"
import { promisify } from "util";
import { hf } from "../../config/inference.huggingFace";

type RawEmotion = {
  frameIndex: number;
  emotion: string;
  confidence: number;
};

type EmotionPhase = {
  phaseIndex: number;
  dominantEmotion: string;
  startFrame: number;
  endFrame: number;
  avgConfidence: number;
  stability: "stable" | "volatile";
};

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
      
      const uploadedFrames: { frameIndex: number; url: string }[] = [];

      const files = fs.readdirSync(framesDir);
      if (files.length === 0) {
         throw new Error("No frame files found in frames directory.");
      }

      for (let i = 0; i < files.length; i++) {
         const filename = files[i];

         const fullLocalPath = path.join(framesDir, filename);

         const fileBuffer = fs.readFileSync(fullLocalPath);

         const storagePath = `${session_id}/${filename}`;

         const { data, error } = await supabase.storage.from("frames").upload(storagePath, fileBuffer, {
            contentType: "image/jpeg",
            upsert: true, 
         });

         if (!data)  throw new Error("Upload failed: " + error?.message);
         

         const { data: publicData } = supabase.storage.from("frames").getPublicUrl(data.path);
         const publicUrl = publicData.publicUrl;

      
         uploadedFrames.push({frameIndex: i + 1, url: publicUrl});
      }

      const BATCH_SIZE = 10;
      const rawEmotionTimeline: RawEmotion[] = [];

      for (let i = 0; i < uploadedFrames.length; i += BATCH_SIZE) {
         const batch = uploadedFrames.slice(i, i + BATCH_SIZE);

         const chatCompletion = await hf.chatCompletion({
            model: "Qwen/Qwen2-VL-2B-Instruct",
            messages: [
            {
               role: "system",
               content: [{ type: "text", text: process.env.ANALYZE_FRAMES_PROMPT!},],
            },
            {
               role: "user",
               content: batch.map((frame) => ({ type: "image_url", image_url: { url: frame.url }})),
            },
            ],
         });
         
         const content = chatCompletion.choices[0].message?.content;
         if (!content) throw new Error("AI returned empty content");

         const batchResult = JSON.parse(content)
         
         for (const item of batchResult) {
            rawEmotionTimeline.push(item);
         }
      }

      return rawEmotionTimeline;
   },

   async smoothAndAggregateEmotions(rawEmotionTimeline: RawEmotion[]) {
      if (rawEmotionTimeline.length === 0) return [];

      //temporal + confidence smoothing
      const smoothed: RawEmotion[] = rawEmotionTimeline.map((current, index, arr) => {
         const prev = arr[index - 1];
         const next = arr[index + 1];

         if (!prev || !next) return current;

         const isWeak = current.confidence < 0.6;

         if (
            prev.emotion === next.emotion &&
            current.emotion !== prev.emotion &&
            isWeak
         ) {
            return {
            ...current,
            emotion: prev.emotion,
            confidence: Math.max(prev.confidence, next.confidence),
            };
         }

         return current;
      });

      // Aggregate Into Phases
      const phases: EmotionPhase[] = [];

      let currentPhaseEmotion = smoothed[0].emotion;
      let startFrame = smoothed[0].frameIndex;
      let confidenceSum = smoothed[0].confidence;
      let frameCount = 1;

      for (let i = 1; i < smoothed.length; i++) {
         const current = smoothed[i];

         if (current.emotion === currentPhaseEmotion) {
            confidenceSum += current.confidence;
            frameCount++;
         } else {
            const avgConfidence = confidenceSum / frameCount;

            phases.push({
            phaseIndex: phases.length + 1,
            dominantEmotion: currentPhaseEmotion,
            startFrame,
            endFrame: smoothed[i - 1].frameIndex,
            avgConfidence: Number(avgConfidence.toFixed(3)),
            stability: frameCount >= 5 ? "stable" : "volatile",
            });

            currentPhaseEmotion = current.emotion;
            startFrame = current.frameIndex;
            confidenceSum = current.confidence;
            frameCount = 1;
         }
      }

      const finalAvgConfidence = confidenceSum / frameCount;

      phases.push({
         phaseIndex: phases.length + 1,
         dominantEmotion: currentPhaseEmotion,
         startFrame,
         endFrame: smoothed[smoothed.length - 1].frameIndex,
         avgConfidence: Number(finalAvgConfidence.toFixed(3)),
         stability: frameCount >= 5 ? "stable" : "volatile",
      });

      return phases;
   },

   async generateSummary(phases: EmotionPhase[]) {
      

      let formattedTimeline: string[] = [];

      phases.map((obj) => {
          const line = `Frame ${obj.phaseIndex}: ${obj.dominantEmotion} (confidence: ${obj.} )`
          formattedTimeline.push(line)
      })

      const formattedTimelineString = formattedTimeline.join("\n");

      const basePrompt = process.env.GENERATE_SUMMARY_PROMPT;
      if (!basePrompt) throw new Error("Missing GENERATE_SUMMARY_PROMPT");

      const  finalPrompt = basePrompt + 
                           "\n\nEmotion Timeline:\n<<<\n" + formattedTimelineString + 
                           "\n>>>\n\nNow write the emotional summary:"

      const summary = await hf.textGeneration({
         model: "Qwen/Qwen2.5-7B-Instruct-1M",
	      inputs: finalPrompt,
      })

      if(!summary||!summary.generated_text) throw new Error("AI did not generate any text")

      return {
         emotionTimeline,
         summary: summary.generated_text
      }
   },
}