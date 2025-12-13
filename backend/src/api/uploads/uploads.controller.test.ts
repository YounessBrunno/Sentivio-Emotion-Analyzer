
import { UploadsService } from "../../modules/uploads/uploads.service";
import { UploadsController } from "./uploads.controller";

jest.mock("../../modules/uploads/uploads.service", () => ({
  UploadsService: {
    uploadUrl: jest.fn(),
  },
}));


describe("UploadsController.uploadUrl", () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = {
      body: {
        fileName: "video.mp4",
        fileType: "video/mp4",
        size: 12345
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should return uploadUrl, filePath, and sessionId", async () => {
    const mockResponse = {
      sessionId: "session123",
      uploadUrl: "https://mock-url.com",
      filePath: "videos/123-file.mp4"
    };

    (UploadsService.uploadUrl as jest.Mock).mockResolvedValue(mockResponse);

    await UploadsController.uploadUrl(req, res, next);

    expect(UploadsService.uploadUrl).toHaveBeenCalledWith(
      "video.mp4",
      "video/mp4",
      12345
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("should return 400 if fields are missing", async () => {
    req.body = {}; 

    await UploadsController.uploadUrl(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields"});
  });

  it("should call next(error) on service error", async () => {
    const error = new Error("DB error");

    (UploadsService.uploadUrl as jest.Mock).mockRejectedValue(error);

    await UploadsController.uploadUrl(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
