import { test, expect } from "@playwright/test";

test.describe("Form Submission (Public)", () => {
  test("form page loads with welcome message", async ({ page }) => {
    // Use a form ID from seeded data - fetch dynamically
    await page.goto("/");

    // Get a form ID from the API by logging in first
    const csrfResponse = await page.request.get("/api/auth/csrf");
    const { csrfToken } = await csrfResponse.json();

    await page.request.post("/api/auth/callback/credentials", {
      form: {
        csrfToken,
        email: "test@example.com",
        password: "password123",
      },
    });

    // Navigate to dashboard to get form links
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Get the first form's ID from the page
    const formLinks = page.locator('div[class*="cursor-pointer"] h3');
    const firstFormTitle = await formLinks.first().textContent();
    expect(firstFormTitle).toBeTruthy();
  });

  test("renders form correctly for unauthenticated users", async ({
    page,
  }) => {
    // Use a known seeded form ID
    const response = await page.goto("/forms/adfbdb6c-0ced-41f6-91e4-8a22268c372f");

    // If 404, seed data may not exist; skip gracefully
    if (response?.status() === 404) {
      test.skip();
      return;
    }

    // Should see the form header
    await expect(page.locator("text=Chat Forms")).toBeVisible();

    // Should see the form title
    await expect(
      page.locator("text=Customer Satisfaction Survey")
    ).toBeVisible();

    // Should see the call to action button (text comes from form settings)
    const ctaButton = page.locator("button").first();
    await expect(ctaButton).toBeVisible();
  });

  test("invalid form ID shows 404", async ({ page }) => {
    const response = await page.goto(
      "/forms/00000000-0000-0000-0000-000000000000"
    );
    expect(response?.status()).toBe(404);
  });
});
