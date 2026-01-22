/**
 * E2E Tests - User Authentication Flow
 */

import { expect, test } from "@playwright/test";

test.describe("User Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display sign in page", async ({ page }) => {
    await page.click('a[href="/auth/signin"]');
    await expect(page).toHaveURL("/auth/signin");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/auth/signin");

    await page.fill('input[type="email"]', "invalid-email");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test("should validate password length", async ({ page }) => {
    await page.goto("/auth/signin");

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button[type="submit"]');

    await expect(page.getByText(/password.*at least/i)).toBeVisible();
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.goto("/auth/signin");

    await page.click('a[href="/auth/signup"]');
    await expect(page).toHaveURL("/auth/signup");
    await expect(page.getByRole("heading", { name: /sign up/i })).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.goto("/auth/signin");

    await page.click('a[href*="forgot"]');
    await expect(page.getByRole("heading", { name: /forgot password/i })).toBeVisible();
  });

  test("should display password requirements on signup", async ({ page }) => {
    await page.goto("/auth/signup");

    await expect(page.getByText(/at least.*characters/i)).toBeVisible();
  });

  test("should validate password match on signup", async ({ page }) => {
    await page.goto("/auth/signup");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "different");
    await page.click('button[type="submit"]');

    await expect(page.getByText(/passwords.*match/i)).toBeVisible();
  });
});

test.describe("User Profile", () => {
  test.beforeEach(async ({ page }) => {
    // Note: This requires authentication setup
    // In real tests, you'd sign in first or use authenticated state
    await page.goto("/");
  });

  test("should require authentication for profile page", async ({ page }) => {
    await page.goto("/profile/edit");

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("should display profile edit form when authenticated", async ({ page }) => {
    // Skip if not authenticated
    test.skip(!process.env["TEST_USER_EMAIL"], "Requires test authentication");

    await page.goto("/profile/edit");

    await expect(page.getByRole("heading", { name: /edit profile/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/bio/i)).toBeVisible();
  });

  test("should validate profile update", async ({ page }) => {
    test.skip(!process.env["TEST_USER_EMAIL"], "Requires test authentication");

    await page.goto("/profile/edit");

    // Clear name field
    await page.fill('input[name="name"]', "");
    await page.click('button[type="submit"]');

    await expect(page.getByText(/name.*required/i)).toBeVisible();
  });

  test("should upload avatar", async ({ page }) => {
    test.skip(!process.env["TEST_USER_EMAIL"], "Requires test authentication");

    await page.goto("/profile/edit");

    // Prepare test image file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "avatar.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-data"),
    });

    // Wait for upload to complete
    await expect(page.getByText(/uploading/i)).toBeVisible();
    await expect(page.getByText(/uploading/i)).not.toBeVisible({ timeout: 10000 });
  });
});
