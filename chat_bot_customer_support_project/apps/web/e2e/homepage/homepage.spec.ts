import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays hero section with correct content", async ({ page }) => {
    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(
      page
        .getByTestId("hero-section")
        .getByRole("heading", { name: "Automate Your Social Media Growth" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Get Started" })
    ).toBeVisible();
  });

  test("displays pain points section", async ({ page }) => {
    await expect(page.getByTestId("pain-points-section")).toBeVisible();
  });

  test("displays USP section", async ({ page }) => {
    await expect(page.getByTestId("usp-section")).toBeVisible();
  });

  test("displays features section", async ({ page }) => {
    await expect(page.getByTestId("features-section")).toBeVisible();
  });

  test("displays testimonial section", async ({ page }) => {
    await expect(page.getByTestId("testimonial-section")).toBeVisible();
  });

  test("displays CTA section", async ({ page }) => {
    await expect(page.getByTestId("cta-section")).toBeVisible();
  });

  test("displays FAQ section", async ({ page }) => {
    await expect(page.getByTestId("faq-section")).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Click the Get Started button
    await page.getByRole("button", { name: "Get Started" }).click();

    // Should redirect to login page
    await expect(page).toHaveURL("/login");
  });

  test("theme switching works", async ({ page }) => {
    // Get the current theme
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark");
    });

    // Click the theme toggle button
    await page.getByTestId("theme-toggle").click();

    // Check if the theme has changed
    const newIsDark = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark");
    });

    expect(newIsDark).not.toBe(isDark);
  });

  test("responsive design breakpoints", async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId("hero-section")).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByTestId("hero-section")).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByTestId("hero-section")).toBeVisible();
  });
});
