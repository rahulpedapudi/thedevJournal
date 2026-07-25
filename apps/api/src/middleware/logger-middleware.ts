import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import { logger } from "../../lib/logger";

/** Routes that are too noisy/uninteresting to log at info level */
const SILENT_PATHS = ["/health", "/api/health"];
const AUTH_PATH_PREFIX = "/api/auth";

export const httpLogger = pinoHttp({
  logger,

  // Attach a unique request ID to every request so log lines are traceable.
  genReqId: (req, res) => {
    const existing =
      (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
    res.setHeader("x-request-id", existing);
    return existing;
  },

  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      // Trim the query string off the path for cleaner grouping
      path: req.url?.split("?")[0],
      query: req.query,
      // Approximate body size from Content-Length header
      contentLength: req.headers?.["content-length"]
        ? Number(req.headers["content-length"])
        : undefined,
      userAgent: req.headers?.["user-agent"],
      ip:
        req.headers?.["x-forwarded-for"] ??
        req.socket?.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      contentLength: res.getHeader?.("content-length"),
    }),
  },

  // Attach userId (available after requiresAuth runs) to every log line.
  customProps: (req) => ({
    userId: (req as any).user?.id,
    requestId: (req as any).id,
  }),

  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  customSuccessMessage: (req, res, responseTime) =>
    `${req.method} ${req.url} → ${res.statusCode} (${responseTime}ms)`,

  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} → ${res.statusCode} [${err.message}]`,

  // Silence health checks and auth callbacks — they're just noise.
  autoLogging: {
    ignore: (req) => {
      const url = req.url ?? "";
      return (
        SILENT_PATHS.some((p) => url === p) ||
        url.startsWith(AUTH_PATH_PREFIX)
      );
    },
  },
});
