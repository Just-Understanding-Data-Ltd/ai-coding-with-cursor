/**
 * Helper functions for managing Supabase authentication and user states in E2E tests.
 * @module supabase-helpers
 */

// https://www.bekapod.dev/articles/supabase-magic-login-testing-with-playwright/
import { chromium, request, Page } from "@playwright/test";
import { testEmailMap } from "./global-setup";
import { FullConfig } from "@playwright/test";
import path from "path";
import { TestSetup } from "./global-setup";

/**
 * Gets the storage state path for a given test scenario.
 * Maps the scenario to its corresponding email and returns the storage path.
 * Returns undefined for scenarios that don't require authentication.
 *
 * @param scenario - The test scenario to get the storage state for
 * @returns The path to the storage state file for the scenario's email, or undefined for non-authenticated scenarios
 *
 * @example
 * ```typescript
 * // For authenticated user
 * test.use({
 *   storageState: getStorageStateForScenario(TestSetup.ClientOrgAdmin)
 * });
 *
 * // For non-authenticated user
 * test.use({
 *   storageState: getStorageStateForScenario(TestSetup.LoggedOutUser) // returns undefined
 * });
 * ```
 */
export const getStorageStateForScenario = (
  scenario: TestSetup
): string | undefined => {
  const testScenario = testEmailMap[scenario];
  if (!testScenario) {
    return undefined;
  }
  // Return undefined if scenario doesn't exist or doesn't require authentication
  if (!testScenario.shouldLogin || !testScenario.email) {
    return undefined;
  }

  return getStorageStatePath(testScenario.email);
};

/**
 * Generates a storage state file path for a given email address.
 * Converts email to a filename-safe format.
 *
 * @param email - The email address of the test user
 * @returns The path where the storage state file should be saved
 *
 * @example
 * ```typescript
 * const statePath = getStorageStatePath('user@example.com');
 * // Returns: '/path/to/storage/storage-state-user-example-com.json'
 * ```
 */
export const getStorageStatePath = (email: string): string => {
  if (!email) return "";
  // Convert email to filename-safe format: replace @ and . with -
  const fileName = `storage-state-${email.replace(/[@.]/g, "-")}.json`;
  return path.join(__dirname, "storage", fileName);
};

/**
 * Retrieves the latest magic link email from Inbucket for a given username.
 * Used to fetch authentication links during test setup.
 *
 * @param username - The email address to check for magic links
 * @returns Promise resolving to an object containing the magic link URL
 * @throws {Error} If unable to fetch or parse the email message
 *
 * @example
 * ```typescript
 * const { url } = await getLoginMessage('user@example.com');
 * if (url) {
 *   await page.goto(url); // Navigate to the magic link
 * }
 * ```
 */
export const getLoginMessage = async (username: string) => {
  const inbucketUrl = process.env.INBUCKET_URL || "http://127.0.0.1:54324";
  console.log(`Checking mailbox for ${username} at ${inbucketUrl}`);

  const requestContext = await request.newContext();
  const messages = await requestContext
    .get(`${inbucketUrl}/api/v1/mailbox/${username}`)
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error fetching mailbox:", error);
      return [];
    })
    .then((items) =>
      [...items].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
    );

  const latestMessageId = messages[0]?.id;
  console.log(`Latest message ID: ${latestMessageId}`);

  if (latestMessageId) {
    const message = await requestContext
      .get(`${inbucketUrl}/api/v1/mailbox/${username}/${latestMessageId}`)
      .then((res) => res.json())
      .catch((error) => {
        console.error("Error fetching message:", error);
        return null;
      });

    if (message?.body?.text) {
      const matches = message.body.text.match(/http:\/\/[^\s]+/);
      if (matches) {
        console.log(`Found magic link: ${matches[0]}`);
        return { url: matches[0] };
      }
    }
    console.log("No magic link found in message");
  }

  return { url: "" };
};

/**
 * Waits for a new magic link to be received, different from a previous one.
 * Useful when needing to ensure a fresh authentication link.
 *
 * @param oldUrl - The previous magic link URL to compare against
 * @param username - The email address to monitor for new links
 * @returns Promise resolving to the new magic link details
 * @throws {Error} If no new magic link is received within the retry limit
 *
 * @example
 * ```typescript
 * const oldLink = (await getLoginMessage('user@example.com')).url;
 * const { url: newLink } = await waitForNewMagicLink(oldLink, 'user@example.com');
 * ```
 */
