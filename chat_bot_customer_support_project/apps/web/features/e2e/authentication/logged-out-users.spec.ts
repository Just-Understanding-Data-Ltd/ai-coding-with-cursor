import { test, expect } from "@playwright/test";

test.describe("Logged Out Users", () => {
  test("should be able to access the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });

  test("accessing /org redirects to /login", async ({ page }) => {
    await page.goto("/org");
    await expect(page).toHaveURL("/login");
  });

  test("accessing /org/12312312/1231312 redirects to /login", async ({
    page,
  }) => {
    await page.goto("/org/12312312/1231312");
    await expect(page).toHaveURL("/login");
  });

  test("accessing /org/:orgId/workspaces redirects to /login", async ({
    page,
  }) => {
    await page.goto("/org/12312312/workspaces");
    await expect(page).toHaveURL("/login");
  });

  test("navigating to /onboarding redirects to /login", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL("/login");
  });
});
