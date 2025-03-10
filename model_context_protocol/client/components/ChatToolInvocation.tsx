import React from "react";
import { Cloud } from "lucide-react";
import { ToolInvocation, WeatherToolResult } from "../app/types";

interface ChatToolInvocationProps {
  toolInvocation: ToolInvocation;
}

export const ChatToolInvocation: React.FC<ChatToolInvocationProps> = ({
  toolInvocation,
}) => {
  const { tool, args, result } = toolInvocation;

  if (tool === "weather" && result) {
    // Cast result to WeatherToolResult for better type safety
    const weatherResult = result as WeatherToolResult;

    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-2">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="h-4 w-4 text-blue-500" />
          <h4 className="font-medium text-sm">Weather Tool</h4>
        </div>
        <div className="text-sm">
          <div>
            <strong>Location:</strong> {String(args.location)}
          </div>
          {weatherResult && (
            <div className="mt-1">
              <strong>Result:</strong> {weatherResult.temperature}°F in{" "}
              {weatherResult.location}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Generic tool display for other tools
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-2">
      <h4 className="font-medium text-sm mb-1">Tool: {tool}</h4>
      <div className="text-xs font-mono overflow-x-auto">
        <div>
          <strong>Args:</strong> {String(JSON.stringify(args))}
        </div>
        {result && (
          <div className="mt-1">
            <strong>Result:</strong> {String(JSON.stringify(result))}
          </div>
        )}
      </div>
    </div>
  );
};
