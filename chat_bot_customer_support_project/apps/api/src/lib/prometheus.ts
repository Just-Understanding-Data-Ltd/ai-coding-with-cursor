import express from "express";
import client from "prom-client";

// Create a Registry to register metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: "api",
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);

export function setupMetrics(app: express.Application): void {
  // Metrics endpoint
  app.get("/metrics", (_req, res, next) => {
    register
      .metrics()
      .then((metrics) => {
        res.set("Content-Type", register.contentType);
        res.end(metrics);
      })
      .catch(next);
  });
}
