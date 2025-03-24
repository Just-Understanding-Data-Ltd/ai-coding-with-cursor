import type { Context, Next } from "hono";
import type { MiddlewareHandler } from "hono";
import winston from "winston";

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

export const logger = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;

    winstonLogger.info("Request completed", {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration: `${ms}ms`,
    });
  };
};
