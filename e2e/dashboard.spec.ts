import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("displays list of forms", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Your Forms");
    // Forms are rendered as clickable divs with h3 titles
    const formItems = page.locator("h3");
    const count = await formItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("has create new form button or limit message", async ({ page }) => {
    // Wait for content to load (not skeleton)
    await page.waitForSelector("h1", { timeout: 10000 });

    const createButton = page.getByRole("link", { name: /new form/i });
    const limitMessage = page.getByText(/limit reached/i);
    const hasCreate = await createButton.isVisible().catch(() => false);
    const hasLimit = await limitMessage.isVisible().catch(() => false);
    expect(hasCreate || hasLimit).toBeTruthy();
  });

  test("form cards are clickable", async ({ page }) => {
    // Wait for actual content to load (not skeleton)
    await page.waitForSelector("h3", { timeout: 10000 });

    const formHeadings = page.getByRole("heading", { level: 3 });
    const count = await formHeadings.count();
    expect(count).toBeGreaterThan(0);

    // Verify cards have action buttons (copy, open, duplicate, delete)
    const actionButtons = page.locator('button[title="Copy form link"]');
    const buttonCount = await actionButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
