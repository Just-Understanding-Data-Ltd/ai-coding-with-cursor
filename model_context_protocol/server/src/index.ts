import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Define some content resources
const contentResources = {
  "blog-example": {
    uri: "content://blog-example",
    name: "Blog Post Example",
    description: "A sample blog post about productivity",
    text: `# 5 Ways to Boost Your Productivity

Working smarter, not harder, is the key to maximizing your productivity. Here are five proven strategies to help you get more done in less time:

## 1. Time Blocking
Dedicate specific blocks of time to specific tasks. This reduces context switching and helps maintain focus.

## 2. The Two-Minute Rule
If a task takes less than two minutes to complete, do it immediately rather than scheduling it for later.

## 3. Strategic Breaks
The Pomodoro Technique suggests working for 25 minutes, then taking a 5-minute break. Short breaks improve sustained concentration.

## 4. Environment Optimization
Create a workspace that minimizes distractions and supports your workflow.

## 5. Task Batching
Group similar tasks together to leverage momentum and reduce mental setup time.

Remember, productivity isn't about doing more things—it's about doing the right things efficiently.`,
    mimeType: "text/markdown",
  },
  "social-post": {
    uri: "content://social-post",
    name: "Social Media Post",
    description: "A LinkedIn post about leadership",
    text: `Leadership isn't about titles or corner offices. It's about inspiring others to reach their full potential.

The best leaders I've worked with share three qualities:

1️⃣ They listen more than they speak
2️⃣ They give credit and take responsibility 
3️⃣ They're committed to continuous learning

What qualities do you value most in leadership? 

#LeadershipThoughts #ProfessionalDevelopment`,
    mimeType: "text/plain",
  },
  "email-template": {
    uri: "content://email-template",
    name: "Email Template",
    description: "A follow-up email template after a meeting",
    text: `Subject: Follow-up: {{Meeting Topic}} Discussion

Hi {{Name}},

Thank you for taking the time to meet with me today to discuss {{Meeting Topic}}. I found our conversation about {{Specific Point}} particularly insightful.

To summarize the key points we discussed:
• {{Point 1}}
• {{Point 2}}
• {{Point 3}}

As we agreed, here are the next steps:
1. I will {{Action Item 1}} by {{Date}}
2. You will {{Action Item 2}} by {{Date}}
3. We will reconnect on {{Follow-up Date}} to discuss progress

If you have any questions or thoughts before then, please don't hesitate to reach out.

Best regards,
{{Your Name}}`,
    mimeType: "text/plain",
  },
};

// Define prompts
const prompts = {
  "content-idea": {
    name: "content-idea",
    description: "Generate content ideas for a specific topic",
    arguments: [
      {
        name: "topic",
        description: "The main topic to generate ideas for",
        required: true,
      },
      {
        name: "format",
        description: "Content format (blog, social, video, email, etc.)",
        required: true,
      },
      {
        name: "audience",
        description: "Target audience",
        required: false,
      },
    ],
  },
  "rewrite-content": {
    name: "rewrite-content",
    description: "Rewrite content to match a specific tone or style",
    arguments: [
      {
        name: "content",
        description: "The content to rewrite",
        required: true,
      },
      {
        name: "tone",
        description: "Desired tone (professional, casual, persuasive, etc.)",
        required: true,
      },
      {
        name: "goal",
        description: "The goal of the rewrite (simplify, enhance, etc.)",
        required: false,
      },
    ],
  },
  "headline-generator": {
    name: "headline-generator",
    description: "Generate attention-grabbing headlines for your content",
    arguments: [
      {
        name: "topic",
        description: "The topic of your content",
        required: true,
      },
      {
        name: "style",
        description: "Headline style (listicle, how-to, question, etc.)",
        required: false,
      },
      {
        name: "count",
        description: "Number of headlines to generate",
        required: false,
      },
    ],
  },
  "content-expand": {
    name: "content-expand",
    description:
      "Expand a short piece of content into a longer, more detailed version",
    arguments: [
      {
        name: "content",
        description: "The short content to expand",
        required: true,
      },
      {
        name: "target_length",
        description:
          "Target word count or length descriptor (short, medium, long)",
        required: false,
      },
      {
        name: "focus",
        description:
          "Areas to focus on when expanding (examples, data, stories)",
        required: false,
      },
    ],
  },
};

