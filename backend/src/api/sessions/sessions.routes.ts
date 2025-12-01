import { Router } from "express";
import  { SessionsController } from "./sessions.controller"
import { validate } from "../../middlewares/validation.middleware";
import { MarkUploadedSchema } from "../../modules/sessions/sessions.schemas";

const router = Router();

router.post("session/mark-uploaded",validate(MarkUploadedSchema),SessionsController.markUploaded)
router.get("session/:id/status",SessionsController.getSessionStatus)
router.get("session/:id/results",SessionsController.getResults)

export default router;