import { Page, expect } from "@playwright/test";

/**
 * Login as a test user and navigate to the dashboard.
 * Uses the seeded test@example.com / password123 account.
 */
export async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard", { timeout: 15000 });
}

/**
 * Get a CSRF token from the NextAuth API.
 */
export async function getCsrfToken(page: Page): Promise<string> {
  const response = await page.request.get("/api/auth/csrf");
  const data = await response.json();
  return data.csrfToken;
}
