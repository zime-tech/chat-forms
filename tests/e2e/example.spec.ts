import { test, expect } from '@playwright/test';

test('should navigate to the homepage and check the title', async ({ page }) => {
  // Navigate to the homepage.
  await page.goto('/');

  // Check that the title is correct.
  // This assumes the Next.js app has a title like "Create Next App" or similar.
  // You might need to adjust this selector and expected title based on the actual application.
  await expect(page).toHaveTitle(/Next.js/);
});
