import { Request, Response, NextFunction } from "express";
import { UploadsService } from "../../modules/uploads/uploads.service";

export const UploadsController = {
   async uploadUrl(req: Request, res: Response, next: NextFunction) {
     try {
       const {fileName, fileType, size} = req.body;

       if(size >= 200 * 1024 * 1024) return res.status(413).json({message: "the file is too large"})

       const publicFileUrl = ``
       const { session, uploadUrl, status } = await UploadsService.uploadUrl(`videos/${fileName}`,);


       return res.status(200).json({ sessionId: session.id, uploadUrl, publicFileUrl })
      
     } catch (error) {
        next(error)
     }
   }
}