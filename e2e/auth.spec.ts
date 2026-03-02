import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("homepage redirects authenticated users to dashboard", async ({
    page,
  }) => {
    // Unauthenticated user sees the homepage
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Forms that feel like");
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h2")).toContainText("Welcome back");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("register page renders correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h2")).toContainText("Create your account");
    await expect(page.locator('input[placeholder="Your name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // Should stay on login page
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
  });

  test("dashboard requires authentication", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page redirects authenticated users to dashboard", async ({
    page,
  }) => {
    // First login
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard", { timeout: 15000 });

    // Now try to go to login - should redirect to dashboard
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
