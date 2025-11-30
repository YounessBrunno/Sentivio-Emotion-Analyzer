import { Request, Response, NextFunction } from "express";

const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  const isProd = process.env.NODE_ENV === "production";
  const statusCode = (err as any).status || 500;

  res.status(statusCode).json({ 
    status: statusCode, 
    message: err.message,
    stack: isProd ? undefined : err.stack,
  });
};

export default handleError;