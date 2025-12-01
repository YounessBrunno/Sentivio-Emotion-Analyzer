import { Request, Response, NextFunction } from "express";
import { SessionsService } from "../../modules/sessions/sessions.service";

export const SessionsController = {
   async markUploaded(req: Request, res: Response, next: NextFunction) {
      try {
        const { session_id, filePath } = req.body;
        if (!session_id || !filePath) return res.status(400).json({ message: "Missing session_id or filePath" });

        const data = await SessionsService.markUploaded(session_id, filePath)  

        return res.status(200).json(data)

      } catch (error) {
         next(error)
      }
   },
   async getSessionStatus(req: Request, res: Response, next: NextFunction) {
      try {
        const { id: session_id } = req.params;
        if (!session_id) return res.status(400).json({ message: "Missing session_id" });

   
        const data = await SessionsService.getSessionStatus(session_id)
        return res.status(200).json(data)

      } catch (error) {
         next(error)
      }
   },

}   