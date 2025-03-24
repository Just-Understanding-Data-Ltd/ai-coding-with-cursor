import { test, expect } from "@playwright/test";
import { getStorageStateForScenario } from "@/e2e/supabase-helpers";
import { TestSetup } from "@/e2e/global-setup";

test.describe("Logged In User Flow - No Existing Organization", () => {
  test.use({
    storageState: getStorageStateForScenario(TestSetup.NewUserOnboarding),
  });

  test("should navigate to /onboarding", async ({ page }) => {
    await page.goto("/org");
    await expect(page).toHaveURL("/onboarding");
    await expect(page.getByTestId("onboarding-welcome")).toBeVisible();
    await expect(page.getByTestId("next-button")).toBeVisible();
  });

  test("completes onboarding flow", async ({ page }) => {
    await page.goto("/onboarding");

    // Fill out company details with unique values
    const timestamp = Date.now();
    await page.getByTestId("org-name-input").fill(`Test Company ${timestamp}`);
    await page
      .getByTestId("billing-email-input")
      .fill(`billing+${timestamp}@test.com`);
    await page.getByTestId("next-button").click();

    // Fill out brand details
    await page.getByTestId("brand-name-input").fill(`Test Brand ${timestamp}`);
    await page
      .getByTestId("brand-website-input")
      .fill(`https://test-${timestamp}.com`);
    await page.getByTestId("next-button").click();

    // Select role type
    await page.getByTestId("role-freelance_marketer").click();
    await page.getByTestId("next-button").click();

    // Select goals
    await page.getByTestId("goal-publish_multiple_platforms").click();
    await page.getByTestId("next-button").click();

    // Select referral source and submit
    await page.getByTestId("referral-google_search").click();
    await page.getByTestId("submit-button").click();

    // Wait for the form submission to complete
    await page.waitForTimeout(2000);

    // Check for success toast in the portal
    const toastMessage = await page
      .getByRole("status")
      .filter({ hasText: "Organization created successfully" });
    await expect(toastMessage).toBeVisible();

    // Wait all of the navigation to complete
    await page.waitForTimeout(2000);
  });

  test("validates required fields", async ({ page }) => {
    await page.goto("/onboarding");

    // Try to proceed without filling required fields
    await page.getByTestId("next-button").click();

    // Wait for form validation to complete
    await page.waitForTimeout(500);

    // Verify error messages using the form-item-message class
    await expect(
      page
        .locator(".text-destructive")
        .filter({ hasText: "Organization name must be at least 2 characters" })
    ).toBeVisible();
  });

  test("allows navigation between steps", async ({ page }) => {
    await page.goto("/onboarding");

    // Fill out company details
    await page.getByTestId("org-name-input").fill("Test Company");
    await page.getByTestId("billing-email-input").fill("billing@test.com");
    await page.getByTestId("next-button").click();

    // Go back
    await page.getByTestId("prev-button").click();

    // Verify we're back at company details
    await expect(page.getByTestId("org-name-input")).toHaveValue(
      "Test Company"
    );
  });

  test("persists data between steps", async ({ page }) => {
    await page.goto("/onboarding");

    // Fill out company details
    await page.getByTestId("org-name-input").fill("Test Company");
    await page.getByTestId("billing-email-input").fill("billing@test.com");
    await page.getByTestId("next-button").click();

    // Fill out brand details
    await page.getByTestId("brand-name-input").fill("Test Brand");
    await page.getByTestId("next-button").click();

    // Go back two steps
    await page.getByTestId("prev-button").click();
    await page.getByTestId("prev-button").click();

    // Verify data is still there
    await expect(page.getByTestId("org-name-input")).toHaveValue(
      "Test Company"
    );
    await expect(page.getByTestId("billing-email-input")).toHaveValue(
      "billing@test.com"
    );
  });
});

test.describe("Logged In User Flow - Organization Member Without Teams", () => {
  test.use({
    storageState: getStorageStateForScenario(TestSetup.NoTeamsOrgAdmin),
  });

  test("should redirect to workspaces if user has no teams", async ({
    page,
  }) => {
    await page.goto("/org");
    await expect(page).toHaveURL("/org/:orgId/workspaces", { timeout: 5000 });
  });
});
