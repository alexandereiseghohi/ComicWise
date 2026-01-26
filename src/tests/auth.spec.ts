import { env } from "@/appConfig";
import { expect, test } from "@playwright/test";

const BASE_URL = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Test user credentials
const TEST_USER = {
  email: "testexample.com",
  password: "Test123!",
  name: "Test User",
};

test.describe("Authentication E2E Tests", () => {
  test.describe("User Registration", () => {
    test("should display registration form", async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Check for form elements
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign up|register/i })).toBeVisible();
    });

    test("should validate required fields", async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Try to submit empty form
      await page.getByRole("button", { name: /sign up|register/i }).click();

      // Check for validation errors
      await expect(page.getByText(/required|cannot be empty/i)).toBeVisible();
    });

    test("should validate email format", async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Enter invalid email
      await page.getByLabel(/name/i).fill(TEST_USER.name);
      await page.getByLabel(/email/i).fill("invalid-email");
      await page.getByLabel(/password/i).fill(TEST_USER.password);

      await page.getByRole("button", { name: /sign up|register/i }).click();

      // Check for email validation error
      await expect(page.getByText(/invalid email|valid email/i)).toBeVisible();
    });

    test("should validate password strength", async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Enter weak password
      await page.getByLabel(/name/i).fill(TEST_USER.name);
      await page.getByLabel(/email/i).fill(TEST_USER.email);
      await page.getByLabel(/password/i).fill("123");

      await page.getByRole("button", { name: /sign up|register/i }).click();

      // Check for password validation error
      await expect(page.getByText(/password.*too short|at least.*characters/i)).toBeVisible();
    });

    test("should successfully register a new user", async ({ page }) => {
      // Generate unique email for test
      const uniqueEmail = `test-${Date.now()}example.com`;

      await page.goto(`${BASE_URL}/register`);

      // Fill in registration form
      await page.getByLabel(/name/i).fill(TEST_USER.name);
      await page.getByLabel(/email/i).fill(uniqueEmail);
      await page.getByLabel(/password/i).fill(TEST_USER.password);

      // Submit form
      await page.getByRole("button", { name: /sign up|register/i }).click();

      // Wait for navigation or success message
      await page.waitForURL(/verify-email|success|dashboard/i, { timeout: 10000 });

      // Check for success indication
      const currentUrl = page.url();
      expect(
        currentUrl.includes("verify-email") ||
          currentUrl.includes("success") ||
          currentUrl.includes("dashboard")
      ).toBeTruthy();
    });

    test("should prevent duplicate email registration", async ({ page }) => {
      // Try to register with same email twice
      const uniqueEmail = `duplicate-${Date.now()}example.com`;

      // First registration
      await page.goto(`${BASE_URL}/register`);
      await page.getByLabel(/name/i).fill(TEST_USER.name);
      await page.getByLabel(/email/i).fill(uniqueEmail);
      await page.getByLabel(/password/i).fill(TEST_USER.password);
      await page.getByRole("button", { name: /sign up|register/i }).click();
      await page.waitForURL(/verify-email|success|dashboard/i, { timeout: 10000 });

      // Try second registration with same email
      await page.goto(`${BASE_URL}/register`);
      await page.getByLabel(/name/i).fill(TEST_USER.name);
      await page.getByLabel(/email/i).fill(uniqueEmail);
      await page.getByLabel(/password/i).fill(TEST_USER.password);
      await page.getByRole("button", { name: /sign up|register/i }).click();

      // Check for duplicate email error
      await expect(
        page.getByText(/already registered|email.*exists|already in use/i)
      ).toBeVisible();
    });
  });

  test.describe("User Login", () => {
    test("should display login form", async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-in`);

      // Check for form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();
    });

    test("should validate empty credentials", async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-in`);

      // Try to submit empty form
      await page.getByRole("button", { name: /sign in|log in/i }).click();

      // Check for validation errors
      await expect(page.getByText(/required|cannot be empty/i)).toBeVisible();
    });

    test("should reject invalid credentials", async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-in`);

      // Enter invalid credentials
      await page.getByLabel(/email/i).fill("nonexistentexample.com");
      await page.getByLabel(/password/i).fill("WrongPassword123!");

      await page.getByRole("button", { name: /sign in|log in/i }).click();

      // Check for error message
      await expect(
        page.getByText(/invalid credentials|incorrect|not found|failed to sign in/i)
      ).toBeVisible();
    });

    test("should show 'forgot password' link", async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-in`);

      const forgotPasswordLink = page.getByRole("link", { name: /forgot.*password/i });
      await expect(forgotPasswordLink).toBeVisible();

      // Click and navigate
      await forgotPasswordLink.click();
      await expect(page).toHaveURL(/forgot-password/);
    });

    test("should show 'register' link", async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-in`);

      const registerLink = page.getByRole("link", { name: /sign up|register|create account/i });
      await expect(registerLink).toBeVisible();

      // Click and navigate
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    });
  });

  test.describe("Password Reset", () => {
    test("should display password reset request form", async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);

      // Check for form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /send|reset|submit/i })).toBeVisible();
    });

    test("should validate email in password reset", async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);

      // Enter invalid email
      await page.getByLabel(/email/i).fill("invalid-email");
      await page.getByRole("button", { name: /send|reset|submit/i }).click();

      // Check for validation error
      await expect(page.getByText(/invalid email|valid email/i)).toBeVisible();
    });

    test("should handle password reset request", async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);

      // Enter valid email
      await page.getByLabel(/email/i).fill(TEST_USER.email);
      await page.getByRole("button", { name: /send|reset|submit/i }).click();

      // Check for success message (even for non-existent email for security)
      await expect(
        page.getByText(/email sent|check your email|reset link|instructions sent/i)
      ).toBeVisible();
    });

    test("should validate new password on reset page", async ({ page }) => {
      // Navigate to reset password page with token
      await page.goto(`${BASE_URL}/reset-password?token=test-token`);

      // Check form elements
      await expect(page.getByLabel(/new password|password/i)).toBeVisible();
      await expect(page.getByLabel(/confirm.*password/i)).toBeVisible();

      // Try weak password
      await page
        .getByLabel(/new password|password/i)
        .first()
        .fill("123");
      await page.getByLabel(/confirm.*password/i).fill("123");
      await page.getByRole("button", { name: /reset|update|change/i }).click();

      // Check for validation error
      await expect(page.getByText(/password.*too short|at least.*characters/i)).toBeVisible();
    });

    test("should validate password confirmation match", async ({ page }) => {
      await page.goto(`${BASE_URL}/reset-password?token=test-token`);

      // Enter mismatched passwords
      await page
        .getByLabel(/new password|password/i)
        .first()
        .fill("NewPassword123!");
      await page.getByLabel(/confirm.*password/i).fill("DifferentPassword123!");
      await page.getByRole("button", { name: /reset|update|change/i }).click();

      // Check for mismatch error
      await expect(page.getByText(/passwords.*match|must match|don't match/i)).toBeVisible();
    });
  });

  test.describe("Email Verification", () => {
    test("should display verification pending page", async ({ page }) => {
      await page.goto(`${BASE_URL}/verify-email`);

      // Check for verification instructions
      await expect(page.getByText(/verify|check your email|verification/i)).toBeVisible();
    });

    test("should allow resending verification email", async ({ page }) => {
      await page.goto(`${BASE_URL}/resend-verification`);

      // Check for resend form
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /resend|send again/i })).toBeVisible();
    });

    test("should handle verification token page", async ({ page }) => {
      // Navigate with token
      await page.goto(`${BASE_URL}/verify-email?token=test-verification-token`);

      // Page should process the token
      // Check for success or error message
      await page.waitForSelector("text=/verified|invalid|expired/i", { timeout: 5000 });
      await expect(page.getByText(/verified|invalid|expired/i)).toBeVisible();
    });
  });

  test.describe("OAuth Authentication", () => {
    test("should display OAuth provider buttons on login page", async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-in`);

      // Check for OAuth buttons (Google, GitHub)
      const googleButton = page.getByRole("button", { name: /google/i });
      const githubButton = page.getByRole("button", { name: /github/i });

      // At least one OAuth provider should be visible
      const hasOAuth = (await googleButton.count()) > 0 || (await githubButton.count()) > 0;
      expect(hasOAuth).toBeTruthy();
    });

    test("should display OAuth provider buttons on register page", async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Check for OAuth buttons
      const googleButton = page.getByRole("button", { name: /google/i });
      const githubButton = page.getByRole("button", { name: /github/i });

      // At least one OAuth provider should be visible
      const hasOAuth = (await googleButton.count()) > 0 || (await githubButton.count()) > 0;
      expect(hasOAuth).toBeTruthy();
    });
  });

  test.describe("Sign Out", () => {
    test("should display sign out page", async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-out`);

      // Check for sign out confirmation
      await expect(page.getByText(/sign out|log out|signed out|logged out/i)).toBeVisible();
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect unauthenticated users to login", async ({ page }) => {
      // Try to access a protected route (assuming /bookmarks is protected)
      await page.goto(`${BASE_URL}/bookmarks`);

      // Should redirect to sign-in
      await page.waitForURL(/sign-in|login|auth/, { timeout: 5000 });
      expect(page.url()).toContain("sign-in");
    });

    test("should redirect unauthenticated users from admin routes", async ({ page }) => {
      // Try to access admin routes
      await page.goto(`${BASE_URL}/admin`);

      // Should redirect to sign-in
      await page.waitForURL(/sign-in|login|auth|unauthorized/, { timeout: 5000 });
      const url = page.url();
      expect(url.includes("sign-in") || url.includes("unauthorized")).toBeTruthy();
    });
  });
});
