import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ResourceReference, Prompt, Resource } from "@/app/types";

class MCPClient {
  private static instance: MCPClient;
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private isConnected = false;
  private prompts: Prompt[] = [];
  private resources: Resource[] = [];

  private constructor() {}

  public static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  public async connect(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    try {
      this.client = new Client(
        {
          name: "content-creator-client",
          version: "1.0.0",
        },
        {
          capabilities: {},
        }
      );

      this.transport = new StdioClientTransport({
        command: "node",
        args: ["../server/dist/index.js"],
      });

      await this.client.connect(this.transport);
      this.isConnected = true;

      // Fetch available prompts and resources
      await this.refreshPrompts();
      await this.refreshResources();

      return true;
    } catch (error) {
      console.error("Error connecting to MCP server:", error);
      this.isConnected = false;
      return false;
    }
  }

  public async refreshPrompts(): Promise<Prompt[]> {
    if (!this.client) {
      throw new Error("Client not initialized");
    }

    try {
      const result = await this.client.listPrompts();
      // Convert from SDK type to our interface
      this.prompts = (result.prompts || []).map((p) => ({
        name: p.name,
        description: p.description || "",
        arguments: (p.arguments || []).map((arg) => ({
          name: arg.name,
          description: arg.description || "",
          required: arg.required || false,
        })),
      }));
      return this.prompts;
    } catch (error) {
      console.error("Error fetching prompts:", error);
      return [];
    }
  }

  public async refreshResources(): Promise<Resource[]> {
    if (!this.client) {
      throw new Error("Client not initialized");
    }

    try {
      const result = await this.client.listResources();
      // Convert from SDK type to our interface
      this.resources = (result.resources || []).map((r) => ({
        uri: r.uri,
        name: r.name,
        description: r.description,
        mimeType: r.mimeType,
      }));
      return this.resources;
    } catch (error) {
      console.error("Error fetching resources:", error);
      return [];
    }
  }

  public getPrompts(): Prompt[] {
    return this.prompts;
  }

  public getResources(): Resource[] {
    return this.resources;
  }

  public async executePrompt(
    name: string,
    args: Record<string, string>
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Client not initialized");
    }

    try {
      const result = await this.client.getPrompt({
        name,
        arguments: args,
      });

      if (result.messages && result.messages.length > 0) {
        // Find the first assistant message
        const assistantMessage = result.messages.find(
          (msg) => msg.role === "assistant"
        );

        if (
          assistantMessage &&
          assistantMessage.content &&
          typeof assistantMessage.content === "object" &&
          "type" in assistantMessage.content &&
          assistantMessage.content.type === "text" &&
          "text" in assistantMessage.content
        ) {
          return assistantMessage.content.text || "";
        } else {
          return "No valid assistant message found in response";
        }
      } else {
        return "No messages returned for prompt";
      }
    } catch (error) {
      console.error(`Error executing prompt ${name}:`, error);
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  public async getResourceContent(
    uri: string
  ): Promise<ResourceReference | null> {
    if (!this.client) {
      throw new Error("Client not initialized");
    }

    // Find resource name from resource list
    const resource = this.resources.find((r) => r.uri === uri);
    if (!resource) {
      console.error(`Resource not found: ${uri}`);
      return null;
    }

    try {
      const result = await this.client.readResource({
        uri,
      });

      if (result.contents && result.contents.length > 0) {
        const content = result.contents[0];
        if ("text" in content && typeof content.text === "string") {
          return {
            uri: content.uri,
            name: resource.name,
            content: content.text,
          };
        } else {
          console.error("Binary content not supported");
          return null;
        }
      } else {
        console.error("No content returned for resource");
        return null;
      }
    } catch (error) {
      console.error(`Error fetching resource ${uri}:`, error);
      return null;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.transport) {
      this.transport.close();
      this.transport = null;
    }
    this.client = null;
    this.isConnected = false;
  }
}

// Export the singleton instance
export default MCPClient.getInstance();