// Define tools
const tools = {
  weather: {
    name: "weather",
    description: "Get the current weather for a location",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The location to get weather for",
        },
      },
      required: ["location"],
    },
  },
};

// Create the server with explicit tool capabilities
const server = new Server(
  {
    name: "content-creator-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      prompts: {},
      tools: {
        // Explicitly enable tools capability
        callTool: true,
        listTools: true,
      },
    },
  }
);

// Handle listing resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: Object.values(contentResources).map((resource) => ({
      uri: resource.uri,
      name: resource.name,
      description: resource.description,
      mimeType: resource.mimeType,
    })),
  };
});

// Handle reading resources
server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
  const { uri } = request.params;
  const resource = Object.values(contentResources).find((r) => r.uri === uri);

  if (!resource) {
    throw new Error(`Resource not found: ${uri}`);
  }

  return {
    contents: [
      {
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: resource.text,
      },
    ],
  };
});

// Handle listing prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: Object.values(prompts),
  };
});

// Handle getting prompts
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  // Find and return the appropriate prompt template
  if (name === "content-idea") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate creative content ideas for a ${
              args.format || "blog post"
            } about ${args.topic || "technology"}. 
            
Please provide at least 5 unique ideas with brief descriptions of how each could be developed.`,
          },
        },
      ],
    };
  }

  if (name === "rewrite-content") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Rewrite the following content to match a ${
              args.tone || "professional"
            } tone:

${args.content || "Please provide content to rewrite."}

Please maintain the key information while adapting the style.`,
          },
        },
      ],
    };
  }

  if (name === "headline-generator") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate 5 attention-grabbing ${
              args.style || "creative"
            } headlines for content about:

${args.topic || "Please provide a topic for headlines."}`,
          },
        },
      ],
    };
  }

  if (name === "content-expand") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please expand this short content into a more detailed ${
              args.target_length || "medium-length"
            } piece:

${args.content || "Please provide content to expand."}

Focus on maintaining the original message while adding:

1. More detailed explanations
2. Supporting points
3. Relevant examples
4. Appropriate transitions
5. A stronger introduction and conclusion`,
          },
        },
      ],
    };
  }

  throw new Error(`Prompt not found: ${name}`);
});

// Handle listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("ListTools handler called - returning tools");
  return {
    tools: Object.values(tools),
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`CallTool handler called with params:`, request.params);

  const { name, arguments: args } = request.params;

  // Handle the weather tool
  if (name === "weather") {
    console.error(`Executing weather tool with args:`, args);
    const location = args?.location || "Unknown location";

    // Mock weather data - in a real implementation, you would call a weather API
    const weatherData = {
      location: location,
      temperature: Math.floor(Math.random() * 30) + 5, // Random temp between 5-35°C
      condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Stormy"][
        Math.floor(Math.random() * 5)
      ],
      humidity: Math.floor(Math.random() * 50) + 30, // Random humidity between 30-80%
      windSpeed: Math.floor(Math.random() * 30), // Random wind speed 0-30 km/h
    };

    // Format the response
    const weatherText = `
Weather for ${weatherData.location}:
Temperature: ${weatherData.temperature}°C
Condition: ${weatherData.condition}
Humidity: ${weatherData.humidity}%
Wind Speed: ${weatherData.windSpeed} km/h
    `.trim();

    console.error(`Weather response:`, weatherText);

    // Return the weather information
    return {
      content: [
        {
          type: "text",
          text: weatherText,
        },
      ],
    };
  }

  console.error(`Tool not found: ${name}`);
  throw new Error(`Tool not found: ${name}`);
});

async function main() {
  try {
    // Connect to transport
    const transport = new StdioServerTransport();

    // Log before connecting
    console.error("Connecting MCP server with tools...");

    // Connect the server
    await server.connect(transport);

    // Log successful connection
    console.error(
      "Content Creator MCP Server running with tools capability..."
    );

    // Log available tools
    console.error("Available tools:", Object.keys(tools));
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
