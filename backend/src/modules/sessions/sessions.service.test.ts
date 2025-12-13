import { SessionsService } from "./sessions.service";
import { SessionsRepository } from "./sessions.repository";
import { UploadsService } from "../uploads/uploads.service";
import { videoProcessingQueue } from "../../jobs/queues/processVideo.queue";

jest.mock("./sessions.repository", () => ({
  SessionsRepository: {
    checkSessionExistence: jest.fn(),
    updateSession: jest.fn(),
    getSession: jest.fn(),
    getResults: jest.fn(),
  },
}));

jest.mock("../uploads/uploads.service", () => ({
  UploadsService: {
    verifyUploadSucceeded: jest.fn(),
  },
}));

jest.mock("../../jobs/queues/processVideo.queue", () => ({
  videoProcessingQueue: { add: jest.fn() },
}));

describe("SessionsService", () => {
  const session_id = "session123";
  const filePath = "videos/test.mp4";
  const SUPABASE_URL = "https://supabase.example.com";
  const video_url = `${SUPABASE_URL}/storage/v1/object/public/videos/${filePath}`;

  beforeEach(() => {
    process.env.SUPABASE_URL = SUPABASE_URL;
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // markUploaded()

  describe("markUploaded()", () => {
    it("should throw if session does not exist", async () => {
      (SessionsRepository.checkSessionExistence as jest.Mock).mockResolvedValue(false);

      await expect(
        SessionsService.markUploaded(session_id, filePath)
      ).rejects.toThrow("Session Does not Exists");
    });

    it("should verify upload, update session, enqueue job, and return data", async () => {
      (SessionsRepository.checkSessionExistence as jest.Mock).mockResolvedValue(true);
      (UploadsService.verifyUploadSucceeded as jest.Mock).mockResolvedValue(true);
      (SessionsRepository.updateSession as jest.Mock).mockResolvedValue(true);

      const result = await SessionsService.markUploaded(session_id, filePath);

      expect(UploadsService.verifyUploadSucceeded).toHaveBeenCalledWith(
        "videos",
        filePath
      );

      expect(SessionsRepository.updateSession).toHaveBeenCalledWith(
        video_url,
        "uploaded",
        0,
        session_id
      );

      expect(videoProcessingQueue.add).toHaveBeenCalledWith(
        "video-processing",
        {
          video_url,
          filePath,
          session_id,
        },
        {
          attempts: 3,
          backoff: 5000,
        }
      );

      expect(result).toEqual({
        session_id,
        status: "uploaded",
        video_url,
      });
    });
  });


  // getSessionStatus()

  describe("getSessionStatus()", () => {
    it("should throw if session not found", async () => {
      (SessionsRepository.getSession as jest.Mock).mockResolvedValue(null);

      await expect(SessionsService.getSessionStatus(session_id))
        .rejects
        .toThrow("Session Does not Exists");
    });

    it("should return session status", async () => {
      const mockSession = {
        status: "uploaded",
        progress: 40,
        video_url,
      };

      (SessionsRepository.getSession as jest.Mock).mockResolvedValue(mockSession);

      const result = await SessionsService.getSessionStatus(session_id);

      expect(result).toEqual({
        session_id,
        status: "uploaded",
        progress: 40,
        video_url,
      });
    });
  });

 
  //  getResults()

  describe("getResults()", () => {
    it("should throw if no results found", async () => {
      (SessionsRepository.getResults as jest.Mock).mockResolvedValue([]);

      await expect(SessionsService.getResults(session_id))
        .rejects
        .toThrow("No results Found");
    });

    it("should return transformed results", async () => {
      const mockResults = [
        {
          summary_text: "Video summary",
          phase_index: 0,
          dominant_emotion: "happy",
          start_frame: 0,
          end_frame: 50,
          average_confidence: 0.83,
        },
        {
          phase_index: 1,
          dominant_emotion: "neutral",
          start_frame: 51,
          end_frame: 100,
          average_confidence: 0.65,
        },
      ];

      (SessionsRepository.getResults as jest.Mock).mockResolvedValue(mockResults);

      const result = await SessionsService.getResults(session_id);

      expect(result).toEqual({
        summary: "Video summary",
        phases: [
          {
            phase_index: 0,
            dominant_emotion: "happy",
            start_frame: 0,
            end_frame: 50,
            average_confidence: 0.83,
          },
          {
            phase_index: 1,
            dominant_emotion: "neutral",
            start_frame: 51,
            end_frame: 100,
            average_confidence: 0.65,
          },
        ],
      });
    });
  });
});
