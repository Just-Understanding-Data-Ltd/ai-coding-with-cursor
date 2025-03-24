// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

/* 
Disable Sentry during CI (This environment variable is set 
by the CI/CD pipeline via Github Actions)
*/
const isCI = process.env.CI === "true";

if (!isCI) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,

    // Ignore ECONNRESET errors that commonly occur in Playwright tests
    ignoreErrors: ["Error: aborted", /ECONNRESET/i],

    // Define how likely traces are sampled
    tracesSampleRate: 1,

    // Set the environment
    environment: process.env.NODE_ENV || "development",

    // Setting this option to true will print useful information
    debug: false,
  });
}
