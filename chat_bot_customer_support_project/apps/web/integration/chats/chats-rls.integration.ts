import { describe, it, expect, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  createTestUser,
  createTestOrganization,
  createTestMember,
  createChat,
} from "@repo/supabase";
import {
  createAuthenticatedClient,
  createAuthenticatedClientForScenario,
} from "../test-utils";
import { IntegrationUserScenarioId } from "../types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@repo/supabase";

describe("Chats Table RLS Policies", () => {
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
    });

    it("should allow users to create chats in their team", async () => {
      // User1 creates a chat in their team
      const { data: newChat, error } = await authenticatedClientUser1
        .from("chats")
        .insert({
          team_id: team1,
          title: "New Test Chat",
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(newChat).not.toBeNull();
      if (newChat) {
        expect(newChat.team_id).toBe(team1);
        expect(newChat.title).toBe("New Test Chat");
      }
    });

    it("should prevent users from creating chats in teams they don't belong to", async () => {
      // User2 attempts to create a chat in user1's team
      const { data, error } = await authenticatedClientUser2
        .from("chats")
        .insert({
          team_id: team1,
          title: "Unauthorized Chat",
        })
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should allow users to view chats in their team", async () => {
      // User1 should be able to see the chat they created
      const { data, error } = await authenticatedClientUser1
        .from("chats")
        .select()
        .eq("id", chatIdUser1)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      if (data) {
        expect(data.id).toBe(chatIdUser1);
      }
    });

    it("should prevent users from viewing chats in teams they don't belong to", async () => {
      // User2 attempts to view user1's chat
      const { data, error } = await authenticatedClientUser2
        .from("chats")
        .select()
        .eq("id", chatIdUser1)
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should allow users to update chats in their team", async () => {
      // User1 updates their chat
      const { data, error } = await authenticatedClientUser1
        .from("chats")
        .update({ title: "Updated Title" })
        .eq("id", chatIdUser1)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      if (data) {
        expect(data.title).toBe("Updated Title");
      }
    });

    it("should prevent users from updating chats in teams they don't belong to", async () => {
      // User2 attempts to update user1's chat
      const { data, error } = await authenticatedClientUser2
        .from("chats")
        .update({ title: "Unauthorized Update" })
        .eq("id", chatIdUser1)
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should allow users to delete chats in their team", async () => {
      // User1 deletes their chat
      const { error } = await authenticatedClientUser1
        .from("chats")
        .delete()
        .eq("id", chatIdUser1);

      expect(error).toBeNull();

      // Verify the chat is deleted
      const { data, error: getError } = await authenticatedClientUser1
        .from("chats")
        .select()
        .eq("id", chatIdUser1)
        .single();

      expect(getError).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent users from deleting chats in teams they don't belong to", async () => {
      // User2 attempts to delete user1's chat
      const { error } = await authenticatedClientUser2
        .from("chats")
        .delete()
        .eq("id", chatIdUser1);

      // The operation might succeed without an error even though nothing is deleted due to RLS
      // Verify that the chat still exists, which is the true test of RLS working
      const { data, error: getError } = await authenticatedClientUser1
        .from("chats")
        .select()
        .eq("id", chatIdUser1)
        .single();

      expect(data).not.toBeNull();
      expect(data?.id).toBe(chatIdUser1);
    });

    it("should allow team admins to access team chats", async () => {
      // Get authenticated client for team admin
      const teamAdminClient = createAuthenticatedClientForScenario(
        IntegrationUserScenarioId.TeamAdmin
      );

      // Admin should be able to access chats in their team
      const { data: teamChats, error } = await teamAdminClient
        .from("chats")
        .select("*");

      expect(error).toBeNull();
      expect(Array.isArray(teamChats)).toBe(true);
    });
  });

  describe("Unauthenticated Users", () => {
    let chatId: string;
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
    });

    it("should prevent unauthenticated users from creating chats", async () => {
      // Unauthenticated client attempts to create a chat
      const { data, error } = await supabase
        .from("chats")
        .insert({
          team_id: "any-team-id",
          title: "Unauthorized Chat",
        })
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent unauthenticated users from viewing chats", async () => {
      // Unauthenticated client attempts to view a chat
      const { data, error } = await supabase
        .from("chats")
        .select()
        .eq("id", chatId)
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent unauthenticated users from updating chats", async () => {
      // Unauthenticated client attempts to update a chat
      const { data, error } = await supabase
        .from("chats")
        .update({ title: "Unauthorized Update" })
        .eq("id", chatId)
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent unauthenticated users from deleting chats", async () => {
      // Unauthenticated client attempts to delete a chat
      const { error } = await supabase.from("chats").delete().eq("id", chatId);

      expect(error).not.toBeNull();
    });
  });
});
