import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { Team } from "@repo/supabase";

interface UseWorkspacesProps {
  organizationId: string;
}

interface UseWorkspacesResult {
  workspaces: Team[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and manage workspaces for an organization
 */
export function useWorkspaces({
  organizationId,
}: UseWorkspacesProps): UseWorkspacesResult {
  const [workspaces, setWorkspaces] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadWorkspaces() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .eq("organization_id", organizationId);

        if (error) throw error;
        setWorkspaces(data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load workspaces:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load workspaces")
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkspaces();
  }, [organizationId]);

  return { workspaces, isLoading, error };
}
