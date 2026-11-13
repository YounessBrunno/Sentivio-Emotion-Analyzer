import fs from "fs"
import fg  from "fast-glob";
import { spawn } from "child_process";
import path from "path";
import { Readable } from "stream";
import { ReadableStream as WebReadableStream } from "stream/web";
import { pipeline } from "stream/promises";
import supabase from "../../config/supabase"
import { promisify } from "util";
import { gemini } from "../../config/gemini";
import { groq } from "../../config/groq";
import { FramesRepository } from "../frames/frames.repository";
import { EmotionsRepository } from "../emotions/emotions.repository";
import { parseAiJson } from "../../utilities/parseAiJson";

type RawEmotion = {
  frameId: string
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

     const mkdir = promisify(fs.mkdir);
     const tmpDir = path.resolve("tmp");
     await mkdir(tmpDir, { recursive: true });


     const localFileName = path.basename(`${session_id}-video.mp4`);
     const localPath = path.join(tmpDir, localFileName);

     console.log("DOWNLOAD PARAMS:", {bucket, remotePath: filePath});


     const { data, error } = await supabase.storage.from(bucket).download(remotePath)

     console.log("DOWNLOAD RESULT:", { hasData: !!data, error });

     if(error||!data) throw new Error(`Failed to download video from storage, error: ${error.message}`);

     const webStream = (data as Blob).stream();
     const nodeStream = Readable.fromWeb(webStream as WebReadableStream<Uint8Array>);
     
     const stream = fs.createWriteStream(localPath)

     await pipeline(nodeStream, stream);

     if (!fs.existsSync(localPath)) throw new Error("Downloaded video file does not exist");
     
     return localPath;
   },

   async extractFrames(session_id: string, localPath: string) {
      
      const framesDir = path.resolve(`tmp/frames/${session_id}`);
   
      await fs.promises.rm(framesDir, { recursive: true, force: true });
      await fs.promises.mkdir(framesDir, { recursive: true });

      const fps = 0.5; // this means 1 frame every 2 seconds.

      const spawnArgs = [
         "-i", localPath,            
         "-vf", `fps=${fps}`,             
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

      await new Promise((r) => setTimeout(r, 50))
            
      const files = await fg("*.jpg",{cwd: framesDir,absolute: true});
      if (files.length === 0) throw new Error("No frames extracted. Video may be corrupted.");
      

      console.log(`[extractFrames] Extracted ${files.length} frames for session ${session_id}`);

      const msPerFrame = Math.round(1000 / fps);

      const frames = files.map((filePath, index) => ({
         frameIndex: index + 1,
         timestamp: index * msPerFrame,
         filePath
      }));

      return {
         framesDir,
         frames,
         frameCount: files.length
      };
   },

   // Removes only local artifacts. The original video and
   // uploaded frame images in Supabase are intentionally not affected ;).
   async cleanupSessionTempFiles(session_id: string) {
      const tmpDir = path.resolve("tmp");

      await fs.promises.rm(tmpDir, {
         recursive: true,
         force: true,
         maxRetries: 3,
         retryDelay: 100,
      });
   },
   
   
   async analyzeFrames(session_id: string, frames: { frameIndex: number; timestamp: number; filePath: string }[]) {

      if (frames.length === 0) {
         throw new Error("No frames provided for analysis.");
      }

      const rawEmotionTimeline: RawEmotion[] = [];

      const [existingFrames, persistedEmotions] = await Promise.all([
         FramesRepository.getFramesBySessionId(session_id),
         EmotionsRepository.getEmotionTimeline(session_id),
      ]);
      const existingFramesByIndex = new Map(existingFrames.map(frame => [frame.frame_index, frame]));
      const persistedEmotionsByFrameIndex = new Map(
         persistedEmotions.map(emotion => [emotion.frameIndex, emotion])
      );

      for (const frame of frames) {
         try {

            const persistedEmotion = persistedEmotionsByFrameIndex.get(frame.frameIndex);
            if (persistedEmotion) {
               console.log(`Frame ${frame.frameIndex} already has a saved emotion result, reusing it.`);
               rawEmotionTimeline.push(persistedEmotion);
               continue;
            }

            const existingFrame = existingFramesByIndex.get(frame.frameIndex);
            let frameId = existingFrame?.id as string | undefined;

            // Only frames without metadata need to be uploaded and inserted again.
            // A frame row alone is not treated as an analysed frame.
            let fileBuffer: Buffer | undefined;
            if (!frameId) {
               fileBuffer = fs.readFileSync(frame.filePath);

               const filename = path.basename(frame.filePath);
               const storagePath = `${session_id}/${filename}`;
      
            // Upload to Supabase Storage      

               const { data, error } = await supabase.storage
               .from("frames")
               .upload(storagePath, fileBuffer, {
               contentType: "image/jpeg",
               upsert: true,
               });

               if (error || !data) throw new Error(`Upload failed: ${error?.message || "Unknown upload error"}`);
            
            // Get Public URL for Uploaded Frame
            
               const { data: publicData } = supabase.storage
               .from("frames")
               .getPublicUrl(data.path);

               const frameUrl = publicData.publicUrl;

               console.log("FRAME URL:");
               console.log(frameUrl);

            // Store frame metadata in DB and get frame ID for emotion timeline            

               const { id } = await FramesRepository.addFrame(session_id, frame.frameIndex, frame.timestamp, frameUrl);
               frameId = id;
            }

            
            // Emotion Analysis with Gemini

            console.log("SENDING TO GEMINI...");

            // Read file as base64 directly from disk (fileBuffer is above)

            const imageBuffer = fileBuffer ?? fs.readFileSync(frame.filePath);
            const base64Image = imageBuffer.toString("base64");

            const response = await gemini.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: [
               {
                  role: "user",
                  parts: [
                  {
                     text: process.env.ANALYZE_EACH_FRAME_PROMPT!,
                  },
                  {
                     inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Image,
                     },
                  },
                  {
                     text: "Analyze this image and return JSON only.",
                  },
                  ],
               },
            ],
            config: {
               responseMimeType: "application/json", // this forces JSON output, no markdown fences
            },
            });

            console.log("GEMINI SUCCESS RESPONSE:");
            console.dir(response, { depth: null });

            // Extract text content from Gemini response (should be JSON string)
           
            const content = response.text;

            console.log("GEMINI CONTENT:");
            console.dir(content, { depth: null });

            if (!content) throw new Error("AI returned empty content");
            
            // Parse Model response ensuring it's valid JSON with expected structure, extract emotion and confidence.
            
            const result = parseAiJson(content);

            console.log("PARSED RESULT:");
            console.dir(result, { depth: null });

            if (!frameId) throw new Error(`Frame ${frame.frameIndex} has no database ID`);

            const savedEmotion = await EmotionsRepository.addEmotionIfMissing(
               frameId,
               result.emotion,
               result.confidence
            );

            rawEmotionTimeline.push({
             frameId,
             frameIndex: frame.frameIndex,
             emotion: savedEmotion.emotion_name,
             confidence: Number(savedEmotion.emotion_score),
            });

            
         } catch (err: any) {

            console.log("\n================ GEMINI ERROR ================\n");

            console.error("ERROR MESSAGE:");
            console.error(err?.message);

            console.error("\nFULL ERROR:");
            console.dir(err, { depth: null });

            console.log("\n=============================================\n");

            throw err;
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

         if ( prev.emotion === next.emotion && current.emotion !== prev.emotion && isWeak) {
           
           return {...current, emotion: prev.emotion, confidence: Math.max(prev.confidence, next.confidence)};
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
      if (phases.length === 0) {
         throw new Error("Cannot generate a summary without emotion phases");
      }

      const formattedTimeline: string[] = [];

      phases.forEach((obj) => {
         const line = `From frame ${obj.startFrame} to ${obj.endFrame}, the dominant emotion is ${obj.dominantEmotion} with an average confidence of ${obj.avgConfidence.toFixed(2)}. Emotional stability during this phase is ${obj.stability}.`;

         formattedTimeline.push(line);
      });

      const formattedTimelineString = formattedTimeline.join("\n");

      const basePrompt = process.env.GENERATE_SUMMARY_PROMPT_PREFIX;
      if (!basePrompt) throw new Error("Missing GENERATE_SUMMARY_PROMPT");

      const finalPrompt =
         basePrompt +
         "\n\nEmotion Timeline (phases):\n<<<\n" +
         formattedTimelineString +
         "\n>>>\n\nWrite a concise summary of the observed facial expressions:";

      try {
         const result = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            reasoning_effort: "low",
            max_completion_tokens: 512,
            include_reasoning: false,
            messages: [
               {
                  role: "system",
                  content: "You generate accurate, neutral summaries of facial-expression analysis.",
               },
               {
                  role: "user",
                  content: finalPrompt,
               },
            ],
            max_tokens: 180,
            temperature: 0.2,
         });

         const summary = result.choices?.[0]?.message?.content?.trim();
         if (!summary) {
            throw new Error("AI did not generate any text");
         }

         return {
            summary,
         };

      } catch (error: any) {
         console.error(
            "Groq summary generation error:",
            JSON.stringify(error.error ?? error.message, null, 2)
         );

         throw error;
      }
   },
}
