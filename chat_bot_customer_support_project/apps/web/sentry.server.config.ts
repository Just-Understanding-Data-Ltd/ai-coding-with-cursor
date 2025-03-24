// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Set the environment
    environment: process.env.NODE_ENV || "development",

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Ignore ECONNRESET errors that commonly occur in Playwright tests
    ignoreErrors: ["Error: aborted", /ECONNRESET/i],
  });
}
