"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useCreateChat } from "@repo/supabase";

interface NewChatButtonProps {
  orgId: string;
  teamId: string;
}

export default function NewChatButton({ orgId, teamId }: NewChatButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const { mutate: createChat, isPending: isCreating } = useCreateChat({
    supabase,
    options: {
      onSuccess: (newChat) => {
        router.push(`/org/${orgId}/${teamId}/chat/${newChat.id}`);
      },
    },
  });

  return (
    <Button
      onClick={() => createChat({ teamId, title: "New Chat" })}
      disabled={isCreating}
      data-testid="new-chat-button"
    >
      {isCreating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <PlusIcon className="h-4 w-4 mr-2" />
      )}
      New Chat
    </Button>
  );
}
