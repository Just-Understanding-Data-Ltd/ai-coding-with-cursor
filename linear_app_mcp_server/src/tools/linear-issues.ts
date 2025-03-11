import { LinearService } from "../services/linear.js";

/**
 * Format a Linear issue for better readability
 */
function formatIssue(issue) {
  return `
ID: ${issue.id}
Title: ${issue.title}
State: ${issue.state?.name || "Unknown"}
Priority: ${issue.priority !== null ? issue.priority : "None"}
${issue.description ? `Description: ${issue.description}` : ""}
URL: ${issue.url}
Created: ${new Date(issue.createdAt).toLocaleString()}
  `.trim();
}

/**
 * Convert issues to a formatted string
 */
function formatIssues(issues) {
  if (issues.length === 0) {
    return "No issues found.";
  }

  return issues
    .map((issue, index) => {
      return `Issue ${index + 1}:\n${formatIssue(issue)}`;
    })
    .join("\n\n");
}

/**
 * Initialize Linear tools
 */
export function initLinearTools(linearService) {
  return {
    /**
     * Tool schema and handler for fetching team issues
     */
    getTeamIssues: {
      name: "get-team-issues",
      description: "Fetch issues from the configured Linear team",
      handler: async ({ limit = 10 }, extra) => {
        try {
          // Ensure the limit is reasonable
          const safeLimit = Math.min(Math.max(1, limit), 50);

          const issues = await linearService.getTeamIssues(safeLimit);
          const formattedIssues = formatIssues(issues);

          return {
            content: [
              {
                type: "text" as const,
                text: formattedIssues,
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error fetching issues: ${
                  error.message || String(error)
                }`,
              },
            ],
          };
        }
      },
    },

    /**
     * Tool schema and handler for creating Linear issues
     */
    createIssue: {
      name: "create-issue",
      description: "Create a new issue in the configured Linear team",
      handler: async ({ title, description, priority }, extra) => {
        try {
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
                type: "text" as const,
                text: `Issue created successfully:\n\n${formatIssue(issue)}`,
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error creating issue: ${error.message || String(error)}`,
              },
            ],
          };
        }
      },
    },
  };
}
