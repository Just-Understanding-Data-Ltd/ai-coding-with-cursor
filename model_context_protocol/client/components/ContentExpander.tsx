"use client";

import React, { useState } from "react";
import { Expand } from "lucide-react";
import Select from "react-select";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface ContentExpanderProps {
  initialContent?: string;
  onExpand?: (content: string, targetLength: string) => Promise<void>;
  onDone: (expandedContent: string) => void;
}

const lengthOptions = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

export function ContentExpander({
  initialContent = "",
  onDone,
}: ContentExpanderProps) {
  const [content, setContent] = useState(initialContent);
  const [targetLength, setTargetLength] = useState("medium");

  const handleDone = () => {
    onDone(targetLength);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-lg font-medium">
        <Expand className="h-5 w-5" />
        <h3>Content Expander</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Content to Expand
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter short content to expand..."
            className="w-full min-h-[100px] border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Target Length
          </label>
          <Select
            options={lengthOptions}
            value={lengthOptions.find(
              (option) => option.value === targetLength
            )}
            onChange={(option) => option && setTargetLength(option.value)}
            className="react-select"
            classNamePrefix="react-select"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onDone("")} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleDone} disabled={!content.trim()}>
            Use This Content
          </Button>
        </div>
      </div>
    </Card>
  );
}
