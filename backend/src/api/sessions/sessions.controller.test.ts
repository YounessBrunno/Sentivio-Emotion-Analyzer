import { SessionsController } from "./sessions.controller";
import { SessionsService } from "../../modules/sessions/sessions.service";

jest.mock("../../modules/sessions/sessions.service", () => ({
  SessionsService: {
    markUploaded: jest.fn(),
    getSessionStatus: jest.fn(),
    getResults: jest.fn(),
  },
}));


describe("SessionsController", () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = { params: {}, body: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  // mark uploaded
  describe("markUploaded", () => {
    it("should update session and return data", async () => {
      req.body = { session_id: "123", filePath: "videos/abc.mp4" };

      const mockData = { status: "uploaded" };
      (SessionsService.markUploaded as jest.Mock).mockResolvedValue(mockData);

      await SessionsController.markUploaded(req, res, next);

      expect(SessionsService.markUploaded).toHaveBeenCalledWith("123", "videos/abc.mp4");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should return 400 when session_id or filePath is missing", async () => {
      req.body = {}; 

      await SessionsController.markUploaded(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing session_id or filePath"
      });
    });

    it("should call next(error) when service throws", async () => {
      req.body = { session_id: "123", filePath: "videos/abc.mp4" };

      const error = new Error("DB error");
      (SessionsService.markUploaded as jest.Mock).mockRejectedValue(error);

      await SessionsController.markUploaded(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // get session status
  describe("getSessionStatus", () => {
    it("should return session status", async () => {
      req.params = { id: "123" };

      const mockData = { status: "processing" };
      (SessionsService.getSessionStatus as jest.Mock).mockResolvedValue(mockData);

      await SessionsController.getSessionStatus(req, res, next);

      expect(SessionsService.getSessionStatus).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should return 400 when session_id is missing", async () => {
      req.params = {};

      await SessionsController.getSessionStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing session_id"
      });
    });

    it("should call next(error) when service throws", async () => {
      req.params = { id: "123" };

      const error = new Error("Error fetching status");
      (SessionsService.getSessionStatus as jest.Mock).mockRejectedValue(error);

      await SessionsController.getSessionStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // get results
  describe("getResults", () => {
    it("should return session results", async () => {
      req.params = { id: "123" };

      const mockData = { result: { emotion: "happy" } };
      (SessionsService.getResults as jest.Mock).mockResolvedValue(mockData);

      await SessionsController.getResults(req, res, next);

      expect(SessionsService.getResults).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should return 400 when session_id is missing", async () => {
      req.params = {};

      await SessionsController.getResults(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing session_id"
      });
    });

    it("should call next(error) when service throws", async () => {
      req.params = { id: "123" };

      const error = new Error("Failed to load results");
      (SessionsService.getResults as jest.Mock).mockRejectedValue(error);

      await SessionsController.getResults(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
