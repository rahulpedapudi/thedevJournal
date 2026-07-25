import type { Request, Response, NextFunction } from "express";
import { logger } from "../../lib/logger";
import { AppError } from "../lib/app-error";

/**
 * Global error-handling middleware.
 *
 * Handles two tiers:
 *  1. `AppError`  — intentional, structured errors thrown by services/controllers.
 *     These are logged at "warn" (client mistakes) or "error" (server faults)
 *     and returned with the status code they carry.
 *  2. Anything else — unexpected errors that bubbled up uncaught.
 *     Always returns 500 and logs at "error" with full stack.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // Express requires the 4-arg signature to recognise this as an error handler.
  _next: NextFunction,
): void {
  const requestId = res.getHeader("x-request-id") as string | undefined;
  const base = {
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    userId: req.user?.id,
  };

  // ── Structured AppError ───────────────────────────────────────────────────
  if (err instanceof AppError) {
    const isClientError = err.statusCode < 500;

    if (isClientError) {
      logger.warn(
        { ...base, statusCode: err.statusCode, context: err.context },
        err.message,
      );
    } else {
      logger.error(
        {
          ...base,
          statusCode: err.statusCode,
          context: err.context,
          stack: err.stack,
        },
        err.message,
      );
    }

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.context ? { context: err.context } : {}),
    });
    return;
  }

  // ── Unexpected / unhandled error ──────────────────────────────────────────
  logger.error(
    {
      ...base,
      err: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    },
    "Unhandled error in request pipeline",
  );

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
