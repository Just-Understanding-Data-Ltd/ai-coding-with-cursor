import { test, expect, Page } from "@playwright/test";
import { loginWithTestScenario } from "@/e2e/supabase-helpers";
import { TestSetup } from "@/e2e/global-setup";

const fillInJoinForm = async (page: Page) => {
  const fullNameInput = await page.locator('input[id="full_name"]');
  await fullNameInput.click();
  await fullNameInput.fill("Test User");
  await page.getByRole("button", { name: /Continue/i }).click();
};

test.describe("Join Flow", () => {
  // Configure retries for all tests in this describe block
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    // Add console log listener
    page.on("console", (msg) => {
      console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
    });

    // Add response logging
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/api/auth/callback") || url.includes("supabase")) {
        console.log(`Response from ${url}: ${response.status()}`);
      }
    });
  });

  // UNHAPPY PATHS
  test("Missing token - should show error when no token is provided", async ({
    page,
  }) => {
    await page.goto("/join");
    await expect(page.getByText("Invalid invitation link")).toBeVisible({
      timeout: 15000, // Increase timeout
    });
  });

  test("Invalid token - should show error when token is invalid", async ({
    page,
  }) => {
    await page.goto("/join?token=invalid-token");
    await expect(page.getByText("Invalid invitation link")).toBeVisible();
  });

  // HAPPY PATHS
  test.describe("Valid Invitation - New User + Client", () => {
    // Don't set storage state for new user tests
    test("Should be redirected to the relevant client page", async ({
      page,
    }) => {
      const invitationToken = "valid-new-user-token-client";
      await page.goto(`/join?token=${invitationToken}`);

      // Add retry intervals for potentially flaky network conditions
      await page.waitForLoadState("networkidle", {
        timeout: 30000,
      });

      await expect(page.getByText(/Join Client Organization/)).toBeVisible({
        timeout: 30000,
      });

      await fillInJoinForm(page);

      // Add retry options for URL checks
      await expect(page).toHaveURL(/\/org\/[a-f0-9-]+\/[a-f0-9-]+/, {
        timeout: 30000,
      });
    });
  });

  test.describe("Valid Invitation - New User + Team", () => {
    // Don't set storage state for new user
    test("Should be redirected to the relevant team page", async ({ page }) => {
      const invitationToken = "valid-new-user-token-team";
      await page.goto(`/join?token=${invitationToken}`);

      await expect(page.getByText(/Join Multi-Team Organization/)).toBeVisible({
        timeout: 30000,
      });

      await fillInJoinForm(page);

      await expect(page).toHaveURL(/\/org\/[a-f0-9-]+\/[a-f0-9-]+/, {
        timeout: 30000,
      });
    });
  });

  test.describe("Valid Invitation - Existing User + Client", () => {
    test("Should show magic link sent message and redirect after login", async ({
      page,
    }) => {
      const invitationToken = "valid-existing-user-token-client";
      await page.goto(`/join?token=${invitationToken}`);
      await page.waitForLoadState("networkidle", { timeout: 30000 });

      await expect(page.getByText(/Join Client Organization/)).toBeVisible({
        timeout: 30000,
      });

      await fillInJoinForm(page);

      await expect(
        page.getByText(/We've sent you a magic link. Please check your inbox!/i)
      ).toBeVisible({ timeout: 30000 });

      // Use client.member@example.com scenario
      await loginWithTestScenario(page, TestSetup.ValidExistingUserInvitation);

      await expect(page).toHaveURL(/\/org\/[a-f0-9-]+\/[a-f0-9-]+/, {
        timeout: 30000,
      });
    });
  });

  test.describe("Valid Invitation - Existing User + Team", () => {
    test("Should show magic link sent message and redirect after login", async ({
      page,
    }) => {
      const invitationToken = "valid-existing-user-token-team";
      await page.goto(`/join?token=${invitationToken}`);
      await page.waitForLoadState("networkidle", { timeout: 30000 });

      await expect(page.getByText(/Join Multi-Team Organization/)).toBeVisible({
        timeout: 30000,
      });

      await fillInJoinForm(page);

      await expect(
        page.getByText(/We've sent you a magic link. Please check your inbox!/i)
      ).toBeVisible({ timeout: 30000 });

      // Use team.member@example.com scenario
      await loginWithTestScenario(page, TestSetup.MultiTeamOrgMember);

      await expect(page).toHaveURL(/\/org\/[a-f0-9-]+\/[a-f0-9-]+/, {
        timeout: 30000,
      });
    });
  });
});
