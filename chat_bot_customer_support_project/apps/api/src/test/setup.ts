import { beforeAll, afterAll, afterEach } from "vitest";
import { serve } from "@hono/node-server";
import { app } from "../app";

let server: ReturnType<typeof serve>;

beforeAll(() => {
  const port = process.env.TEST_PORT || 3002;
  server = serve({
    fetch: app.fetch,
    port: Number(port),
  });
});

afterAll(() => {
  return new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

afterEach(() => {
  // Clean up any test data here
});
