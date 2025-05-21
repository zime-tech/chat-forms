# Test info

- Name: should navigate to the homepage and check the title
- Location: /app/tests/e2e/example.spec.ts:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

    at /app/tests/e2e/example.spec.ts:5:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('should navigate to the homepage and check the title', async ({ page }) => {
   4 |   // Navigate to the homepage.
>  5 |   await page.goto('/');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
   6 |
   7 |   // Check that the title is correct.
   8 |   // This assumes the Next.js app has a title like "Create Next App" or similar.
   9 |   // You might need to adjust this selector and expected title based on the actual application.
  10 |   await expect(page).toHaveTitle(/Next.js/);
  11 | });
  12 |
```