# Test info

- Name: should navigate to the homepage and check the title
- Location: /app/tests/e2e/example.spec.ts:3:5

# Error details

```
Error: page.goto: NS_ERROR_CONNECTION_REFUSED
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

    at /app/tests/e2e/example.spec.ts:5:14
```

# Page snapshot

```yaml
- heading "Unable to connect" [level=1]
- paragraph: Firefox can’t establish a connection to the server at localhost:3000.
- paragraph
- list:
  - listitem: The site could be temporarily unavailable or too busy. Try again in a few moments.
  - listitem: If you are unable to load any pages, check your computer’s network connection.
  - listitem: If your computer or network is protected by a firewall or proxy, make sure that Nightly is permitted to access the web.
- button "Try Again"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('should navigate to the homepage and check the title', async ({ page }) => {
   4 |   // Navigate to the homepage.
>  5 |   await page.goto('/');
     |              ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
   6 |
   7 |   // Check that the title is correct.
   8 |   // This assumes the Next.js app has a title like "Create Next App" or similar.
   9 |   // You might need to adjust this selector and expected title based on the actual application.
  10 |   await expect(page).toHaveTitle(/Next.js/);
  11 | });
  12 |
```