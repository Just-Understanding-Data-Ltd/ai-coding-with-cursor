# MCP Chat Application with Tool Execution

This project demonstrates a chat application that integrates with the Model Context Protocol (MCP) server for tool execution, prompt handling, and resource management. The application includes a web client interface and an MCP server that provides various tools and prompts.

## Features

- Interactive chat interface with AI responses via OpenAI
- MCP integration for:
  - Custom prompts (content generation, headlines, rewriting)
  - Tools (weather tool for location-based weather data)
  - Resource management for content references
- Streaming responses for a natural chat experience
- Command palette for accessing prompts and tools

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- OpenAI API key (for AI responses)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd model_context_protocol
```

### 2. Set up the server

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Build the server
npm run build

# Return to the root directory
cd ..
```

### 3. Set up the client

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Create a .env.local file for your OpenAI API key
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local

# Return to the root directory
cd ..
```

### 4. Start the application

```bash
# Start the development server (from the root directory)
npm run dev
```

This command will start both the client and the MCP server. The client will be available at http://localhost:3000.

## Using the Application

### Chat Interface

- Type regular messages to interact with the AI assistant
- Use slash commands (`/`) to access prompts and tools
- Use @ symbol to reference resources in your messages

### Available Commands

- `/content-idea` - Generate content ideas for a specific topic
- `/headline-generator` - Create catchy headlines for your content
- `/rewrite-content` - Rewrite content to improve clarity
- `/content-expand` - Expand a short piece of content into a longer version
- `/weather` - Get weather information for a location

### Using the Weather Tool

1. Type `/weather` in the chat input
2. A form will appear asking for a location
3. Enter a location (e.g., "New York", "London", "Tokyo")
4. Submit the form
5. The application will fetch and display the weather information for that location

### Accessing Prompts

1. Type `/` followed by the prompt name (e.g., `/content-idea`)
2. Fill in the required parameters in the form that appears
3. Submit the form
4. The application will process your request and return a response

## Project Structure

- `/client` - Next.js web client
  - `/app` - Next.js application components and routes
  - `/components` - React components
  - `/lib` - Utility libraries and MCP client implementation
- `/server` - MCP server implementation
  - `/src` - Server source code
  - `/dist` - Compiled server code

## Troubleshooting

### Common Issues

1. **Connection Error**: If you see "Failed to connect to MCP server", ensure that:

   - The server is running
   - You've built the server with `npm run build`
   - No other process is using the same ports

2. **API Key Error**: If you see OpenAI API errors, ensure that:

   - You've created a `.env.local` file in the client directory
   - Your OpenAI API key is valid
   - The `.env.local` file is formatted correctly: `OPENAI_API_KEY=your_key_here`

3. **Tool Execution Error**: If tools don't work correctly, check that:
   - The server is running with tools capability enabled
   - The tool is properly registered in the server
   - The client is correctly sending tool parameters

## Development Notes

- The weather tool uses mock data. In a production environment, you would integrate with a real weather API.
- You can add more tools by extending the tools object in `server/src/index.ts` and implementing appropriate handlers.
- The MCP client in `client/lib/mcp-client.ts` can be extended to support additional MCP features.

## License

[MIT License](LICENSE)
