"use server";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Prompt, Resource, ResourceReference } from "./types";

// Keep a singleton client instance
let client: Client | null = null;
let transport: StdioClientTransport | null = null;
let isConnected = false;
let prompts: Prompt[] = [];
let resources: Resource[] = [];

// Initialize and get the MCP client
async function getClient(): Promise<Client> {
  if (client && isConnected) {
    return client;
  }

  try {
    console.log("Initializing MCP client...");
    client = new Client(
      {
        name: "content-creator-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    console.log("Creating transport...");
    transport = new StdioClientTransport({
      command: "node",
      args: ["../server/dist/index.js"],
    });

    console.log("Connecting to MCP server...");
    await client.connect(transport);
    isConnected = true;
    console.log("Successfully connected to MCP server");

    // Fetch available prompts and resources
    console.log("Fetching initial prompts and resources...");
    await refreshPrompts();
    await refreshResources();

    return client;
  } catch (error) {
    console.error("Error connecting to MCP server:", error);
    // Try to clean up any failed connection
    if (transport) {
      try {
        transport.close();
      } catch (closeError) {
        console.error("Error closing transport:", closeError);
      }
      transport = null;
    }
    client = null;
    isConnected = false;
    throw new Error(`Failed to connect to MCP server: ${error}`);
  }
}

// Server action to connect to the MCP server
export async function connect(): Promise<boolean> {
  try {
    await getClient();
    return true;
  } catch (error) {
    console.error("Connection error:", error);
    return false;
  }
}

// Server action to refresh the list of available prompts
export async function refreshPrompts(): Promise<Prompt[]> {
  try {
    const mcpClient = await getClient();
    const result = await mcpClient.listPrompts();

    // Convert from SDK type to our interface
    prompts = (result.prompts || []).map((p) => ({
      name: p.name,
      description: p.description || "",
      arguments: (p.arguments || []).map((arg) => ({
        name: arg.name,
        description: arg.description || "",
        required: arg.required || false,
      })),
    }));

    return prompts;
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return [];
  }
}

// Server action to refresh the list of available resources
export async function refreshResources(): Promise<Resource[]> {
  try {
    console.log("Refreshing resources from MCP server...");
    const mcpClient = await getClient();
    const result = await mcpClient.listResources();

    console.log("Raw resources result:", result);

    // Convert from SDK type to our interface
    resources = (result.resources || []).map((r) => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType,
    }));

    console.log(`Refreshed ${resources.length} resources:`, resources);

    return resources;
  } catch (error) {
    console.error("Error fetching resources:", error);
    return [];
  }
}

// Server action to get the list of prompts
export async function getPrompts(): Promise<Prompt[]> {
  if (prompts.length === 0) {
    await refreshPrompts();
  }
  return prompts;
}

// Server action to get the list of resources
export async function getResources(): Promise<Resource[]> {
  if (resources.length === 0) {
    await refreshResources();
  }
  return resources;
}

// Server action to execute a prompt
export async function executePrompt(
  name: string,
  args: Record<string, string>
): Promise<string> {
  try {
    const mcpClient = await getClient();
    const result = await mcpClient.getPrompt({
      name,
      arguments: args,
    });

    // Get the prompt response
    // Since we're now using Claude directly, we need to send the user's request from the prompt
    // and let Claude generate the response
    if (result.messages && result.messages.length > 0) {
      // Find the first user message
      const userMessage = result.messages.find((msg) => msg.role === "user");

      if (
        userMessage &&
        userMessage.content &&
        typeof userMessage.content === "object" &&
        "type" in userMessage.content &&
        userMessage.content.type === "text" &&
        "text" in userMessage.content
      ) {
        // Execute the prompt with the Anthropic API
        // For this example, we'll use a simple placeholder response
        // In a real implementation, you would use the Anthropic API or similar
        const promptText = userMessage.content.text || "";

        // Placeholder: In a real implementation, send the prompt to an AI model like Claude
        // For now, return the prompt text with a simple response prefix
        return `Response to prompt "${name}":\n\n${promptText}`;
      } else {
        return "No valid user message found in prompt";
      }
    } else {
      return "No messages returned for prompt";
    }
  } catch (error) {
    console.error(`Error executing prompt ${name}:`, error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Server action to get resource content
export async function getResourceContent(
  uri: string
): Promise<ResourceReference | null> {
  console.log(`Attempting to fetch resource with URI: ${uri}`);

  // If resources array is empty, refresh resources first
  if (resources.length === 0) {
    console.log("Resources array is empty, refreshing resources...");
    await refreshResources();
  }

  console.log(
    `Available resources after potential refresh:`,
    resources.map((r) => ({ name: r.name, uri: r.uri }))
  );

  // Find resource name from resource list
  let resource = resources.find((r) => r.uri === uri);
  if (!resource) {
    console.error(`Resource not found: ${uri}`);
    console.error(
      `No resource found with URI: ${uri} in ${resources.length} available resources`
    );

    // Try one more time with a fresh resource list
    console.log("Trying one more time with a fresh resource list...");
    await refreshResources();
    const refreshedResource = resources.find((r) => r.uri === uri);

    if (!refreshedResource) {
      console.error(`Still no resource found with URI: ${uri} after refresh`);
      return null;
    } else {
      console.log(`Found resource after refresh: ${refreshedResource.name}`);
      resource = refreshedResource;
    }
  }

  try {
    console.log(`Found resource: ${resource.name}, fetching content...`);
    const mcpClient = await getClient();
    const result = await mcpClient.readResource({
      uri,
    });

    console.log(`readResource result:`, result);

    if (result.contents && result.contents.length > 0) {
      const content = result.contents[0];
      if ("text" in content && typeof content.text === "string") {
        console.log(
          `Successfully retrieved text content for resource: ${resource.name}`
        );
        return {
          uri: content.uri,
          name: resource.name,
          content: content.text,
        };
      } else {
        console.error("Binary content not supported", content);
        return null;
      }
    } else {
      console.error("No content returned for resource", result);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching resource ${uri}:`, error);
    return null;
  }
}

// Server action to close the connection
export async function disconnect(): Promise<void> {
  if (transport) {
    transport.close();
    transport = null;
  }
  client = null;
  isConnected = false;
}
