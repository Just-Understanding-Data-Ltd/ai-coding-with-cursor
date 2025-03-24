"use client";

import { useParams } from "next/navigation";

export default function TeamInboxPage() {
  const params = useParams();
  const { orgId, teamId } = params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Team Inbox</h1>
      <p className="text-gray-600">Team inbox functionality coming soon...</p>
    </div>
  );
}
