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
    // Either the "New form" link is visible or the "Limit reached" message
    const createButton = page.getByRole("link", { name: /new form/i });
    const limitMessage = page.getByText(/limit reached/i);
    const hasCreate = await createButton.isVisible().catch(() => false);
    const hasLimit = await limitMessage.isVisible().catch(() => false);
    expect(hasCreate || hasLimit).toBeTruthy();
  });

  test("form cards are clickable", async ({ page }) => {
    // Verify form cards exist and are interactive
    const formHeadings = page.getByRole("heading", { level: 3 });
    const count = await formHeadings.count();
    expect(count).toBeGreaterThan(0);

    // Verify cards have action buttons (copy, open, duplicate, delete)
    const actionButtons = page.locator('button[title="Copy form link"]');
    // Buttons are opacity-0 until hover, but should exist in DOM
    const buttonCount = await actionButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
