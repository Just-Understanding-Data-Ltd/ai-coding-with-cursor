# Content Creator Assistant

A Next.js application that interacts with a Model Context Protocol (MCP) server to assist with content creation tasks.

## Features

- **Content Creation Prompts**: Generate content ideas, headlines, expand content, and rewrite in different tones
- **Resource References**: Access template resources like blog posts, email templates, and social media posts
- **Slash Commands**: Quickly access available prompts using `/` commands
- **Resource References**: Reference content resources using `@` symbol

## Setup

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Run the development server

```bash
npm run dev
```

## Architecture

The application consists of two main parts:

1. **Next.js Client Application**: A web interface for interacting with the MCP server
2. **MCP Server**: A content-focused server that provides prompts and resources

## Using the App

- Type `/` to access content creation prompts
- Type `@` to reference content templates
- Type a message to chat with the assistant

## Technology Stack

- Next.js 14 with App Router
- React 19
- Tailwind CSS
- shadcn/ui for UI components
- Model Context Protocol for content generation
