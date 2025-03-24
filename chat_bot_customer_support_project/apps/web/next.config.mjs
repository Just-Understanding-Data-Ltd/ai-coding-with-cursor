import { withSentryConfig } from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Update this to include all the domains you want to allow
        hostname: "**",
      },
    ],
  },
  transpilePackages: [
    "@repo/supabase", // add your local library here
  ],
  reactStrictMode: false,
  experimental: {
    turbo: {
      // Configure Turbopack
      resolveAlias: {
        // Add any necessary aliases that might be in webpack config
      },
      resolveExtensions: [
        ".tsx",
        ".ts",
        ".jsx",
        ".js",
        ".json",
        ".css",
        ".scss",
        ".sass",
        ".mdx",
        ".mjs",
      ],
      // If there are any webpack loaders that need to be configured for Turbopack
      rules: {
        // Example: SVG handling if needed
        // '*.svg': {
        //   loaders: ['@svgr/webpack'],
        //   as: '*.js',
        // },
      },
    },
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.NEXT_PUBLIC_SENTRY_ORG,
  project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  // Add this section to address the warning about source maps
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
