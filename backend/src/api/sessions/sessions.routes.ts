import { Router } from "express";
import  { SessionsController } from "./sessions.controller"

const router = Router();

router.post("session/mark-uploaded",SessionsController.markUploaded)
router.get("session/:id/status",SessionsController.getSessionStatus)
router.get("session/:id/results",SessionsController.getResults)

export default router;