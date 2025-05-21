import { test, expect } from '@playwright/test';

test.describe('Form Submission Flow', () => {
  const uniqueUserEmail = `formsubmituser-${Date.now()}@example.com`;
  const userPassword = 'Password123!';
  const formDefinitionPrompt = 'Create a form with a text input for "Full Name", an email input for "Email Address", and a textarea for "Your Message".';
  let formId = '';
  let publicFormUrl = '';

  // Hook to register a user once
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

  // Hook to login, create a form, and navigate to its public page
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(uniqueUserEmail);
    await page.locator('input[name="password"]').fill(userPassword);
    await page.getByRole('button', { name: /Login/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to form builder
    await page.getByRole('button', { name: /Create New Form/i }).click();
    await expect(page).toHaveURL(/.*\/builder\/.+/);
    const builderUrl = page.url();
    const formIdMatch = builderUrl.match(/builder\/(.+)/);
    expect(formIdMatch).toBeTruthy();
    formId = formIdMatch ? formIdMatch[1] : '';
    expect(formId).not.toBe('');
    publicFormUrl = `/forms/${formId}`;

    // Use AI to create the form structure
    await page.getByPlaceholder(/Describe your form/i).fill(formDefinitionPrompt);
    await page.getByRole('button', { name: /Send/i }).click(); // Assuming 'Send' button
    // Wait for AI to process and update the form preview
    const formPreviewArea = page.locator('#form-preview-area');
    await expect(formPreviewArea.locator('input[name="full_name"]')).toBeVisible({ timeout: 20000 }); // Adjusted for potential AI lag
    await expect(formPreviewArea.locator('label:has-text("Full Name")')).toBeVisible();
    await expect(formPreviewArea.locator('input[name="email_address"]')).toBeVisible();
    await expect(formPreviewArea.locator('label:has-text("Email Address")')).toBeVisible();
    await expect(formPreviewArea.locator('textarea[name="your_message"]')).toBeVisible();
    await expect(formPreviewArea.locator('label:has-text("Your Message")')).toBeVisible();
    
    // For this test, we assume the form is auto-saved or the creation via AI implies it's ready.
    // If there's an explicit save button in the builder that's necessary before the form is live,
    // it would need to be clicked here.

    // Navigate to the public form page
    await page.goto(publicFormUrl);
    await expect(page.locator('form')).toBeVisible(); // Check for the form element
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[name="email_address"]')).toBeVisible();
    await expect(page.locator('textarea[name="your_message"]')).toBeVisible();
  });

  test('should allow a user to fill and submit the form successfully', async ({ page }) => {
    const testData = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      message: 'This is a test submission message.',
    };

    // Fill the form fields
    await page.locator('input[name="full_name"]').fill(testData.fullName);
    await page.locator('input[name="email_address"]').fill(testData.email);
    await page.locator('textarea[name="your_message"]').fill(testData.message);

    // Verify data is entered (optional, but good for debugging)
    await expect(page.locator('input[name="full_name"]')).toHaveValue(testData.fullName);
    await expect(page.locator('input[name="email_address"]')).toHaveValue(testData.email);
    await expect(page.locator('textarea[name="your_message"]')).toHaveValue(testData.message);

    // Submit the form
    await page.getByRole('button', { name: /Submit/i }).click();

    // Verify successful submission
    // This could be a redirect to a thank-you page or a success message on the same page.
    // Option 1: Redirect to a thank-you page
    // await expect(page).toHaveURL(new RegExp(`${publicFormUrl}/thankyou|/thank-you`));
    // await expect(page.getByRole('heading', { name: /Thank You/i })).toBeVisible();

    // Option 2: Success message on the same page
    await expect(page.locator('text="Form submitted successfully!"')).toBeVisible({ timeout: 10000 });
    // Or, if it replaces the form:
    // await expect(page.locator('form')).not.toBeVisible();
  });

  test.describe('AI Assistant during Form Submission (Conceptual)', () => {
    // This suite is a placeholder for tests related to AI interaction *during* submission.
    // The actual tests would depend on the specific UI and flow of this feature.
    // For example, if an AI chat pops up after filling fields but before final submit:

    test('should interact with AI assistant if it appears during submission', async ({ page }) => {
      // Fill form as above...
      await page.locator('input[name="full_name"]').fill('Jane Doe');
      await page.locator('input[name="email_address"]').fill('jane.doe@example.com');
      await page.locator('textarea[name="your_message"]').fill('Testing AI assistant during submission.');

      // Click a pre-submit button if that triggers the AI, or the AI might trigger automatically.
      // e.g., await page.getByRole('button', { name: /Proceed with AI/i }).click();

      // Placeholder: Assume an AI chat appears
      const aiChatWindow = page.locator('#ai-submission-chat'); // Example selector
      // await expect(aiChatWindow).toBeVisible();
      // await expect(aiChatWindow.locator('text="AI Assistant: Please confirm your details."')).toBeVisible();

      // User responds
      // await aiChatWindow.locator('input[type="text"]').fill('Yes, details are correct.');
      // await aiChatWindow.getByRole('button', { name: /Send/i }).click();
      // await expect(aiChatWindow.locator('text="User: Yes, details are correct."')).toBeVisible();
      
      // This test is marked as skipped because the feature details are unknown.
      // It would need to be implemented once the AI assistant's submission flow is defined.
      test.skip(true, 'AI assistant feature during submission is not yet defined for testing.');

      // Then proceed to final submission if it's a separate step
      // await page.getByRole('button', { name: /Final Submit/i }).click();
      // await expect(page.locator('text="Form submitted successfully!"')).toBeVisible();
    });
  });

  // Placeholder for verifying submitted data
  // test('should display submitted data on a confirmation page or allow admin to see it', async ({ page }) => {
  //   // Fill and submit form as in the first test...
  //   // ...
  //   // Verify data on thank you page (if applicable)
  //   // await expect(page.locator(`text*="${testData.fullName}"`)).toBeVisible();
  //   // Or navigate to an admin/results view and verify entry (more complex)
  //   test.skip(true, 'Verification of submitted data is not implemented in this test suite.');
  // });
});
