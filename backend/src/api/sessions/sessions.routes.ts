import { Router } from "express";
import  { SessionsController } from "./sessions.controller"
import { validate } from "../../middlewares/validation.middleware";
import { MarkUploadedSchema } from "../../modules/sessions/sessions.schemas";

const router = Router();

router.post("/sessions/:id/uploaded",validate(MarkUploadedSchema),SessionsController.markUploaded)
router.get("/sessions/:id/status",SessionsController.getSessionStatus)
router.get("/sessions/:id/results",SessionsController.getResults)

export default router;