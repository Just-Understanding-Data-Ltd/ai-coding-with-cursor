import { LinearClient } from "@linear/sdk";
import { CONFIG } from "../config.js";

/**
 * Service for interacting with the Linear API
 */
export class LinearService {
  client;
  teamId;
  teamKey;
  actualTeamId: string | null = null;

  constructor() {
    // Initialize the Linear client using API key or OAuth token
    this.client = CONFIG.linear.oauthToken
      ? new LinearClient({ accessToken: CONFIG.linear.oauthToken })
      : new LinearClient({ apiKey: CONFIG.linear.apiKey });

    // Store the team key from the config
    this.teamKey = CONFIG.linear.teamId;
    this.teamId = CONFIG.linear.teamId;
  }

  /**
   * Find the team UUID by its key
   * @private
   */
  private async resolveTeamId(): Promise<string> {
    // If we already have the resolved team ID, return it
    if (this.actualTeamId) {
      return this.actualTeamId;
    }

    try {
      // Fetch all teams the user has access to
      const { nodes: teams } = await this.client.teams();

      // Find the team with the matching key
      const team = teams.find((team) => team.key === this.teamKey);

      if (!team) {
        throw new Error(`Team with key "${this.teamKey}" not found`);
      }

      // Store the actual UUID for future use
      this.actualTeamId = team.id;
      return team.id;
    } catch (error) {
      console.error("Error resolving team ID:", error);
      throw new Error(`Failed to resolve team ID: ${error.message}`);
    }
  }

  /**
   * Get issues from a specific team
   * @param limit Optional limit for the number of issues to fetch
   * @returns Promise resolving to an array of issues
   */
  async getTeamIssues(limit = 50) {
    try {
      // Resolve the team ID before making the API call
      const teamId = await this.resolveTeamId();

      const { nodes } = await this.client.issues({
        filter: {
          team: { id: { eq: teamId } },
        },
        first: limit,
      });

      return nodes;
    } catch (error) {
      console.error("Error fetching Linear issues:", error);
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  /**
   * Create a new issue in a specific team
   * @param title Issue title
   * @param description Issue description (optional)
   * @param priority Issue priority (optional, 0-4)
   * @returns The created issue
   */
  async createIssue(title, description, priority) {
    try {
      // Resolve the team ID before making the API call
      const teamId = await this.resolveTeamId();

      const issueInput = {
        title,
        description,
        teamId: teamId,
        ...(priority !== undefined && { priority }),
      };

      const issue = await this.client.createIssue(issueInput);

      if (!issue) {
        throw new Error("Issue creation failed - no issue returned");
      }

      return issue;
    } catch (error) {
      console.error("Error creating Linear issue:", error);
      throw new Error(`Failed to create issue: ${error.message}`);
    }
  }

  /**
   * Check if the Linear client is properly connected
   * @returns Promise resolving to a boolean
   */
  async isConnected() {
    try {
      const me = await this.client.viewer;

      // Additionally, try to resolve the team ID to ensure that's working too
      try {
        await this.resolveTeamId();
      } catch (error) {
        console.error("Team ID resolution failed:", error);
        return false;
      }

      return !!me.id;
    } catch (error) {
      console.error("Linear connection error:", error);
      return false;
    }
  }
}
