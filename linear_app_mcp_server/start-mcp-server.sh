#!/bin/bash
# Helper script to start the Linear MCP server

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the project directory
cd "$SCRIPT_DIR"

# Start the server
node "$SCRIPT_DIR/dist/index.js" 