import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CONFIG } from "./config.js";
import { LinearService } from "./services/linear.js";
import { initLinearTools } from "./tools/linear-issues.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Helper to log to a file for debugging
function logToFile(message) {
  const logFile = path.join(projectRoot, "mcp-debug.log");
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.error(message);
}

async function main() {
  try {
    logToFile("Starting Linear MCP Server...");
    logToFile(`Current directory: ${process.cwd()}`);
    logToFile(`Project root: ${projectRoot}`);
    logToFile(
      `Environment variables loaded: LINEAR_API_KEY=${
        CONFIG.linear.apiKey ? "set" : "not set"
      }, LINEAR_TEAM_ID=${CONFIG.linear.teamId ? "set" : "not set"}`
    );

    // Initialize the Linear service
    const linearService = new LinearService();

    // Check if Linear connection is working
    const isConnected = await linearService.isConnected();
    if (!isConnected) {
      logToFile(
        "Failed to connect to Linear API. Please check your API key or OAuth token."
      );
      process.exit(1);
    }

    logToFile("Successfully connected to Linear API");

    // Create the MCP server
    const server = new McpServer({
      name: "Linear Issue Manager",
      version: "1.0.0",
    });

    // Get Linear tools
    const linearTools = initLinearTools(linearService);

    // Register tools using MCP SDK format
    logToFile("Registering get-team-issues tool");
    server.tool(
      "get-team-issues",
      "Fetch issues from the configured Linear team",
      {
        limit: z
          .number()
          .optional()
          .describe("Maximum number of issues to fetch (default: 10)"),
      },
      async (args, extra) => {
        try {
          const limit = args.limit || 10;
          // Ensure the limit is reasonable
          const safeLimit = Math.min(Math.max(1, limit), 50);

          const issues = await linearService.getTeamIssues(safeLimit);

          return {
            content: [
              {
                type: "text",
                text:
                  issues.length === 0
                    ? "No issues found."
                    : issues
                        .map((issue, index) => {
                          return `Issue ${index + 1}:\nID: ${
                            issue.id
                          }\nTitle: ${issue.title}\nState: ${
                            issue.state?.name || "Unknown"
                          }\nPriority: ${
                            issue.priority !== null ? issue.priority : "None"
                          }\n${
                            issue.description
                              ? `Description: ${issue.description}`
                              : ""
                          }\nURL: ${issue.url}\nCreated: ${new Date(
                            issue.createdAt
                          ).toLocaleString()}`;
                        })
                        .join("\n\n"),
              },
            ],
          };
        } catch (error) {
          logToFile(
            `Error in get-team-issues handler: ${
              error.message || String(error)
            }`
          );
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Error fetching issues: ${
                  error.message || String(error)
                }`,
              },
            ],
          };
        }
      }
    );

    logToFile("Registering create-issue tool");
    server.tool(
      "create-issue",
      "Create a new issue in the configured Linear team",
      {
        title: z.string().describe("Title of the issue"),
        description: z
          .string()
          .optional()
          .describe("Description of the issue (optional)"),
        priority: z
          .number()
          .min(0)
          .max(4)
          .optional()
          .describe(
            "Priority of the issue (0-4, where 0 is no priority and 4 is urgent)"
          ),
      },
      async (args, extra) => {
        try {
          const { title, description, priority } = args;
          // Validate priority if provided
          let validatedPriority = undefined;
          if (priority !== undefined) {
            validatedPriority = Math.min(Math.max(0, priority), 4);
          }

          const issue = await linearService.createIssue(
            title,
            description,
            validatedPriority
          );

          return {
            content: [
              {
                type: "text",
                text: `Issue created successfully:\n\nID: ${issue.id}\nTitle: ${
                  issue.title
                }\nState: ${issue.state?.name || "Unknown"}\nPriority: ${
                  issue.priority !== null ? issue.priority : "None"
                }\n${
                  issue.description ? `Description: ${issue.description}` : ""
                }\nURL: ${issue.url}\nCreated: ${new Date(
                  issue.createdAt
                ).toLocaleString()}`,
              },
            ],
          };
        } catch (error) {
          logToFile(
            `Error in create-issue handler: ${error.message || String(error)}`
          );
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Error creating issue: ${error.message || String(error)}`,
              },
            ],
          };
        }
      }
    );

    // Set up transport based on configuration
    let transport;
    if (CONFIG.mcp.transport === "stdio") {
      logToFile("Using stdio transport");
      transport = new StdioServerTransport();
    } else {
      // For future HTTP transport support
      logToFile(`Transport ${CONFIG.mcp.transport} not implemented`);
      process.exit(1);
    }

    // Connect the server to the transport
    logToFile("Connecting server to transport...");
    try {
      await server.connect(transport);
      logToFile("Linear MCP Server running");
    } catch (err) {
      logToFile(`Error connecting to transport: ${err.message || String(err)}`);
      throw err;
    }

    // Handle shutdown gracefully
    process.on("SIGINT", async () => {
      logToFile("Shutting down...");

      try {
        await server.close();
      } catch (error) {
        logToFile(`Error during shutdown: ${error.message || String(error)}`);
      }

      process.exit(0);
    });
  } catch (error) {
    logToFile(`Fatal error starting server: ${error.message || String(error)}`);
    logToFile(error.stack || "No stack trace available");
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error("Unhandled error:", error);
  if (fs.existsSync(path.join(projectRoot, "mcp-debug.log"))) {
    fs.appendFileSync(
      path.join(projectRoot, "mcp-debug.log"),
      `Unhandled error: ${error.message || String(error)}\n${
        error.stack || "No stack trace"
      }\n`
    );
  }
  process.exit(1);
});
