"use client";

import { useParams } from "next/navigation";

export default function TeamSocialAccountsPage() {
  const params = useParams();
  const { orgId, teamId } = params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Team Social Accounts</h1>
      <p className="text-gray-600">
        Connect and manage your team's social media accounts here...
      </p>
    </div>
  );
}
