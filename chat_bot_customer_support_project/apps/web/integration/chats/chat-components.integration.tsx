import { describe, it, expect, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  createTestUser,
  createTestOrganization,
  createTestMember,
  createChat,
  createMessage,
} from "@repo/supabase";
import { createAuthenticatedClient } from "../test-utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@repo/supabase";

describe("Chat Component Database Integration Tests", () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  describe("Chat Creation and Message Storage", () => {
    let user1: any;
    let team1: string;
    let org1: any;
    let token1: string;
    let authenticatedClientUser1: SupabaseClient<Database>;
    let chatId: string;

    // Setup test data
    beforeEach(async () => {
      // Create user with organization and team
      const result1 = await createTestUser({});
      user1 = result1.user;
      token1 = result1.token;
      authenticatedClientUser1 = createAuthenticatedClient(token1);

      const orgResult1 = await createTestOrganization({ userId: user1.id });
      org1 = orgResult1.organization;
      team1 = orgResult1.team.id;

      // Add user as team member
      await createTestMember({
        organizationId: org1.id,
        teamId: team1,
        userId: user1.id,
        isAdmin: true,
        roles: orgResult1.roles,
      });
    });

    it("should create a new chat and verify it in the database", async () => {
      // Create a chat
      const chat = await createChat({
        supabase: authenticatedClientUser1,
        teamId: team1,
        title: "Integration Test Chat",
        userId: user1.id,
      });

      chatId = chat.id;

      // Verify chat was created
      const { data, error } = await authenticatedClientUser1
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.title).toBe("Integration Test Chat");
      expect(data?.team_id).toBe(team1);
    });

    it("should add messages to a chat and retrieve them", async () => {
      // Create a chat first
      const chat = await createChat({
        supabase: authenticatedClientUser1,
        teamId: team1,
        title: "Message Test Chat",
        userId: user1.id,
      });

      chatId = chat.id;

      // Add user message
      await createMessage({
        supabase: authenticatedClientUser1,
        chatId,
        content: "This is a test user message",
        role: "user",
        userId: user1.id,
      });

      // Add assistant message
      await createMessage({
        supabase: authenticatedClientUser1,
        chatId,
        content: "This is a test assistant response",
        role: "assistant",
        userId: user1.id,
      });

      // Retrieve messages
      const { data, error } = await authenticatedClientUser1
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.length).toBe(2);
      expect(data?.[0].content).toBe("This is a test user message");
      expect(data?.[0].role).toBe("user");
      expect(data?.[1].content).toBe("This is a test assistant response");
      expect(data?.[1].role).toBe("assistant");
    });

    it("should store and retrieve tool call data in messages", async () => {
      // Create a chat first
      const chat = await createChat({
        supabase: authenticatedClientUser1,
        teamId: team1,
        title: "Tool Call Test Chat",
        userId: user1.id,
      });

      chatId = chat.id;

      // Create a test tool call object
      const testToolCall = {
        type: "bookAppointment",
        parameters: {
          date: "2025-04-01",
          time: "10:00",
          service: "Technical Support",
          customerName: "Test User",
          email: "test@example.com",
        },
        result: {
          success: true,
          appointmentId: "test-appointment-id",
          message: "Appointment successfully booked!",
        },
      };

      // Add assistant message with tool call
      await createMessage({
        supabase: authenticatedClientUser1,
        chatId,
        content: "I've booked your appointment.",
        role: "assistant",
        userId: user1.id,
        tool_calls: [testToolCall],
      });

      // Retrieve message with tool call
      const { data, error } = await authenticatedClientUser1
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.content).toBe("I've booked your appointment.");

      // Check tool calls with proper type handling
      if (
        data?.tool_calls &&
        Array.isArray(data.tool_calls) &&
        data.tool_calls.length > 0
      ) {
        const toolCall = data.tool_calls[0] as any;
        expect(toolCall.type).toBe("bookAppointment");
        expect(toolCall.result.success).toBe(true);
      } else {
        // Fail the test if tool_calls is missing or empty
        expect(data?.tool_calls).toBeTruthy();
      }
    });
  });

  describe("Cross-Team Access Controls", () => {
    let user1: any, user2: any;
    let team1: string;
    let org1: any;
    let token1: string, token2: string;
    let authenticatedClientUser1: SupabaseClient<Database>;
    let authenticatedClientUser2: SupabaseClient<Database>;
    let chatId: string;
    let messageId: string;

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

      // Create a chat for team1
      const chat = await createChat({
        supabase: authenticatedClientUser1,
        teamId: team1,
        title: "Access Control Test Chat",
        userId: user1.id,
      });

      chatId = chat.id;

      // Add a message to the chat
      const message = await createMessage({
        supabase: authenticatedClientUser1,
        chatId,
        content: "This is a confidential message",
        role: "user",
        userId: user1.id,
      });

      messageId = message.id;

      // Create second user in different organization/team
      const result2 = await createTestUser({});
      user2 = result2.user;
      token2 = result2.token;
      authenticatedClientUser2 = createAuthenticatedClient(token2);

      // Create separate organization and team for user2
      await createTestOrganization({ userId: user2.id });
    });

    it("should verify user from same team can access chat", async () => {
      // Create new user in the same team
      const result3 = await createTestUser({});
      const user3 = result3.user;
      const token3 = result3.token;
      const authenticatedClientUser3 = createAuthenticatedClient(token3);

      // Create a new organization for user3 to get proper roles
      const orgResult3 = await createTestOrganization({ userId: user3.id });

      // Add user3 to the same team as user1
      await createTestMember({
        organizationId: org1.id,
        teamId: team1,
        userId: user3.id,
        isAdmin: false,
        roles: orgResult3.roles, // Use roles from user3's organization
      });

      // Verify user3 can access the chat
      const { data: chatData, error: chatError } =
        await authenticatedClientUser3
          .from("chats")
          .select("*")
          .eq("id", chatId)
          .single();

      expect(chatError).toBeNull();
      expect(chatData).not.toBeNull();
      expect(chatData?.id).toBe(chatId);

      // Verify user3 can access the messages
      const { data: messageData, error: messageError } =
        await authenticatedClientUser3
          .from("messages")
          .select("*")
          .eq("id", messageId)
          .single();

      expect(messageError).toBeNull();
      expect(messageData).not.toBeNull();
      expect(messageData?.id).toBe(messageId);
    });

    it("should prevent users from other teams from accessing chats", async () => {
      // User2 attempts to access user1's chat
      const { data: chatData, error: chatError } =
        await authenticatedClientUser2
          .from("chats")
          .select("*")
          .eq("id", chatId)
          .single();

      // Should fail due to RLS
      expect(chatError).not.toBeNull();
      expect(chatData).toBeNull();

      // User2 attempts to access user1's messages
      const { data: messageData, error: messageError } =
        await authenticatedClientUser2
          .from("messages")
          .select("*")
          .eq("id", messageId)
          .single();

      // Should fail due to RLS
      expect(messageError).not.toBeNull();
      expect(messageData).toBeNull();
    });

    it("should prevent users from other teams from creating messages in chats", async () => {
      // User2 attempts to create message in user1's chat
      const { data, error } = await authenticatedClientUser2
        .from("messages")
        .insert({
          chat_id: chatId,
          content: "Unauthorized message",
          role: "user",
        })
        .select()
        .single();

      // Should fail due to RLS
      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should verify chat data is not accessible when team membership is revoked", async () => {
      // Create new user in the same team
      const result3 = await createTestUser({});
      const user3 = result3.user;
      const token3 = result3.token;
      const authenticatedClientUser3 = createAuthenticatedClient(token3);

      // Create a new organization for user3 to get proper roles
      const orgResult3 = await createTestOrganization({ userId: user3.id });

      // Add user3 to the same team as user1
      const member = await createTestMember({
        organizationId: org1.id,
        teamId: team1,
        userId: user3.id,
        isAdmin: false,
        roles: orgResult3.roles,
      });

      // First verify the user can access the chat
      const { data: chatData, error: chatError } =
        await authenticatedClientUser3
          .from("chats")
          .select("*")
          .eq("id", chatId)
          .single();

      expect(chatError).toBeNull();
      expect(chatData).not.toBeNull();

      // Now remove the user from the team - access by team membership ID
      await authenticatedClientUser1
        .from("team_members")
        .delete()
        .eq("team_id", team1)
        .eq("user_id", user3.id);

      // Verify user can no longer access the chat
      const { data: chatDataAfter, error: chatErrorAfter } =
        await authenticatedClientUser3
          .from("chats")
          .select("*")
          .eq("id", chatId)
          .single();

      // Should fail due to RLS
      expect(chatErrorAfter).not.toBeNull();
      expect(chatDataAfter).toBeNull();
    });
  });

  describe("Unauthenticated Access", () => {
    let chatId: string;
    let messageId: string;
    let authenticatedClient: SupabaseClient<Database>;

    // Setup test data
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
        chatId,
        content: "Test message for unauthenticated testing",
        role: "user",
        userId: user.id,
      });

      messageId = message.id;
    });

    it("should prevent unauthenticated access to chats", async () => {
      // Unauthenticated client attempts to access chat
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent unauthenticated access to messages", async () => {
      // Unauthenticated client attempts to access message
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("id", messageId)
        .single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("should prevent unauthenticated clients from creating chats", async () => {
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

    it("should prevent unauthenticated clients from creating messages", async () => {
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
  });
});
