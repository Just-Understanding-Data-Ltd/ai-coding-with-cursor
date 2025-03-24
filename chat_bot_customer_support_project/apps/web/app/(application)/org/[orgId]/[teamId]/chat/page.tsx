import { dehydrate } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/react-query";
import { createClient } from "@/utils/supabase/server";
import { MessageSquare } from "lucide-react";
import NewChatButton from "@/components/chat/NewChatButton";

export default async function ChatLandingPage({
  params,
}: {
  params: Promise<{
    orgId: string;
    teamId: string;
  }>;
}) {
  const queryClient = createQueryClient();
  const { orgId, teamId } = await params;
  const supabase = await createClient();

  // Prefetch chats list directly
  await queryClient.prefetchQuery({
    queryKey: ["chats", "list", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("team_id", teamId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching chats:", error);
        return [];
      }

      return data || [];
    },
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6">
      <div className="max-w-md text-center">
        <MessageSquare className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Welcome to Chat</h1>
        <p className="text-muted-foreground mb-6">
          Start a new conversation or select an existing chat from the sidebar.
        </p>
        <NewChatButton orgId={orgId} teamId={teamId} />
      </div>
    </div>
  );
}
