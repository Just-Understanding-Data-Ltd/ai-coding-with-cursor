export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  resourceReferences?: ResourceReference[];
  isLoading?: boolean;
  toolInvocations?: ToolInvocation[];
}

export interface ResourceReference {
  uri: string;
  name: string;
  content: string;
}

export interface Prompt {
  name: string;
  description: string;
  arguments: {
    name: string;
    description: string;
    required: boolean;
  }[];
}

export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ToolInvocation {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  result?: WeatherToolResult | unknown;
}

// Define weather tool result types for better type checking
export interface WeatherToolResult {
  location: string;
  temperature: number;
}
