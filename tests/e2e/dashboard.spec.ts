import { test, expect } from '@playwright/test';

test.describe('Dashboard and Form Management', () => {
  const uniqueUserEmail = `dashboarduser-${Date.now()}@example.com`;
  const userPassword = 'Password123!';

  // Hook to register and login user before each test in this describe block
  test.beforeAll(async ({ browser }) => {
    // Register the user once
    const page = await (await browser.newContext()).newPage();
    await page.goto('/signup');
    await page.locator('input[name="email"]').fill(uniqueUserEmail);
    await page.locator('input[name="password"]').fill(userPassword);
    await page.locator('input[name="confirmPassword"]').fill(userPassword);
    await page.getByRole('button', { name: /Sign Up/i }).click();
    await page.waitForURL(/.*login/); // Wait for redirection to login
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(uniqueUserEmail);
    await page.locator('input[name="password"]').fill(userPassword);
    await page.getByRole('button', { name: /Login/i }).click();
    await expect(page).toHaveURL(/.*dashboard/); // Ensure login redirects to dashboard
  });

  test('should allow an authenticated user to access the dashboard', async ({ page }) => {
    // The beforeEach hook already navigates to and verifies the dashboard URL.
    // We can add an additional check for a dashboard-specific element.
    await expect(page.getByRole('heading', { name: /Your Dashboard/i })).toBeVisible(); // Example element
    await expect(page.getByRole('button', { name: /Create New Form/i })).toBeVisible();
  });

  test('should allow creation of a new form and redirect to builder', async ({ page }) => {
    await page.getByRole('button', { name: /Create New Form/i }).click();

    // Expect redirection to the form builder interface
    // The URL might contain a dynamic form ID, e.g., /builder/xyz123
    await expect(page).toHaveURL(/.*\/builder\/.+/);
    // Verify a key element of the form builder is visible
    await expect(page.getByRole('heading', { name: /Form Builder/i })).toBeVisible(); // Example element
    // Example: Check if the AI prompt area is visible
    await expect(page.getByPlaceholder(/Describe your form/i)).toBeVisible();
  });

  test('newly created form should appear on the dashboard', async ({ page }) => {
    // const formTitle = `My Test Form - ${Date.now()}`; // Example if we were to set and check by title

    // 1. Create a new form
    await page.getByRole('button', { name: /Create New Form/i }).click();
    await expect(page).toHaveURL(/.*\/builder\/.+/); // Wait for builder to load

    // In a real scenario, we would interact with the builder to set the form title.
    // For now, let's assume the builder allows setting a title and saving,
    // or that a default title is assigned that we can predict or retrieve.
    // Here, we'll simulate setting a title and saving (conceptual)
    // This part is highly dependent on the actual builder UI:
    // await page.locator('input[aria-label="Form Title"]').fill(formTitle);
    // await page.getByRole('button', { name: /Save Form/i }).click();
    // For this test, we'll assume clicking "Create New Form" creates a form,
    // and then we immediately go back to the dashboard.
    // The title might be a default one or one we can't set easily without full builder interaction.
    // Let's assume for now that the act of clicking "Create New Form" is enough,
    // and a form with *some* default title/identifier appears.
    // To make this test more robust, the "Create New Form" might ideally lead to a modal
    // where you name the form first.

    // For the purpose of this test, we'll imagine a simplified flow:
    // A form is created, and we go back to the dashboard.
    // We will need a way to identify this new form.
    // If the form creation itself doesn't allow naming, this test will be hard to make reliable
    // without knowing how forms are named/identified by default.

    // Let's assume a simplified flow where the form is created, and we go back.
    // The previous test ('should allow creation of a new form...') already covers going to the builder.
    // This test needs to ensure it's listed.

    // To make this test work, let's assume:
    // 1. Clicking "Create New Form" creates a form and we are on the builder page.
    // 2. We then navigate back to the dashboard to see the form.
    // For identifying the form, we will rely on the fact that it's a *new* form.
    // This is fragile. Ideally, we'd set a unique title.

    // Let's refine: The "Create New Form" button might take us to the builder for a *new* form.
    // We'll grab the form ID from the URL on the builder page.
    // Then go back to the dashboard and look for an element associated with this form ID.

    await page.getByRole('button', { name: /Create New Form/i }).click();
    await expect(page).toHaveURL(/.*\/builder\/.+/);
    const builderUrl = page.url();
    const formIdMatch = builderUrl.match(/builder\/(.+)/);
    expect(formIdMatch).toBeTruthy();
    const formId = formIdMatch ? formIdMatch[1] : null;
    expect(formId).not.toBeNull();

    // Navigate back to the dashboard
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Your Dashboard/i })).toBeVisible();

    // Check if the newly created form is listed
    // This assumes forms are listed in a way that includes their ID or a link containing the ID.
    // For example, a link to edit the form: <a href="/builder/formId">Edit Form XYZ</a>
    // Or a data attribute: <div data-form-id="formId">...</div>
    // We'll look for a link that would take us back to this form's builder page.
    const formLinkSelector = `a[href*="/builder/${formId}"]`;
    await expect(page.locator(formLinkSelector)).toBeVisible();

    // A more user-friendly check would be by title, if we could set it.
    // If forms have a default title like "Untitled Form", and there could be many,
    // then checking by ID is more reliable.
    // For instance, if the card for the form has the title and a link:
    // await expect(page.locator(`[data-form-id="${formId}"]`).getByText(/Untitled Form/i)).toBeVisible();
  });
});
