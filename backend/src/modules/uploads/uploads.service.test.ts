import { UploadsService } from "./uploads.service";
import { SessionsRepository } from "../sessions/sessions.repository";
import supabase from "../../config/supabase";

jest.mock("../../config/supabase", () => ({
  storage: {
    from: jest.fn(() => ({
      list: jest.fn(),
      createSignedUrl: jest.fn()
    }))
  }
}));

jest.mock("../sessions/sessions.repository", () => ({
  SessionsRepository: {
    createSession: jest.fn()
  }
}));

describe("UploadsService", () => {

  // validateUploadFile
  describe("validateUploadFile", () => {
    it("throws for invalid extension", () => {
      expect(() => UploadsService.validateUploadFile("file.txt", "video/mp4", 1000)).toThrow("Invalid file extension");
    });

    it("throws for non-video content type", () => {
      expect(() => UploadsService.validateUploadFile("video.mp4", "image/png", 1000)).toThrow("Invalid content type");
    });

    it("throws for oversized file", () => {
      expect(() => UploadsService.validateUploadFile("video.mp4", "video/mp4", 300 * 1024 * 1024)).toThrow("File too large");
    });

    it("does nothing for valid file", () => {
      expect(() => UploadsService.validateUploadFile("video.mp4", "video/mp4", 1000)).not.toThrow();
    });
  });


  // generatePresignedUrl
  describe("generatePresignedUrl", () => {
    it("returns signed URL on success", async () => {

      (supabase.storage.from as jest.Mock).mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: "https://mock-url" }, error: null }),
        list: jest.fn().mockResolvedValue({ data: [{ name: "file.mp4" }], error: null }),
      });


      const url = await UploadsService.generatePresignedUrl("videos", "file.mp4", 300);

      expect(url).toBe("https://mock-url");
    });

    it("throws on error", async () => {
      
      (supabase.storage.from as jest.Mock).mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
        list: jest.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
      });


      await expect(UploadsService.generatePresignedUrl("videos", "file.mp4", 300)).rejects.toThrow("fail");
    });
  });


  // verifyUploadSucceeded
  describe("verifyUploadSucceeded", () => {
    it("returns file data", async () => {

      (supabase.storage.from as jest.Mock).mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: "url" }, error: null }),
        list: jest.fn().mockResolvedValue({ data: [{ name: "file.mp4" }], error: null }),
      });

      const result = await UploadsService.verifyUploadSucceeded("videos", "videos/file.mp4");

      expect(result).toEqual({ name: "file.mp4" });
    });

    it("throws if not found", async () => {

     (supabase.storage.from as jest.Mock).mockReturnValue({
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: "url" }, error: null }),
     });



      await expect(UploadsService.verifyUploadSucceeded("videos", "videos/file.mp4")).rejects.toThrow("File not found in storage.");
    });
  });


  // uploadUrl
  describe("uploadUrl", () => {
    it("returns sessionId, uploadUrl, filePath", async () => {
        
        jest.spyOn(UploadsService, "validateUploadFile").mockImplementation(() => {});

        (SessionsRepository.createSession as jest.Mock).mockResolvedValue({
        id: "session123",
        });

        
        jest.spyOn(UploadsService, "generatePresignedUrl").mockResolvedValue("https://presigned-url");

        const result = await UploadsService.uploadUrl("video.mp4", "video/mp4", 123);

        expect(result).toEqual({sessionId: "session123",uploadUrl: "https://presigned-url",filePath: expect.stringContaining("videos/session123-")});
    });
  });
  
  afterEach(() => { jest.restoreAllMocks()});
});

