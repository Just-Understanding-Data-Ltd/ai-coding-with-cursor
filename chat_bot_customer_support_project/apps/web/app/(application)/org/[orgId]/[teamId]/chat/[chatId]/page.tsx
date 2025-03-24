import { dehydrate } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/react-query";
import { createClient } from "@/utils/supabase/server";
import ChatClient from "@/components/chat/ChatClient";

export default async function ChatPage({
  params,
}: {
  params: Promise<{
    chatId: string;
    orgId: string;
    teamId: string;
  }>;
}) {
  const queryClient = createQueryClient();
  const { chatId, orgId, teamId } = await params;
  const supabase = await createClient();

  // Prefetch chat data directly
  await queryClient.prefetchQuery({
    queryKey: ["chats", "detail", chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();

      if (error) {
        console.error("Error fetching chat:", error);
        return null;
      }

      return data;
    },
  });

  // Prefetch messages directly
  await queryClient.prefetchQuery({
    queryKey: ["messages", "list", chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }

      return data || [];
    },
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <ChatClient
      dehydratedState={dehydratedState}
      chatId={chatId}
      orgId={orgId}
      teamId={teamId}
    />
  );
}
