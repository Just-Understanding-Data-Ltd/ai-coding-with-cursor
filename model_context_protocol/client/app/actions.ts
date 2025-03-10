"use server";

import { Prompt, Resource, ResourceReference } from "./types";
import { MCPClient } from "@/lib/mcp-client";
let prompts: Prompt[] = [];
let resources: Resource[] = [];

// Server action to connect to the MCP server
export async function connect(): Promise<boolean> {
  try {
    await MCPClient.getInstance().connect();
    return true;
  } catch (error) {
    console.error("Connection error:", error);
    return false;
  }
}

// Server action to refresh the list of available prompts
export async function refreshPrompts(): Promise<Prompt[]> {
  try {
    const mcpClient = MCPClient.getInstance();
    const result = await mcpClient.getPrompts();
    prompts = result; // Update the global prompts variable
    return result;
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return [];
  }
}

// Server action to refresh the list of available resources
export async function refreshResources(): Promise<Resource[]> {
  try {
    console.log("Refreshing resources from MCP server...");
    const mcpClient = MCPClient.getInstance();
    const result = await mcpClient.getResources();
    console.log(`Refreshed ${result.length} resources:`, result);
    return result;
  } catch (error) {
    console.error("Error fetching resources:", error);
    return [];
  }
}

// Server action to get the list of prompts
export async function getPrompts(): Promise<Prompt[]> {
  if (prompts.length === 0) {
    const refreshedPrompts = await refreshPrompts();
    prompts = refreshedPrompts; // Update the global prompts variable
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
    const mcpClient = MCPClient.getInstance();
    const result = await mcpClient.executePrompt(name, args);
    return result;
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
    const refreshedResources = await refreshResources();
    resources = refreshedResources; // Update the global variable
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
    const refreshedResources = await refreshResources();
    resources = refreshedResources; // Update the global variable
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
    const mcpClient = MCPClient.getInstance();
    const result = await mcpClient.getResourceContent(uri);
    return result;
  } catch (error) {
    console.error(`Error fetching resource ${uri}:`, error);
    return null;
  }
}

// Server action to close the connection
export async function disconnect(): Promise<void> {
  await MCPClient.getInstance().disconnect();
}
