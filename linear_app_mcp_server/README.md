# Linear MCP Server

A Model Context Protocol (MCP) server that allows LLMs to interact with Linear issues. This server provides tools for fetching issues from a specific team and creating new issues.

## Features

- Fetch issues from a specified Linear team
- Create new issues in a specified Linear team
- MCP-compatible for use with Claude and other clients
- Environment-based configuration

## Prerequisites

- Node.js 16 or higher
- A Linear account with API key (or OAuth token)
- A Linear team ID

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/linear-mcp-server.git
   cd linear-mcp-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file and update it with your credentials:

   ```bash
   cp .env.example .env
   ```

   Then edit the `.env` file with your Linear API key and team ID.

4. Build the server:
   ```bash
   npm run build
   ```

## Configuration

Update the `.env` file with your specific configuration:

```
# Linear API Configuration
LINEAR_API_KEY=your_linear_api_key_here
LINEAR_TEAM_ID=your_team_id_here

# Set to "stdio" or "http"
MCP_TRANSPORT=stdio

# Only needed if using HTTP transport
MCP_HTTP_PORT=3000

# Logging level: debug, info, warn, error
LOG_LEVEL=info
```

### How to get your Linear API Key

1. Go to your Linear account settings
2. Navigate to "API" section
3. Click "Create Key" and copy the generated API key

### How to get your Linear Team ID

You can find your team ID in the URL when viewing a team in Linear. For example, in the URL `https://linear.app/your-org/team/TEAM_ID/...` the `TEAM_ID` parameter is your team's ID.

## Usage

### Running the server

```bash
npm start
```

### Usage with Claude for Desktop

1. Update your Claude for Desktop configuration file:

On macOS:

```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

On Windows:

```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

2. Add the Linear MCP Server to your configuration:

```json
{
  "mcpServers": {
    "linear": {
      "command": "node",
      "args": ["/absolute/path/to/linear-mcp-server/dist/index.js"]
    }
  }
}
```

3. Restart Claude for Desktop

### Using the Tools

Once connected to Claude or another MCP client, you can use the following tools:

1. **get-team-issues** - Gets issues from your configured Linear team

   - Parameter: `limit` (optional) - Maximum number of issues to fetch

2. **create-issue** - Creates a new issue in your configured Linear team
   - Parameters:
     - `title` (required) - Issue title
     - `description` (optional) - Issue description
     - `priority` (optional) - Issue priority (0-4, where 4 is urgent)

## Development

```bash
# Run in development mode
npm run dev

# Lint the code
npm run lint
```

## License

MIT
