"use client";

import { useTeams } from "@repo/supabase";
import { createClient } from "@/utils/supabase/client";
import Select from "react-select";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { components } from "react-select";

interface WorkspaceSelectorProps {
  currentOrganizationId: string;
  currentWorkspaceId?: string;
}

export function WorkspaceSelector({
  currentOrganizationId,
  currentWorkspaceId,
}: WorkspaceSelectorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(
    currentWorkspaceId || null
  );

  const { data: workspaces = [] } = useTeams({
    organizationId: currentOrganizationId,
    supabase,
    options: {
      staleTime: 30000, // Consider data fresh for 30 seconds
      refetchOnMount: false, // Don't refetch when component mounts
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
    },
  });

  const workspaceOptions = workspaces.map((workspace) => ({
    value: workspace.id,
    label: workspace.name,
  }));

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setSelectedWorkspace(currentWorkspaceId || null);
    }
    return () => {
      mounted = false;
    };
  }, [currentWorkspaceId]);

  const handleWorkspaceChange = (option: any) => {
    if (option) {
      setSelectedWorkspace(option.value);
      router.push(`/org/${currentOrganizationId}/${option.value}`);
    }
  };

  return (
    <div className="px-3 py-2">
      <Select
        value={workspaceOptions.find((opt) => opt.value === selectedWorkspace)}
        onChange={handleWorkspaceChange}
        options={workspaceOptions}
        placeholder="Select Workspace"
        isSearchable
        className="workspace-selector"
        classNamePrefix="workspace-select"
        instanceId="workspace-selector"
        components={{
          Input: (props) => (
            <components.Input
              {...props}
              aria-activedescendant={
                props["aria-activedescendant"] || undefined
              }
            />
          ),
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "var(--primary)",
            primary75: "var(--primary-foreground)",
            primary50: "var(--accent)",
            primary25: "var(--accent)",
            neutral0: "var(--background)",
            neutral5: "var(--accent)",
            neutral10: "var(--accent)",
            neutral20: "var(--border)",
            neutral30: "var(--border)",
            neutral40: "var(--muted-foreground)",
            neutral50: "var(--muted-foreground)",
            neutral60: "var(--foreground)",
            neutral70: "var(--foreground)",
            neutral80: "var(--foreground)",
            neutral90: "var(--foreground)",
          },
        })}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
              ? "var(--accent)"
              : "var(--background)",
            color: "var(--foreground)",
            "&:active": {
              backgroundColor: "var(--accent)",
            },
          }),
        }}
      />
    </div>
  );
}
