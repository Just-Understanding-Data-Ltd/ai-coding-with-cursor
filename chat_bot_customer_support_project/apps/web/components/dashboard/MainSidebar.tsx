"use client";

import { User } from "@supabase/supabase-js";
import { getDashboardConfig } from "@/config";
import {
  Sidebar,
  SidebarContent as UISidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { UserDropdown } from "./UserDropdown";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getMemberRoles } from "@/features/authorization/actions/get-member-roles";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { Button } from "@/components/ui/button";
import { PlusIcon, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";

interface MainSidebarProps {
  user: User;
  currentOrganizationId: string;
  role: Awaited<ReturnType<typeof getMemberRoles>>;
}

// Define interface for chats
interface Chat {
  id: string;
  title: string;
  team_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function MainSidebar({
  user,
  currentOrganizationId,
  role,
}: MainSidebarProps) {
  // To avoid hydration errors, use static initial rendering
  return (
    <Sidebar className="border-r" data-testid="main-sidebar">
      <SidebarHeader className="border-b px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {/* Use a static string first, will be updated by ClientSideContent */}
            Workspaces
          </h2>
        </div>
      </SidebarHeader>
      <UISidebarContent className="flex flex-col">
        <ClientSideContent
          user={user}
          currentOrganizationId={currentOrganizationId}
          role={role}
        />
      </UISidebarContent>
      <SidebarFooter className="border-t p-3">
        <UserDropdown
          user={user}
          role={role}
          currentOrganizationId={currentOrganizationId}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

// This component contains all client-side logic and rendering
// to avoid hydration mismatches
function ClientSideContent({
  user,
  currentOrganizationId,
  role,
}: MainSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { sidebarNavItems } = getDashboardConfig();

  // Set up client-side state once mounted
  useEffect(() => {
    setMounted(true);
    // Update header title based on path
    const headerEl = document.querySelector('[data-testid="main-sidebar"] h2');
    if (headerEl) {
      headerEl.textContent = pathname.includes("/chat")
        ? "Chats"
        : "Workspaces";
    }
  }, [pathname]);

  // Only render client content when mounted
  if (!mounted)
    return (
      <WorkspaceSelector
        currentOrganizationId={currentOrganizationId}
        currentWorkspaceId={""}
      />
    );

  // Extract current workspace ID from URL if it exists
  const currentWorkspaceId = pathname
    .split("/")
    .find((segment, index, array) => {
      const prevSegment = array[index - 1];
      return prevSegment === currentOrganizationId;
    });

  // Determine if we're on a chat page
  const isChatPage = pathname.includes("/chat");

  // Filter out the home icon and any items that should be hidden
  const filteredNavItems = sidebarNavItems.filter((item) => {
    // Keep all navigation items, including Chat
    return item.title !== "Workspaces";
  });

  return (
    <>
      {!isChatPage && (
        <WorkspaceSelector
          currentOrganizationId={currentOrganizationId}
          currentWorkspaceId={currentWorkspaceId}
        />
      )}

      {isChatPage && currentWorkspaceId ? (
        <ChatSidebar
          user={user}
          currentOrganizationId={currentOrganizationId}
          currentWorkspaceId={currentWorkspaceId}
          pathname={pathname}
        />
      ) : (
        // Show regular nav items when not on chat page
        <>
          {currentWorkspaceId && (
            <div className="px-3 py-2">
              <SidebarMenu>
                {filteredNavItems.map((item) => {
                  // Special handling for Chat item to ensure it points to the chat landing page
                  let href;
                  if (item.title === "Chat") {
                    href = `/org/${currentOrganizationId}/${currentWorkspaceId}/chat`;
                  } else {
                    href = item.href.includes("[teamId]")
                      ? `/org/${currentOrganizationId}/${item.href.replace("[teamId]", currentWorkspaceId || "")}`
                      : `/org/${currentOrganizationId}/${item.href}`;
                  }

                  const isActive =
                    pathname === href ||
                    (item.title === "Chat" && pathname.includes("/chat")) ||
                    pathname.endsWith(
                      item.href.replace("[teamId]", currentWorkspaceId || "")
                    );

                  // Don't render team-specific links if no workspace is selected
                  if (item.href.includes("[teamId]") && !currentWorkspaceId) {
                    return null;
                  }

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          isActive && "bg-accent text-accent-foreground"
                        )}
                        data-testid={`sidebar-menu-${item.title.toLowerCase()}`}
                      >
                        <Link href={href} prefetch={true}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          )}
        </>
      )}
    </>
  );
}

// This component handles the chat-specific sidebar content
function ChatSidebar({
  user,
  currentOrganizationId,
  currentWorkspaceId,
  pathname,
}: {
  user: User;
  currentOrganizationId: string;
  currentWorkspaceId: string;
  pathname: string;
}) {
  // Remove the creation of a new QueryClient and directly render the content
  return (
    <ChatSidebarContent
      user={user}
      currentOrganizationId={currentOrganizationId}
      currentWorkspaceId={currentWorkspaceId}
      pathname={pathname}
    />
  );
}

function ChatSidebarContent({
  user,
  currentOrganizationId,
  currentWorkspaceId,
  pathname,
}: {
  user: User;
  currentOrganizationId: string;
  currentWorkspaceId: string;
  pathname: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Use React Query to fetch chats
  const {
    data: chats = [],
    isLoading: isLoadingChats,
    error: chatsError,
    refetch: refetchChats,
  } = useQuery<Chat[]>({
    queryKey: ["chats", "list", currentWorkspaceId],
    queryFn: async () => {
      console.log("Fetching chats for team:", currentWorkspaceId || "");
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("team_id", currentWorkspaceId || "")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching chats:", error);
        return [];
      }

      console.log("Fetched chats:", data);
      return data || [];
    },
    staleTime: 0, // Always consider data stale to allow immediate refetching
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch whenever component mounts
  });

  // Log chat error if any
  useEffect(() => {
    if (chatsError) {
      console.error("Chat query error:", chatsError);
    }
  }, [chatsError]);

  // Add a useEffect to refetch chats when pathname changes
  useEffect(() => {
    // When pathname changes (like after a chat creation or deletion)
    console.log("Path changed, refetching chats");
    refetchChats();
  }, [pathname, refetchChats]);

  // Create chat mutation
  const createChatMutation = useMutation({
    mutationFn: async ({
      teamId,
      title,
      userId,
    }: {
      teamId: string;
      title: string;
      userId: string;
    }) => {
      console.log("Creating chat with:", { teamId, title, userId });
      const { data, error } = await supabase
        .from("chats")
        .insert({
          team_id: teamId,
          title,
          created_by: userId,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Error creating chat:", error);
        throw error;
      }
      console.log("Chat created:", data);
      return data as Chat;
    },
    onSuccess: () => {
      // Refetch chats after creating a new one
      refetchChats();
    },
  });

  const handleCreateNewChat = async () => {
    if (!currentWorkspaceId || isCreatingChat) return;

    setIsCreatingChat(true);
    try {
      const newChat = await createChatMutation.mutateAsync({
        teamId: currentWorkspaceId,
        userId: user.id,
        title: "New Chat",
      });

      // Navigate to the new chat
      router.push(
        `/org/${currentOrganizationId}/${currentWorkspaceId}/chat/${newChat.id}`
      );
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <>
      <div className="px-3 pt-4 pb-2">
        <Button
          onClick={handleCreateNewChat}
          className="w-full justify-start"
          variant="outline"
          size="sm"
          disabled={isCreatingChat || !currentWorkspaceId}
          data-testid="new-chat-button"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <SidebarGroup className="mt-2">
        <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground">
          Recent Chats
        </SidebarGroupLabel>
        <SidebarGroupContent className="mt-1">
          <SidebarMenu>
            {isLoadingChats ? (
              // Show skeletons while loading
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full mb-2 mx-3" />
              ))
            ) : chats && chats.length > 0 ? (
              // Show chats
              chats.map((chat: Chat) => {
                const chatUrl = `/org/${currentOrganizationId}/${currentWorkspaceId}/chat/${chat.id}`;
                const isActive = pathname.includes(chat.id);

                return (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "w-full justify-start gap-2 rounded-lg text-sm font-medium",
                        "hover:bg-accent hover:text-accent-foreground truncate",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                      data-testid={`chat-item-${chat.id}`}
                    >
                      <Link href={chatUrl} prefetch={true}>
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="truncate">{chat.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })
            ) : (
              // Empty state
              <div className="text-center py-4 px-3 text-sm text-muted-foreground">
                No chats yet
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
