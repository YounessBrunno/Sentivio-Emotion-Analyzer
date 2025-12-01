import { Router } from "express";
import { UploadsController } from "./uploads.controller";
import { validate } from "../../middlewares/validation.middleware";
import { uploadUrlSchema } from "../../modules/sessions/sessions.schemas";


const router = Router();

router.post("/upload-url", validate(uploadUrlSchema), UploadsController.uploadUrl)

export default router;