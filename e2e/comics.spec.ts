/**
 * E2E Tests - Comic Reading Flow
 */

import { expect, test } from "@playwright/test";

test.describe("Comic Discovery", () => {
  test("should display homepage with comics", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /featured|popular|latest/i })).toBeVisible();
    await expect(page.locator('[data-testid="comic-card"]').first()).toBeVisible();
  });

  test("should navigate to comic detail page", async ({ page }) => {
    await page.goto("/");

    const firstComic = page.locator('[data-testid="comic-card"]').first();
    const comicTitle = await firstComic.getByRole("heading").textContent();

    await firstComic.click();

    await expect(page).toHaveURL(/\/comics\/\d+/);
    if (comicTitle) {
      await expect(page.getByRole("heading", { name: comicTitle })).toBeVisible();
    }
  });

  test("should display comic chapters", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-testid="comic-card"]').first().click();
    await expect(page.locator('[data-testid="chapter-list"]')).toBeVisible();
  });

  test("should search for comics", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("test");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/\/search/);
  });

  test("should filter by genre", async ({ page }) => {
    await page.goto("/");

    await page.click('a[href*="genre"]');
    await expect(page).toHaveURL(/genre/);
    await expect(page.locator('[data-testid="comic-card"]')).toHaveCount(1, {
      timeout: 5000,
    });
  });
});

test.describe("Comic Reading", () => {
  test("should navigate to chapter reader", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-testid="comic-card"]').first().click();
    await page.locator('[data-testid="chapter-item"]').first().click();

    await expect(page).toHaveURL(/\/comics\/\d+\/chapters\/\d+/);
    await expect(page.locator('[data-testid="chapter-page"]')).toBeVisible();
  });

  test("should navigate between pages", async ({ page }) => {
    test.skip(!process.env["TEST_CHAPTER_URL"], "Requires test chapter URL");

    await page.goto(process.env["TEST_CHAPTER_URL"]!);

    const nextButton = page.getByRole("button", { name: /next/i });
    await nextButton.click();

    // Should show next page
    await expect(page.locator('[data-testid="chapter-page"]')).toBeVisible();
  });

  test("should display navigation controls", async ({ page }) => {
    test.skip(!process.env["TEST_CHAPTER_URL"], "Requires test chapter URL");

    await page.goto(process.env["TEST_CHAPTER_URL"]!);

    await expect(page.getByRole("button", { name: /previous/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /next/i })).toBeVisible();
  });

  test("should support keyboard navigation", async ({ page }) => {
    test.skip(!process.env["TEST_CHAPTER_URL"], "Requires test chapter URL");

    await page.goto(process.env["TEST_CHAPTER_URL"]!);

    await page.keyboard.press("ArrowRight");
    // Should navigate to next page
    await expect(page.locator('[data-testid="chapter-page"]')).toBeVisible();
  });
});

test.describe("Bookmarks", () => {
  test("should require authentication to bookmark", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-testid="comic-card"]').first().click();

    const bookmarkButton = page.getByRole("button", { name: /bookmark/i });
    await bookmarkButton.click();

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("should bookmark comic when authenticated", async ({ page }) => {
    test.skip(!process.env["TEST_USER_EMAIL"], "Requires test authentication");

    await page.goto("/");
    await page.locator('[data-testid="comic-card"]').first().click();

    const bookmarkButton = page.getByRole("button", { name: /bookmark/i });
    await bookmarkButton.click();

    await expect(page.getByText(/bookmarked|added to library/i)).toBeVisible();
  });

  test("should display bookmarks in library", async ({ page }) => {
    test.skip(!process.env["TEST_USER_EMAIL"], "Requires test authentication");

    await page.goto("/bookmarks");

    await expect(page.getByRole("heading", { name: /library|bookmarks/i })).toBeVisible();
    await expect(page.locator('[data-testid="comic-card"]')).toHaveCount(1, { timeout: 5000 });
  });

  test("should remove bookmark", async ({ page }) => {
    test.skip(!process.env["TEST_USER_EMAIL"], "Requires test authentication");

    await page.goto("/bookmarks");

    const removeButton = page.getByRole("button", { name: /remove/i }).first();
    await removeButton.click();

    await expect(page.getByText(/removed|unbookmarked/i)).toBeVisible();
  });
});

test.describe("Comments", () => {
  test("should display comments section", async ({ page }) => {
    test.skip(!process.env["TEST_CHAPTER_URL"], "Requires test chapter URL");

    await page.goto(process.env["TEST_CHAPTER_URL"]!);

    await expect(page.getByRole("heading", { name: /comments/i })).toBeVisible();
  });

  test("should require authentication to comment", async ({ page }) => {
    test.skip(!process.env["TEST_CHAPTER_URL"], "Requires test chapter URL");

    await page.goto(process.env["TEST_CHAPTER_URL"]!);

    const commentInput = page.getByPlaceholder(/add.*comment/i);
    await commentInput.fill("Test comment");
    await page.getByRole("button", { name: /post|submit/i }).click();

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("should post comment when authenticated", async ({ page }) => {
    test.skip(!process.env["TEST_USER_EMAIL"], "Requires test authentication");
    test.skip(!process.env["TEST_CHAPTER_URL"], "Requires test chapter URL");

    await page.goto(process.env["TEST_CHAPTER_URL"]!);

    const commentText = `Test comment ${Date.now()}`;
    const commentInput = page.getByPlaceholder(/add.*comment/i);
    await commentInput.fill(commentText);
    await page.getByRole("button", { name: /post|submit/i }).click();

    await expect(page.getByText(commentText)).toBeVisible();
  });

  test("should validate comment length", async ({ page }) => {
    test.skip(!process.env["TEST_USER_EMAIL"], "Requires test authentication");
    test.skip(!process.env["TEST_CHAPTER_URL"], "Requires test chapter URL");

    await page.goto(process.env["TEST_CHAPTER_URL"]!);

    const commentInput = page.getByPlaceholder(/add.*comment/i);
    await commentInput.fill("");
    await page.getByRole("button", { name: /post|submit/i }).click();

    await expect(page.getByText(/comment.*required|cannot be empty/i)).toBeVisible();
  });
});
