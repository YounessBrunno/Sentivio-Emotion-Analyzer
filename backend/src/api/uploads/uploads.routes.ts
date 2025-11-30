import { Router } from "express";
import { UploadsController } from "./uploads.controller";


const router = Router();

router.post("/upload-url",UploadsController.uploadUrl)

export default router;