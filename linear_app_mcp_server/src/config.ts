import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Load environment variables from .env file with absolute path
config({ path: path.resolve(projectRoot, ".env") });

// Parse environment variables
export const CONFIG = {
  linear: {
    apiKey: process.env.LINEAR_API_KEY || "",
    teamId: process.env.LINEAR_TEAM_ID || "",
    oauthToken: process.env.LINEAR_OAUTH_TOKEN,
  },
  mcp: {
    transport: process.env.MCP_TRANSPORT || "stdio",
    httpPort: process.env.MCP_HTTP_PORT
      ? parseInt(process.env.MCP_HTTP_PORT, 10)
      : undefined,
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};
