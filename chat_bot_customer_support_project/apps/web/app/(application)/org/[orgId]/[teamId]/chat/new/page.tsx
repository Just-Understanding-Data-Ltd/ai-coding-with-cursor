import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewChatPage({
  params,
}: {
  params: Promise<{
    orgId: string;
    teamId: string;
  }>;
}) {
  const { orgId, teamId } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found when creating a new chat");
    return redirect(`/org/${orgId}/${teamId}/chat`);
  }

  console.log("Creating new chat for team:", teamId);

  try {
    // Create a new chat with default settings
    const { data: newChat, error } = await supabase
      .from("chats")
      .insert({
        team_id: teamId,
        title: "New Chat",
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details || "No details provided");
      // Redirect to chat landing page on error
      return redirect(`/org/${orgId}/${teamId}/chat`);
    }

    if (!newChat || !newChat.id) {
      console.error("Failed to create chat: No chat data returned");
      return redirect(`/org/${orgId}/${teamId}/chat`);
    }

    console.log("Successfully created new chat with ID:", newChat.id);

    // Redirect to the new chat page
    return redirect(`/org/${orgId}/${teamId}/chat/${newChat.id}`);
  } catch (error) {
    console.error("Unexpected error creating chat:", error);
    return redirect(`/org/${orgId}/${teamId}/chat`);
  }
}
