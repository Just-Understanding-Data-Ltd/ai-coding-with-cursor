import { serve } from "@hono/node-server";
import { app } from "./app";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [],
  tracesSampleRate: 1.0,
  profilesSampleRate: 0.0,
});

const port = process.env.PORT || 3001;

console.log(`Server is starting on port ${port}...`);

const server = serve({
  fetch: app.fetch,
  port: Number(port),
});

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
