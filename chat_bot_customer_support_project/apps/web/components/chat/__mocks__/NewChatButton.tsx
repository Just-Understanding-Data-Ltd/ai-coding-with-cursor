import React from "react";

export default function NewChatButton({
  orgId,
  teamId,
}: {
  orgId: string;
  teamId: string;
}) {
  return <button data-testid="mocked-new-chat-button">New Chat</button>;
}
