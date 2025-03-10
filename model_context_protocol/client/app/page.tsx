"use client";

import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-semibold">Content Creator Assistant</h1>
          <p className="text-sm opacity-80">
            Powered by Model Context Protocol
          </p>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4">
        <Chat />
      </div>

      <footer className="border-t py-4 text-center text-gray-500 text-sm">
        <p>
          Content Creation Assistant Demo | Using MCP for Content Generation
        </p>
      </footer>
    </main>
  );
}
