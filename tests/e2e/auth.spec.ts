import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  const uniqueEmail = () => `testuser-${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  test.describe('User Registration', () => {
    test('should allow a new user to register successfully', async ({ page }) => {
      const email = uniqueEmail();
      await page.goto('/signup'); // Assuming '/signup' is the registration page URL

      // Fill out the registration form
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(testPassword);
      await page.locator('input[name="confirmPassword"]').fill(testPassword); // Assuming a confirm password field
      await page.getByRole('button', { name: /Sign Up/i }).click();

      // Verify redirection to login page or dashboard (depends on app flow)
      // For this example, let's assume it redirects to the login page with a success message
      await expect(page).toHaveURL(/.*login/); // Or wherever successful registration leads
      await expect(page.locator('text="Registration successful"')).toBeVisible(); // Or similar success feedback
    });

    test('should prevent registration with an existing email', async ({ page }) => {
      const email = uniqueEmail();
      // First, register a user
      await page.goto('/signup');
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(testPassword);
      await page.locator('input[name="confirmPassword"]').fill(testPassword);
      await page.getByRole('button', { name: /Sign Up/i }).click();
      // Assuming it redirects to login after the first successful registration
      await expect(page).toHaveURL(/.*login/);

      // Attempt to register again with the same email
      await page.goto('/signup');
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(testPassword);
      await page.locator('input[name="confirmPassword"]').fill(testPassword);
      await page.getByRole('button', { name: /Sign Up/i }).click();

      // Verify error message and that the user is still on the signup page
      await expect(page.locator('text="Email already exists"')).toBeVisible(); // Or similar error feedback
      await expect(page).toHaveURL(/.*signup/);
    });
  });

  test.describe('User Login', () => {
    const loginEmail = uniqueEmail();

    test.beforeAll(async ({ browser }) => {
      // Register a user once for all login tests in this describe block
      const page = await (await browser.newContext()).newPage();
      await page.goto('/signup');
      await page.locator('input[name="email"]').fill(loginEmail);
      await page.locator('input[name="password"]').fill(testPassword);
      await page.locator('input[name="confirmPassword"]').fill(testPassword);
      await page.getByRole('button', { name: /Sign Up/i }).click();
      // Wait for navigation to login or a success state
      await page.waitForURL(/.*login/);
      await page.close();
    });

    test('should allow an existing user to login successfully', async ({ page }) => {
      await page.goto('/login'); // Assuming '/login' is the login page URL

      await page.locator('input[name="email"]').fill(loginEmail);
      await page.locator('input[name="password"]').fill(testPassword);
      await page.getByRole('button', { name: /Login/i }).click();

      // Verify redirection to the dashboard or a protected route
      await expect(page).toHaveURL(/.*dashboard/); // Or your app's protected route
      await expect(page.locator('text="Welcome back"')).toBeVisible(); // Or similar dashboard content
    });

    test('should prevent login with an incorrect email', async ({ page }) => {
      await page.goto('/login');

      await page.locator('input[name="email"]').fill('wrong@example.com');
      await page.locator('input[name="password"]').fill(testPassword);
      await page.getByRole('button', { name: /Login/i }).click();

      await expect(page.locator('text="Invalid email or password"')).toBeVisible(); // Or similar error
      await expect(page).toHaveURL(/.*login/);
    });

    test('should prevent login with an incorrect password', async ({ page }) => {
      await page.goto('/login');

      await page.locator('input[name="email"]').fill(loginEmail);
      await page.locator('input[name="password"]').fill('WrongPassword!');
      await page.getByRole('button', { name: /Login/i }).click();

      await expect(page.locator('text="Invalid email or password"')).toBeVisible(); // Or similar error
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('User Logout', () => {
    const logoutEmail = uniqueEmail();
    const logoutPassword = 'Password123!';

    test.beforeAll(async ({ browser }) => {
      // Register a user for logout tests
      const page = await (await browser.newContext()).newPage();
      await page.goto('/signup');
      await page.locator('input[name="email"]').fill(logoutEmail);
      await page.locator('input[name="password"]').fill(logoutPassword);
      await page.locator('input[name="confirmPassword"]').fill(logoutPassword);
      await page.getByRole('button', { name: /Sign Up/i }).click();
      await page.waitForURL(/.*login/); // Ensure registration is complete
      await page.close();
    });

    test('should allow a logged-in user to logout', async ({ page }) => {
      // Log in the user first
      await page.goto('/login');
      await page.locator('input[name="email"]').fill(logoutEmail);
      await page.locator('input[name="password"]').fill(logoutPassword);
      await page.getByRole('button', { name: /Login/i }).click();
      await expect(page).toHaveURL(/.*dashboard/); // Ensure login was successful

      // Perform logout
      // Assuming a logout button is available, possibly in a dropdown or nav menu
      // This selector might need to be adjusted based on the actual UI
      await page.getByRole('button', { name: /Logout/i }).click();

      // Verify redirection to a public page (e.g., home or login)
      await expect(page).toHaveURL(/.*login/); // Or your app's home page
      // Optionally, verify that session-specific elements are no longer visible
      await expect(page.locator('text="Welcome back"')).not.toBeVisible();
    });
  });

  test.describe('Access Control', () => {
    test('should redirect unauthenticated users from protected routes to login', async ({ page }) => {
      await page.goto('/dashboard'); // Attempt to access a protected route

      // Verify redirection to the login page
      await expect(page).toHaveURL(/.*login\?callbackUrl=%2Fdashboard/); // NextAuth.js typically adds a callbackUrl
      await expect(page.locator('input[name="email"]')).toBeVisible(); // Check for a login form element
    });
  });
});
