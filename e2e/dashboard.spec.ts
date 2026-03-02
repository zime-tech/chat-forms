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

  test("can navigate to form builder", async ({ page }) => {
    // Click the first form item (a div with cursor-pointer)
    const formItem = page.locator("h3").first();
    await formItem.click();
    // Should navigate to a form builder page
    await expect(page).toHaveURL(/\/dashboard\/.+/);
  });
});
