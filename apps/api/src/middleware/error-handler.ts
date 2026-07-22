import type { Request, Response, NextFunction } from "express";
import { logger } from "../../lib/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl || req.url,
      userId: req.user?.id,
    },
    "Unhandled error in request pipeline",
  );

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
