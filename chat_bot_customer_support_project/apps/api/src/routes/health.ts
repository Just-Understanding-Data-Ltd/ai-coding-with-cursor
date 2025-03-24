import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import type { Context } from "hono";

const healthResponseSchema = z
  .object({
    status: z.string().openapi({
      example: "ok",
    }),
    timestamp: z.string().openapi({
      example: new Date().toISOString(),
    }),
  })
  .openapi("HealthResponse");

const route = {
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: healthResponseSchema,
        },
      },
      description: "Health check response",
    },
  },
} as const;

const app = new OpenAPIHono();

app.openapi(route, (c: Context) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export { app as healthRoutes };
