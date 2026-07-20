import pino from "pino";

export const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "token",
    "accessToken",
    "refreshToken",
  ],
});
