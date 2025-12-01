import { Request, Response, NextFunction } from "express";
import { UploadsService } from "../../modules/uploads/uploads.service";

export const UploadsController = {
   async uploadUrl(req: Request, res: Response, next: NextFunction) {
     try {
       const {fileName, fileType, size} = req.body;

       if (!fileName || !fileType || !size) return res.status(400).json({ error: "Missing required fields" });

       
       const data = await UploadsService.uploadUrl(fileName, fileType, size);


       return res.status(200).json(data)
      
     } catch (error) {
        next(error)
     }
   }
}