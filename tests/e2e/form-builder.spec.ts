import { test, expect } from '@playwright/test';

test.describe('Form Builder AI Interaction', () => {
  const uniqueUserEmail = `formbuilderuser-${Date.now()}@example.com`;
  const userPassword = 'Password123!';

  // Hook to register a user once for all tests in this describe block
  test.beforeAll(async ({ browser }) => {
    const page = await (await browser.newContext()).newPage();
    await page.goto('/signup');
    await page.locator('input[name="email"]').fill(uniqueUserEmail);
    await page.locator('input[name="password"]').fill(userPassword);
    await page.locator('input[name="confirmPassword"]').fill(userPassword);
    await page.getByRole('button', { name: /Sign Up/i }).click();
    await page.waitForURL(/.*login/);
    await page.close();
  });

  // Hook to login and create a new form before each test
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(uniqueUserEmail);
    await page.locator('input[name="password"]').fill(userPassword);
    await page.getByRole('button', { name: /Login/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to form builder for a new form
    await page.getByRole('button', { name: /Create New Form/i }).click();
    await expect(page).toHaveURL(/.*\/builder\/.+/);
    // const builderUrl = page.url(); // Save builder URL for tests if needed, currently unused

    // Verify builder interface elements are visible
    await expect(page.getByPlaceholder(/Describe your form/i)).toBeVisible(); // Chat input
    await expect(page.locator('#form-preview-area')).toBeVisible(); // Assuming a form preview area
  });

  test('should send a message and receive an AI response', async ({ page }) => {
    const userMessage = 'Create a contact form with fields for name, email, and message.';

    // Send message to AI
    await page.getByPlaceholder(/Describe your form/i).fill(userMessage);
    await page.getByRole('button', { name: /Send/i }).click(); // Assuming a 'Send' button

    // Verify user's message appears in chat
    // This assumes chat messages have a specific role or class, e.g., 'user-message'
    // and AI messages have 'ai-message'.
    // For now, we'll look for the text content.
    await expect(page.locator('.chat-message-user', { hasText: userMessage })).toBeVisible();

    // Verify AI response is received
    // This might involve waiting for a loading indicator to disappear first.
    // For simplicity, we'll wait for an AI message to appear.
    const aiResponseLocator = page.locator('.chat-message-ai').last(); // Get the last AI message
    await expect(aiResponseLocator).toBeVisible({ timeout: 30000 }); // Increased timeout for AI response
    await expect(aiResponseLocator).not.toBeEmpty(); // Ensure it has content
  });

  test('form settings should update based on AI response', async ({ page }) => {
    const userMessage = 'Generate a survey with a text input for "Name" and a textarea for "Feedback".';

    // Send message
    await page.getByPlaceholder(/Describe your form/i).fill(userMessage);
    await page.getByRole('button', { name: /Send/i }).click();
    await expect(page.locator('.chat-message-user', { hasText: userMessage })).toBeVisible();
    const aiResponseLocator = page.locator('.chat-message-ai').last();
    await expect(aiResponseLocator).toBeVisible({ timeout: 30000 });

    // Verify form preview/settings area reflects changes
    // These selectors depend heavily on how the form fields are rendered in the preview.
    // Assuming standard input elements are rendered in '#form-preview-area'
    const formPreviewArea = page.locator('#form-preview-area');
    await expect(formPreviewArea.locator('input[name="name"]')).toBeVisible({ timeout: 10000 }); // Wait for DOM update
    await expect(formPreviewArea.locator('label:has-text("Name")')).toBeVisible();
    await expect(formPreviewArea.locator('textarea[name="feedback"]')).toBeVisible();
    await expect(formPreviewArea.locator('label:has-text("Feedback")')).toBeVisible();
  });

  test('should handle follow-up messages to modify the form', async ({ page }) => {
    const initialMessage = 'Create a simple form with an email field.';
    const followupMessage = 'Add a "Subject" text input to that form.';

    // Initial message
    await page.getByPlaceholder(/Describe your form/i).fill(initialMessage);
    await page.getByRole('button', { name: /Send/i }).click();
    await expect(page.locator('.chat-message-user', { hasText: initialMessage })).toBeVisible();
    let aiResponseLocator = page.locator('.chat-message-ai').last();
    await expect(aiResponseLocator).toBeVisible({ timeout: 30000 });

    // Verify initial field
    const formPreviewArea = page.locator('#form-preview-area');
    await expect(formPreviewArea.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });
    await expect(formPreviewArea.locator('label:has-text("Email")')).toBeVisible();

    // Follow-up message
    await page.getByPlaceholder(/Describe your form/i).fill(followupMessage);
    await page.getByRole('button', { name: /Send/i }).click();
    await expect(page.locator('.chat-message-user', { hasText: followupMessage })).toBeVisible();
    aiResponseLocator = page.locator('.chat-message-ai').last(); // Get the newest AI message
    await expect(aiResponseLocator).toBeVisible({ timeout: 30000 });

    // Verify new field ("Subject") is added and old field ("Email") still exists
    await expect(formPreviewArea.locator('input[name="subject"]')).toBeVisible({ timeout: 10000 });
    await expect(formPreviewArea.locator('label:has-text("Subject")')).toBeVisible();
    await expect(formPreviewArea.locator('input[name="email"]')).toBeVisible(); // Check existing field remains
    await expect(formPreviewArea.locator('label:has-text("Email")')).toBeVisible();
  });
});