export const waitForNewMagicLink = async (oldUrl: string, username: string) => {
  let triesLeft = 15; // Increased from 10 to 15 tries
  const RETRY_INTERVAL = 3000; // Increased from 2000 to 3000ms
  const INITIAL_DELAY = 2000; // Add initial delay to allow for email processing

  console.log(
    `Waiting for new magic link for ${username} (old URL: ${oldUrl})`
  );

  // Add initial delay before starting to check
  await new Promise((resolve) => setTimeout(resolve, INITIAL_DELAY));

  return new Promise<Awaited<ReturnType<typeof getLoginMessage>>>(
    (resolve, reject) => {
      const interval = setInterval(async () => {
        console.log(`Attempt ${16 - triesLeft} for ${username}`);
        const check = await getLoginMessage(username);

        if (check.url && check.url !== oldUrl) {
          console.log(`Found new magic link: ${check.url}`);
          resolve(check);
          clearInterval(interval);
        } else if (triesLeft <= 1) {
          console.error(
            `Failed to get new magic link for ${username} after ${16 - triesLeft} attempts`
          );
          reject(new Error(`No new magic link received for ${username}`));
          clearInterval(interval);
        }
        triesLeft--;
      }, RETRY_INTERVAL);
    }
  );
};

/**
 * Sets up the authenticated state for a test user.
 * This includes:
 * 1. Requesting a magic link
 * 2. Following the authentication flow
 * 3. Saving the authenticated state for future test use
 *
 * @param config - Playwright's full configuration object
 * @param username - The email address of the test user to set up
 * @throws {Error} If the authentication flow fails
 *
 * @example
 * ```typescript
 * // In global setup
 * await setupUserState(playwrightConfig, 'admin@example.com');
 *
 * // In test file
 * test.use({ storageState: getStorageStatePath('admin@example.com') });
 * ```
 */
export const setupUserState = async (config: FullConfig, username: string) => {
  console.log(`Setting up user state for ${username}`);

  // Find the test scenario for this email
  const testScenario = Object.entries(testEmailMap).find(
    ([_, scenario]) => scenario.email === username
  );

  if (!testScenario || !testScenario[1].shouldLogin) {
    console.log(`Skipping login for ${username}`);
    return; // Skip if no scenario found or shouldn't login
  }

  try {
    const { url: oldUrl } = await getLoginMessage(username);
    console.log(`Initial magic link state: ${oldUrl}`);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log(`Navigating to login page for ${username}`);
    await page.goto(`${config.webServer?.url}/login`);

    console.log(`Filling login form for ${username}`);
    await page.getByTestId("email-input").fill(username);
    await page.getByTestId("email-submit-button").click();

    console.log(`Waiting for magic link for ${username}`);
    const { url } = await waitForNewMagicLink(oldUrl, username);

    if (url) {
      console.log(`Following magic link for ${username}: ${url}`);
      await page.goto(url);
      const statePath = getStorageStatePath(username);
      console.log(`Saving storage state for ${username} to ${statePath}`);
      await page.context().storageState({ path: statePath });
    } else {
      throw new Error(`Magic link URL not found for ${username}`);
    }

    await browser.close();
    console.log(`Successfully set up user state for ${username}`);
  } catch (error) {
    console.error(`Failed to set up user state for ${username}:`, error);
    throw error;
  }
};

/**
 * Logs in a user with a specific test scenario using magic links.
 * This function handles the complete login flow including:
 * 1. Getting the initial magic link state
 * 2. Submitting the login form
 * 3. Waiting for and following the new magic link
 *
 * @param page - The Playwright page object to use for the login
 * @param scenario - The test scenario to use for login
 * @throws {Error} If the scenario doesn't exist or login fails
 *
 * @example
 * ```typescript
 * await loginWithTestScenario(page, TestSetup.ClientOrgAdmin);
 * ```
 */
export const loginWithTestScenario = async (
  page: Page,
  scenario: TestSetup
): Promise<void> => {
  const testScenario = testEmailMap[scenario];

  if (!testScenario || !testScenario.email) {
    throw new Error(`Invalid test scenario: ${scenario}`);
  }

  console.log(`Starting login flow for ${testScenario.email}`);

  try {
    // Get initial magic link state
    const { url: oldUrl } = await getLoginMessage(testScenario.email);
    console.log(`Initial magic link state: ${oldUrl}`);

    // Navigate to login page and submit email
    await page.goto("/login");
    await page.getByTestId("email-input").fill(testScenario.email);
    await page.getByTestId("email-submit-button").click();

    // Wait for and follow new magic link
    const { url } = await waitForNewMagicLink(oldUrl, testScenario.email);

    if (!url) {
      throw new Error(`No magic link received for ${testScenario.email}`);
    }

    console.log(`Following magic link for ${testScenario.email}`);
    await page.goto(url);

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    console.log(`Successfully logged in as ${testScenario.email}`);
  } catch (error) {
    console.error(`Login failed for ${testScenario.email}:`, error);
    throw error;
  }
};
