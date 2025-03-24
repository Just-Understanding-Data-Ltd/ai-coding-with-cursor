import type { Context, Next } from "hono";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import * as Sentry from "@sentry/node";

export const errorHandler = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "production") {
        Sentry.captureException(error);
      }

      if (error instanceof HTTPException) {
        return c.json(
          {
            message: error.message,
            status: error.status,
          },
          error.status
        );
      }

      console.error(error);

      return c.json(
        {
          message: "Internal Server Error",
          status: 500,
        },
        500
      );
    }
  };
};
