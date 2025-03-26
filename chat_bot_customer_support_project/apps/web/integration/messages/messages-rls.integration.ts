import { describe, it, expect, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  createTestUser,
  createTestOrganization,
  createTestMember,
  createChat,
  createMessage,
} from "@repo/supabase";
import {
  createAuthenticatedClient,
  createAuthenticatedClientForScenario,
} from "../test-utils";
import { IntegrationUserScenarioId } from "../types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@repo/supabase";

describe("Messages Table RLS Policies", () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  describe("Authenticated Users", () => {
    let user1: any, user2: any;
    let team1: string;
    let org1: any;
    let token1: string, token2: string;
    let authenticatedClientUser1: SupabaseClient<Database>;
    let authenticatedClientUser2: SupabaseClient<Database>;
    let chatIdUser1: string;
    let messageIdUser1: string;

    // Setup test data
    beforeEach(async () => {
      // Create first user with organization and team
      const result1 = await createTestUser({});
      user1 = result1.user;
      token1 = result1.token;
      authenticatedClientUser1 = createAuthenticatedClient(token1);

      const orgResult1 = await createTestOrganization({ userId: user1.id });
      org1 = orgResult1.organization;
      team1 = orgResult1.team.id;

      // Add user1 as team member
      await createTestMember({
        organizationId: org1.id,
        teamId: team1,
        userId: user1.id,
        isAdmin: true,
        roles: orgResult1.roles,
      });

      // Create a second user not in the first user's team
      const result2 = await createTestUser({});
      user2 = result2.user;
      token2 = result2.token;
      authenticatedClientUser2 = createAuthenticatedClient(token2);

      // Create a chat for user1's team
      const chat = await createChat({
        supabase: authenticatedClientUser1,
        teamId: team1,
        title: "Test Chat",
        userId: user1.id,
      });

      chatIdUser1 = chat.id;

      // Create a message in the chat
      const message = await createMessage({
        supabase: authenticatedClientUser1,
        chatId: chatIdUser1,
        content: "Test message",
        role: "user",
        userId: user1.id,
      });

      messageIdUser1 = message.id;
    });

    it("should allow users to create messages in their team's chats", async () => {
      // User1 creates a message in their chat
      const { data: newMessage, error } = await authenticatedClientUser1
        .from("messages")
        .insert({
          chat_id: chatIdUser1,
          content: "New test message",
          role: "user",
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(newMessage).not.toBeNull();
      if (newMessage) {
        expect(newMessage.chat_id).toBe(chatIdUser1);
        expect(newMessage.content).toBe("New test message");
      }
    });

    it("should prevent users from creating messages in chats they don't have access to", async () => {
      // User2 attempts to create a message in user1's chat
      const { data, error } = await authenticatedClientUser2
        .from("messages")
        .insert({
          chat_id: chatIdUser1,
          content: "Unauthorized message",
          role: "user",
        })
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should allow users to view messages in their team's chats", async () => {
      // User1 should be able to see the message they created
      const { data, error } = await authenticatedClientUser1
        .from("messages")
        .select()
        .eq("id", messageIdUser1)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      if (data) {
        expect(data.id).toBe(messageIdUser1);
      }
    });

    it("should prevent users from viewing messages in chats they don't have access to", async () => {
      // User2 attempts to view user1's message
      const { data, error } = await authenticatedClientUser2
        .from("messages")
        .select()
        .eq("id", messageIdUser1)
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should allow users to update messages in their team's chats", async () => {
      // User1 updates their message
      const { data, error } = await authenticatedClientUser1
        .from("messages")
        .update({ content: "Updated content" })
        .eq("id", messageIdUser1)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      if (data) {
        expect(data.content).toBe("Updated content");
      }
    });

    it("should prevent users from updating messages in chats they don't have access to", async () => {
      // User2 attempts to update user1's message
      const { data, error } = await authenticatedClientUser2
        .from("messages")
        .update({ content: "Unauthorized update" })
        .eq("id", messageIdUser1)
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should allow users to delete messages in their team's chats", async () => {
      // User1 deletes their message
      const { error } = await authenticatedClientUser1
        .from("messages")
        .delete()
        .eq("id", messageIdUser1);

      expect(error).toBeNull();

      // Verify the message is deleted
      const { data, error: getError } = await authenticatedClientUser1
        .from("messages")
        .select()
        .eq("id", messageIdUser1)
        .single();

      expect(getError).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent users from deleting messages in chats they don't have access to", async () => {
      // User2 attempts to delete user1's message
      const { error } = await authenticatedClientUser2
        .from("messages")
        .delete()
        .eq("id", messageIdUser1);

      // The operation might succeed without an error even though nothing is deleted due to RLS
      // Verify that the message still exists, which is the true test of RLS working
      const { data, error: getError } = await authenticatedClientUser1
        .from("messages")
        .select()
        .eq("id", messageIdUser1)
        .single();

      expect(data).not.toBeNull();
      expect(data?.id).toBe(messageIdUser1);
    });

    it("should allow all team members to view messages in team chats", async () => {
      // Create another user in the same team
      const result3 = await createTestUser({});
      const user3 = result3.user;
      const token3 = result3.token;
      const authenticatedClientUser3 = createAuthenticatedClient(token3);

      // Create a new organization for user3 to get proper roles
      const orgResult3 = await createTestOrganization({ userId: user3.id });

      // Add user3 as a team member to user1's team
      await createTestMember({
        organizationId: org1.id,
        teamId: team1,
        userId: user3.id,
        isAdmin: false,
        roles: orgResult3.roles,
      });

      // User3 should be able to see the message in the team chat
      const { data, error } = await authenticatedClientUser3
        .from("messages")
        .select()
        .eq("id", messageIdUser1)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      if (data) {
        expect(data.id).toBe(messageIdUser1);
      }
    });
  });

  describe("Unauthenticated Users", () => {
    let chatId: string;
    let messageId: string;
    let authenticatedClient: SupabaseClient<Database>;

    // Setup test data with an authenticated user
    beforeEach(async () => {
      // Create a user with organization and team
      const { user, token } = await createTestUser({});
      authenticatedClient = createAuthenticatedClient(token);

      const { organization, team } = await createTestOrganization({
        userId: user.id,
      });

      // Create a chat
      const chat = await createChat({
        supabase: authenticatedClient,
        teamId: team.id,
        title: "Test Chat for Unauthenticated Testing",
        userId: user.id,
      });

      chatId = chat.id;

      // Create a message
      const message = await createMessage({
        supabase: authenticatedClient,
        chatId: chatId,
        content: "Test message for unauthenticated testing",
        role: "user",
        userId: user.id,
      });

      messageId = message.id;
    });

    it("should prevent unauthenticated users from creating messages", async () => {
      // Unauthenticated client attempts to create a message
      const { data, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          content: "Unauthorized message",
          role: "user",
        })
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent unauthenticated users from viewing messages", async () => {
      // Unauthenticated client attempts to view a message
      const { data, error } = await supabase
        .from("messages")
        .select()
        .eq("id", messageId)
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent unauthenticated users from updating messages", async () => {
      // Unauthenticated client attempts to update a message
      const { data, error } = await supabase
        .from("messages")
        .update({ content: "Unauthorized update" })
        .eq("id", messageId)
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent unauthenticated users from deleting messages", async () => {
      // Unauthenticated client attempts to delete a message
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      expect(error).not.toBeNull();
    });
  });
});
