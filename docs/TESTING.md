# E2E Testing Guide

## Overview

ComicWise uses **Playwright** for end-to-end testing to ensure critical user
flows work correctly across different browsers and devices.

## Test Coverage

### ✅ Authentication Tests (`auth.spec.ts`)

**Coverage**: 25+ test cases covering all authentication flows

#### User Registration

- Display registration form
- Validate required fields
- Validate email format
- Validate password strength
- Successfully register new user
- Prevent duplicate email registration

#### User Login

- Display login form
- Validate empty credentials
- Reject invalid credentials
- Show "forgot password" link
- Show "register" link

#### Password Reset

- Display password reset request form
- Validate email in password reset
- Handle password reset request
- Validate new password on reset page
- Validate password confirmation match

#### Email Verification

- Display verification pending page
- Allow resending verification email
- Handle verification token page

#### OAuth Authentication

- Display OAuth provider buttons on login
- Display OAuth provider buttons on register

#### Sign Out

- Display sign out page

#### Protected Routes

- Redirect unauthenticated users to login
- Redirect unauthenticated users from admin routes

### ✅ CRUD Operations Tests (`crud.spec.ts`)

**Coverage**: 30+ test cases covering core application features

#### Comics CRUD

- Display comics library page
- Display individual comic page
- Allow admin to create a comic
- Allow admin to edit a comic
- Validate required fields when creating comic
- Allow filtering comics

#### Chapters CRUD

- Display chapters for a comic
- Allow reading a chapter
- Allow admin to create a chapter
- Navigate between chapters

#### Comments CRUD

- Allow authenticated users to post comments
- Display existing comments
- Allow editing own comments
- Allow deleting own comments

#### Bookmarks CRUD

- Allow bookmarking a comic
- Display bookmarks library
- Allow removing bookmarks

#### Search Functionality

- Allow searching for comics
- Handle empty search results

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- Playwright browsers installed

### Install Playwright Browsers

```bash
pnpm exec playwright install
```

This installs:

- Chromium
- Firefox
- WebKit (Safari)

## Running Tests

### Run All Tests

```bash
pnpm test
```

### Run Specific Test Suites

```bash
# Authentication tests only
pnpm test:auth

# CRUD operations tests only
pnpm test:crud
```

### Run Tests by Browser

```bash
# Chromium only
pnpm test:chromium

# Firefox only
pnpm test:firefox

# WebKit (Safari) only
pnpm test:webkit
```

### Interactive Test UI

```bash
# Launch Playwright UI mode (recommended for development)
pnpm test:ui
```

Features:

- Visual test runner
- Watch mode
- Time-travel debugging
- Trace viewer
- Pick locators

### Headed Mode (See Browser)

```bash
# Run tests with browser window visible
pnpm test:headed
```

### Debug Mode

```bash
# Run tests with Playwright Inspector
pnpm test:debug
```

Features:

- Step through tests
- Pause execution
- Inspect page state
- Edit locators

### Generate Test Code

```bash
# Record interactions and generate test code
pnpm test:codegen
```

Opens browser and records your actions to generate Playwright test code.

## Viewing Test Results

### HTML Report

After tests complete, view the HTML report:

```bash
pnpm test:report
```

The report includes:

- Test execution summary
- Screenshots on failure
- Videos on failure
- Traces on retry

### CI Reporter

For GitHub Actions CI:

```bash
pnpm test:ci
```

Uses GitHub Actions reporter for better integration.

## Test Configuration

Configuration file: `playwright.config.ts`

### Key Settings

```typescript
{
  testDir: "./src/tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
}
```

### Browsers Tested

- **Chromium**: Google Chrome/Edge
- **Firefox**: Mozilla Firefox
- **WebKit**: Apple Safari

### Mobile Testing (Optional)

Uncomment mobile projects in `playwright.config.ts`:

```typescript
{
  name: 'Mobile Chrome',
  use: { ...devices['Pixel 5'] },
},
{
  name: 'Mobile Safari',
  use: { ...devices['iPhone 12'] },
},
```

Run mobile tests:

```bash
pnpm test:mobile
```

## Writing New Tests

### Test Structure

```typescript
import { expect, test } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test("should do something", async ({ page }) => {
    await page.goto("/path");

    // Interact with page
    await page.getByRole("button", { name: /click me/i }).click();

    // Assert results
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

### Best Practices

#### 1. Use Semantic Locators

```typescript
// ✅ Good - semantic locators
await page.getByRole("button", { name: /sign in/i });
await page.getByLabel(/email/i);
await page.getByText(/welcome/i);
await page.getByPlaceholder(/search/i);

// ❌ Avoid - brittle selectors
await page.locator(".btn-primary");
await page.locator("#login-button");
```

#### 2. Use Case-Insensitive Regex

```typescript
// ✅ Good - flexible matching
await page.getByText(/sign in|log in|login/i);

