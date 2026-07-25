/**
 * Structured application error.
 *
 * Throw this anywhere in the request pipeline to produce a well-formed HTTP
 * response without relying on the generic 500 catch-all.
 *
 * @example
 *   throw new AppError(404, "Note not found");
 *   throw new AppError(409, "Revision mismatch — reload and retry", { noteId });
 *   throw new AppError(422, "Invalid patch string");
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    /** Optional structured context logged alongside the error */
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ── Convenience factories ────────────────────────────────────────────────────

export const notFound = (resource = "Resource") =>
  new AppError(404, `${resource} not found`);

export const unauthorized = (msg = "Not authenticated") =>
  new AppError(401, msg);

export const forbidden = (msg = "Forbidden") => new AppError(403, msg);

export const conflict = (msg: string, ctx?: Record<string, unknown>) =>
  new AppError(409, msg, ctx);

export const unprocessable = (msg: string) => new AppError(422, msg);
