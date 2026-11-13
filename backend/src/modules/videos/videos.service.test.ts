import { VideoService } from "./videos.service";
import { Readable } from "stream";
import { Writable } from "stream";
import { FramesRepository } from "../frames/frames.repository";
import supabase from "../../config/supabase";
import { groq } from "../../config/groq";
import fs from "fs";
import { spawn } from "child_process";
import path from "path";

// mocks

(global as any).fetch = jest.fn().mockResolvedValue({
  ok: true,
  body: Readable.from(["video data"]),
});

jest.mock("fs", () => ({
  createWriteStream: jest.fn(),
  readFileSync: jest.fn(),
  mkdir: jest.fn(),
  promises: {
    rm: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
  },
}));


jest.mock("child_process", () => ({
  spawn: jest.fn(),
}));

jest.mock("../../config/supabase", () => ({
  __esModule: true,
  default: {
    storage: {
      from: jest.fn(() => ({
        download: jest.fn(),
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}));


jest.mock("../../config/groq", () => ({
  groq: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

jest.mock("../frames/frames.repository");

jest.mock("fast-glob", () => jest.fn(() => [
    "/tmp/frame_0001.jpg",
    "/tmp/frame_0002.jpg",
 ]));

// test data

const session_id = "session-123";

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ANALYZE_FRAMES_PROMPT = "analyze frames";
  process.env.GENERATE_SUMMARY_PROMPT_PREFIX = "summary prompt:";
});

// tests

describe("VideoService", () => {

  // downloadVideo
  describe("downloadVideo()", () => {
    it("downloads and saves the video locally", async () => {

        jest.spyOn(Readable, "fromWeb").mockImplementation((webStream) => {
           return Readable.from(["video data"]);
        });

        const fakeStream = Readable.from(["video data"]);
        
        (supabase.storage.from as jest.Mock).mockReturnValue({
         download: jest.fn().mockResolvedValue({ data: { stream: () => fakeStream } }),
        });

        
        (fs.createWriteStream as jest.Mock).mockReturnValue(
            new Writable({write(chunk, encoding, callback) {callback();}, final(callback) {callback();},})
        );

        const result = await VideoService.downloadVideo(session_id, "videos/test.mp4");

        expect(result).toContain(`${session_id}-video.mp4`);
    });

    it("throws if download fails", async () => {
        (supabase.storage.from as jest.Mock).mockReturnValue({
        download: jest.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
        });

        await expect(
        VideoService.downloadVideo(session_id, "videos/test.mp4")
        ).rejects.toThrow("Failed to download video");
    });
  });

  // extractFrames
  describe("extractFrames()", () => {
    it("extracts frames successfully", async () => {
      const mockProcess: any = {
        stderr: { on: jest.fn() },
        on: jest.fn((event, cb) => {
          if (event === "close") cb(0);
        }),
      };

      (spawn as jest.Mock).mockReturnValue(mockProcess);


      const result = await VideoService.extractFrames(session_id, "/tmp/video.mp4");

      expect(result.frameCount).toBe(2);
      expect(result.frames.length).toBe(2);
      expect(fs.promises.rm).toHaveBeenCalledWith(
        expect.stringContaining(`frames${path.sep}${session_id}`),
        { recursive: true, force: true }
      );
    });

    it("throws if ffmpeg fails", async () => {
      const mockProcess: any = {
        stderr: { on: jest.fn() },
        on: jest.fn((event, cb) => {
          if (event === "close") cb(1);
        }),
      };

      (spawn as jest.Mock).mockReturnValue(mockProcess);

      await expect(
        VideoService.extractFrames(session_id, "/tmp/video.mp4")
      ).rejects.toThrow("FFmpeg failed");
    });
  });

  // analyzeFrames
  describe("analyzeFrames()", () => {
    it("uploads frames and returns emotion timeline", async () => {
      const frames = [
        { frameIndex: 1, timestamp: 0, filePath: "/tmp/frame1.jpg" },
      ];

      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from("image"));

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: "path" } }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: "http://frame.url" },
        }),
      });

      (FramesRepository.addFrame as jest.Mock).mockResolvedValue({ id: "frame-id" });

      const result = await VideoService.analyzeFrames(session_id, frames);

      expect(result[0].emotion).toBe("happy");
      expect(result[0].confidence).toBe(0.9);
    });

    it("throws if no frames provided", async () => {
      await expect(
        VideoService.analyzeFrames(session_id, [])
      ).rejects.toThrow("No frames provided");
    });
  });

  // smoothAndAggregateEmotions
  describe("smoothAndAggregateEmotions()", () => {
    it("aggregates emotions into phases", async () => {
      const raw = [
        { frameId: "1", frameIndex: 1, emotion: "happy", confidence: 0.9 },
        { frameId: "2", frameIndex: 2, emotion: "happy", confidence: 0.8 },
        { frameId: "3", frameIndex: 3, emotion: "sad", confidence: 0.7 },
      ];

      const phases = await VideoService.smoothAndAggregateEmotions(raw);

      expect(phases.length).toBe(2);
      expect(phases[0].dominantEmotion).toBe("happy");
    });
  });

  // generateSummary
  describe("generateSummary()", () => {
    it("generates summary from phases", async () => {
      (groq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: "Final emotional summary" } }],
      });

      const result = await VideoService.generateSummary([
        {
          phaseIndex: 1,
          dominantEmotion: "happy",
          startFrame: 1,
          endFrame: 10,
          avgConfidence: 0.85,
          stability: "stable",
        },
      ]);

      expect(result.summary).toBe("Final emotional summary");
      expect(groq.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({ model: "openai/gpt-oss-20b" })
      );
    });

    it("throws if AI returns nothing", async () => {
      (groq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      await expect(
        VideoService.generateSummary([
          {
            phaseIndex: 1,
            dominantEmotion: "happy",
            startFrame: 1,
            endFrame: 10,
            avgConfidence: 0.85,
            stability: "stable",
          },
        ])
      ).rejects.toThrow("AI did not generate any text");
    });
  });
});