// ❌ Avoid - exact matching
await page.getByText("Sign In");
```

#### 3. Wait for Elements

```typescript
// ✅ Good - explicit waits
await expect(page.getByText(/success/i)).toBeVisible({ timeout: 5000 });

// ❌ Avoid - arbitrary waits
await page.waitForTimeout(3000);
```

#### 4. Handle Test Data

```typescript
// ✅ Good - unique test data
const uniqueEmail = `test-${Date.now()}@example.com`;

// ✅ Good - skip when data unavailable
if ((await page.locator("a[href*='/comics/']").count()) === 0) {
  test.skip(true, "No comics available");
}
```

#### 5. Use beforeEach for Setup

```typescript
test.beforeEach(async ({ page }) => {
  // Login before each test
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill("user@example.com");
  await page.getByLabel(/password/i).fill("password");
  await page.getByRole("button", { name: /sign in/i }).click();
});
```

## Debugging Tests

### 1. Playwright Inspector

```bash
pnpm test:debug
```

- Step through tests line by line
- Inspect page state at each step
- Try locators in real-time

### 2. Trace Viewer

```bash
# Run tests with trace
pnpm test:trace

# View trace
pnpm exec playwright show-trace trace.zip
```

View:

- Timeline of actions
- Screenshots at each step
- Network requests
- Console logs
- DOM snapshots

### 3. Screenshots on Failure

Screenshots are automatically captured on test failure.

Location: `test-results/*/test-failed-1.png`

### 4. Videos on Failure

Videos are recorded when tests fail.

Location: `test-results/*/video.webm`

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps

      - name: Run Playwright tests
        run: pnpm test:ci
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Performance Testing

### Load Testing

For load testing, consider using:

- **k6** for API load testing
- **Artillery** for realistic user scenarios
- **Apache JMeter** for comprehensive testing

### Lighthouse

Integrate Lighthouse for performance metrics:

```bash
pnpm add -D @playwright/test lighthouse

# Run Lighthouse in tests
pnpm exec playwright test --project=lighthouse
```

## Accessibility Testing

### Axe Integration

Add accessibility testing:

```bash
pnpm add -D @axe-core/playwright
```

Example:

```typescript
import { injectAxe, checkA11y } from "axe-playwright";

test("should not have accessibility violations", async ({ page }) => {
  await page.goto("/");
  await injectAxe(page);
  await checkA11y(page);
});
```

## Test Data Management

### Fixtures

Create test fixtures for reusable data:

`src/tests/fixtures.ts`:

```typescript
export const TEST_USERS = {
  admin: {
    email: "admin@example.com",
    password: "Admin123!",
  },
  user: {
    email: "user@example.com",
    password: "User123!",
  },
};

export const TEST_COMIC = {
  title: "Test Comic",
  description: "Test Description",
  author: "Test Author",
};
```

Import in tests:

```typescript
import { TEST_USERS } from "./fixtures";

test("should login as admin", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(TEST_USERS.admin.email);
  await page.getByLabel(/password/i).fill(TEST_USERS.admin.password);
  await page.getByRole("button", { name: /sign in/i }).click();
});
```

## Troubleshooting

### Test Timeouts

Increase timeout in config:

```typescript
{
  timeout: 60_000, // 60 seconds per test
}
```

### Flaky Tests

- Add explicit waits: `await expect(...).toBeVisible({ timeout: 5000 })`
- Use `test.retry()` for retries
- Check for race conditions
- Stabilize test data

### Browser Launch Errors

```bash
# Reinstall browsers
pnpm exec playwright install --force

# With system dependencies
pnpm exec playwright install --with-deps
```

### Test Isolation

Each test runs in isolated:

- Browser context (cookies, storage)
- Page instance

No cleanup needed between tests.

## Performance Metrics

Expected test execution time:

- **Full test suite**: 3-5 minutes
- **Authentication tests**: 1-2 minutes
- **CRUD tests**: 2-3 minutes

Parallelization:

- Local: All CPU cores
- CI: 1 worker (for stability)

## Next Steps

- [ ] Add visual regression testing
- [ ] Add API testing with Playwright
- [ ] Implement test coverage reporting
- [ ] Add performance tests
- [ ] Add accessibility tests
- [ ] Create test data factories
- [ ] Add email testing (capture/verify emails)
- [ ] Add webhook testing

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generators](https://playwright.dev/docs/codegen)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Support

For issues or questions:

- Check
  [Playwright GitHub Issues](https://github.com/microsoft/playwright/issues)
- Read
  [Stack Overflow playwright tag](https://stackoverflow.com/questions/tagged/playwright)
- Review test logs in `test-results/`
