import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";


export const validate = (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {
        ...req.body,
        ...req.query,
        ...req.params
      };

      schema.parse(data);

      next();
    } catch (err: any) {
      return res.status(400).json({ error: err.errors });
    }
};