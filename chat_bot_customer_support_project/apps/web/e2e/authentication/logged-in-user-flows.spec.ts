import { test, expect } from "@playwright/test";
import { getStorageStateForScenario } from "@/e2e/supabase-helpers";
import { TestSetup } from "@/e2e/global-setup";

test.describe("Logged In User Flow - Multi-Team Organization Member", () => {
  test.use({
    storageState: getStorageStateForScenario(TestSetup.MultiTeamOrgMember),
  });

  test("should redirect to team workspace if user has teams", async ({
    page,
  }) => {
    await page.goto("/org");

    // Wait for navigation to complete and verify the URL matches the pattern
    await expect(page).toHaveURL(
      /^http:\/\/localhost:3000\/org\/[0-9a-f-]{36}\/[0-9a-f-]{36}$/,
      { timeout: 30000 }
    );
  });
});

test.describe("Logged In User Flow - Client Organization Member", () => {
  test.use({
    storageState: getStorageStateForScenario(TestSetup.ClientOrgMember),
  });

  test("should redirect to team workspace for client org member", async ({
    page,
  }) => {
    await page.goto("/org");

    // Wait for navigation to complete and verify the URL matches the pattern
    await expect(page).toHaveURL(
      /^http:\/\/localhost:3000\/org\/[0-9a-f-]{36}\/[0-9a-f-]{36}$/,
      { timeout: 30000 }
    );
  });
});
