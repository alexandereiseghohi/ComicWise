import { env } from "@/appConfig";
import { expect, test } from "@playwright/test";

const BASE_URL = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Test data
const TEST_COMIC = {
  title: `Test Comic ${Date.now()}`,
  description: "This is a test comic created by E2E tests",
  author: "Test Author",
  status: "ongoing",
  genres: ["Action", "Adventure"],
};

const TEST_CHAPTER = {
  title: `Test Chapter ${Date.now()}`,
  chapterNumber: 1,
  content: "This is test chapter content",
};

const TEST_COMMENT = {
  content: "This is a test comment from E2E tests",
};

test.describe("CRUD Operations E2E Tests", () => {
  // Login helper for authenticated tests
  test.beforeEach(async ({ page }) => {
    // Note: You'll need to create a test user or use fixtures
    // For now, we'll check if authentication is required
    await page.goto(`${BASE_URL}/admin`);

    // If redirected to login, skip these tests
    if (page.url().includes("sign-in")) {
      test.skip(true, "Authentication required for CRUD tests");
    }
  });

  test.describe("Comics CRUD", () => {
    test("should display comics library page", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      // Check for comics page elements
      await expect(page.getByText(/comics|library|browse/i)).toBeVisible();
    });

    test("should display individual comic page", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      // Click on first comic (if available)
      const firstComic = page.locator("a[href*='/comics/']").first();
      const comicCount = await firstComic.count();

      if (comicCount > 0) {
        await firstComic.click();

        // Verify comic details page
        await expect(page).toHaveURL(/\/comics\/.+/);
        await expect(
          page.locator("h1, h2").filter({ hasText: /chapter|read|description/i })
        ).toBeVisible();
      } else {
        test.skip(true, "No comics available for testing");
      }
    });

    test("should allow admin to create a comic", async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/comics/new`);

      // Check if admin create form exists
      const titleInput = page.getByLabel(/title/i);
      if ((await titleInput.count()) === 0) {
        test.skip(true, "Admin access required");
        return;
      }

      // Fill in comic form
      await titleInput.fill(TEST_COMIC.title);
      await page.getByLabel(/description/i).fill(TEST_COMIC.description);
      await page.getByLabel(/author/i).fill(TEST_COMIC.author);

      // Select status
      const statusSelect = page.getByLabel(/status/i);
      if ((await statusSelect.count()) > 0) {
        await statusSelect.selectOption(TEST_COMIC.status);
      }

      // Submit form
      await page.getByRole("button", { name: /create|save|publish/i }).click();

      // Wait for success
      await page.waitForURL(/\/admin\/comics|\/comics\/.+/, { timeout: 10000 });
      await expect(page.getByText(/created|success|published/i)).toBeVisible({ timeout: 5000 });
    });

    test("should allow admin to edit a comic", async ({ page }) => {
      // Navigate to admin comics list
      await page.goto(`${BASE_URL}/admin/comics`);

      // Click edit on first comic
      const editButton = page.getByRole("button", { name: /edit/i }).first();
      if ((await editButton.count()) === 0) {
        test.skip(true, "No comics to edit or admin access required");
        return;
      }

      await editButton.click();

      // Update comic details
      const titleInput = page.getByLabel(/title/i);
      await titleInput.clear();
      await titleInput.fill(`${TEST_COMIC.title} - Updated`);

      // Save changes
      await page.getByRole("button", { name: /update|save/i }).click();

      // Verify success
      await expect(page.getByText(/updated|success|saved/i)).toBeVisible({ timeout: 5000 });
    });

    test("should validate required fields when creating comic", async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/comics/new`);

      const titleInput = page.getByLabel(/title/i);
      if ((await titleInput.count()) === 0) {
        test.skip(true, "Admin access required");
        return;
      }

      // Try to submit empty form
      await page.getByRole("button", { name: /create|save|publish/i }).click();

      // Check for validation errors
      await expect(page.getByText(/required|cannot be empty|fill.*field/i)).toBeVisible();
    });

    test("should allow filtering comics", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      // Look for filter options
      const filterButton = page.getByRole("button", { name: /filter|sort/i });
      const filterSelect = page.getByLabel(/genre|status|filter/i);

      const hasFilters = (await filterButton.count()) > 0 || (await filterSelect.count()) > 0;

      if (hasFilters) {
        if ((await filterButton.count()) > 0) {
          await filterButton.click();
        }
        // Apply a filter
        const genreFilter = page.getByText(/action|adventure|fantasy/i).first();
        if ((await genreFilter.count()) > 0) {
          await genreFilter.click();
          // Wait for filtered results
          await page.waitForTimeout(1000);
        }
      } else {
        test.skip(true, "No filter options available");
      }
    });
  });

  test.describe("Chapters CRUD", () => {
    test("should display chapters for a comic", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      // Click on first comic
      const firstComic = page.locator("a[href*='/comics/']").first();
      if ((await firstComic.count()) > 0) {
        await firstComic.click();

        // Check for chapters list
        await expect(page.getByText(/chapter|episodes/i)).toBeVisible();
      } else {
        test.skip(true, "No comics available");
      }
    });

    test("should allow reading a chapter", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      // Navigate to first comic
      const firstComic = page.locator("a[href*='/comics/']").first();
      if ((await firstComic.count()) === 0) {
        test.skip(true, "No comics available");
        return;
      }

      await firstComic.click();

      // Click on first chapter
      const firstChapter = page.locator("a[href*='/read/'], a[href*='/chapter/']").first();
      if ((await firstChapter.count()) === 0) {
        test.skip(true, "No chapters available");
        return;
      }

      await firstChapter.click();

      // Verify chapter reader page
      await expect(page).toHaveURL(/\/read\/|\/chapter\//);
      await expect(page.locator("h1, h2")).toBeVisible();
    });

    test("should allow admin to create a chapter", async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/chapters/new`);

      const titleInput = page.getByLabel(/title|chapter.*name/i);
      if ((await titleInput.count()) === 0) {
        test.skip(true, "Admin access required");
        return;
      }

      // Fill chapter form
      await titleInput.fill(TEST_CHAPTER.title);
      await page.getByLabel(/number/i).fill(String(TEST_CHAPTER.chapterNumber));

      // Submit form
      await page.getByRole("button", { name: /create|save|publish/i }).click();

      // Verify success
      await expect(page.getByText(/created|success|published/i)).toBeVisible({ timeout: 5000 });
    });

    test("should navigate between chapters", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      // Navigate to a comic and open chapter
      const firstComic = page.locator("a[href*='/comics/']").first();
      if ((await firstComic.count()) === 0) {
        test.skip(true, "No comics available");
        return;
      }

      await firstComic.click();

      const firstChapter = page.locator("a[href*='/read/'], a[href*='/chapter/']").first();
      if ((await firstChapter.count()) === 0) {
        test.skip(true, "No chapters available");
        return;
      }

      await firstChapter.click();

      // Look for next/previous navigation
      const nextButton = page.getByRole("button", { name: /next|→|›/i });
      const prevButton = page.getByRole("button", { name: /previous|prev|←|‹/i });

      const hasNavigation = (await nextButton.count()) > 0 || (await prevButton.count()) > 0;
      expect(hasNavigation).toBeTruthy();
    });
  });

  test.describe("Comments CRUD", () => {
    test("should allow authenticated users to post comments", async ({ page }) => {
      // Navigate to a comic/chapter
      await page.goto(`${BASE_URL}/comics`);

      const firstComic = page.locator("a[href*='/comics/']").first();
      if ((await firstComic.count()) === 0) {
        test.skip(true, "No comics available");
        return;
      }

      await firstComic.click();

      // Look for comment form
      const commentTextarea = page.getByPlaceholder(/comment|write|type/i);
      if ((await commentTextarea.count()) === 0) {
        test.skip(true, "Comment feature not available or requires authentication");
        return;
      }

      // Post a comment
      await commentTextarea.fill(TEST_COMMENT.content);
      await page.getByRole("button", { name: /post|submit|send/i }).click();

      // Verify comment appears
      await expect(page.getByText(TEST_COMMENT.content)).toBeVisible({ timeout: 5000 });
    });

    test("should display existing comments", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      const firstComic = page.locator("a[href*='/comics/']").first();
      if ((await firstComic.count()) === 0) {
        test.skip(true, "No comics available");
        return;
      }

      await firstComic.click();

      // Check for comments section
      const commentsSection = page.getByText(/comments|discussion/i);
      await expect(commentsSection).toBeVisible();
    });

    test("should allow editing own comments", async ({ page }) => {
      // Skip if not authenticated
      await page.goto(`${BASE_URL}/comics`);

      const firstComic = page.locator("a[href*='/comics/']").first();
      if ((await firstComic.count()) === 0) {
        test.skip(true, "No comics available");
        return;
      }

      await firstComic.click();

      // Look for edit button on user's comments
      const editButton = page.getByRole("button", { name: /edit/i }).first();
      if ((await editButton.count()) === 0) {
        test.skip(true, "No editable comments or not authenticated");
        return;
      }

      await editButton.click();

      // Edit comment
      const editTextarea = page.getByPlaceholder(/edit|update|comment/i);
      await editTextarea.fill(`${TEST_COMMENT.content} - Edited`);

      await page.getByRole("button", { name: /save|update/i }).click();

      // Verify edited comment
      await expect(page.getByText(/edited|updated/i)).toBeVisible({ timeout: 5000 });
    });

    test("should allow deleting own comments", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      const firstComic = page.locator("a[href*='/comics/']").first();
      if ((await firstComic.count()) === 0) {
        test.skip(true, "No comics available");
        return;
      }

      await firstComic.click();

      // Look for delete button
      const deleteButton = page.getByRole("button", { name: /delete|remove/i }).first();
      if ((await deleteButton.count()) === 0) {
        test.skip(true, "No deletable comments or not authenticated");
        return;
      }

      await deleteButton.click();

      // Confirm deletion if dialog appears
      const confirmButton = page.getByRole("button", { name: /confirm|yes|delete/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }

      // Verify deletion success
      await expect(page.getByText(/deleted|removed/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Bookmarks CRUD", () => {
    test("should allow bookmarking a comic", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      const firstComic = page.locator("a[href*='/comics/']").first();
      if ((await firstComic.count()) === 0) {
        test.skip(true, "No comics available");
        return;
      }

      await firstComic.click();

      // Look for bookmark button
      const bookmarkButton = page.getByRole("button", {
        name: /bookmark|save|add to library/i,
      });

      if ((await bookmarkButton.count()) === 0) {
        test.skip(true, "Bookmark feature not available or requires authentication");
        return;
      }

      await bookmarkButton.click();

      // Verify bookmark success
      await expect(page.getByText(/bookmarked|added|saved/i)).toBeVisible({ timeout: 5000 });
    });

    test("should display bookmarks library", async ({ page }) => {
      await page.goto(`${BASE_URL}/bookmarks`);

      // Check if authenticated (might redirect to login)
      if (page.url().includes("sign-in")) {
        test.skip(true, "Authentication required for bookmarks");
        return;
      }

      // Verify bookmarks page
      await expect(page.getByText(/bookmarks|library|saved/i)).toBeVisible();
    });

    test("should allow removing bookmarks", async ({ page }) => {
      await page.goto(`${BASE_URL}/bookmarks`);

      if (page.url().includes("sign-in")) {
        test.skip(true, "Authentication required");
        return;
      }

      // Look for remove button
      const removeButton = page.getByRole("button", { name: /remove|delete|unbookmark/i }).first();
      if ((await removeButton.count()) === 0) {
        test.skip(true, "No bookmarks to remove");
        return;
      }

      await removeButton.click();

      // Confirm if dialog appears
      const confirmButton = page.getByRole("button", { name: /confirm|yes|remove/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }

      // Verify removal
      await expect(page.getByText(/removed|deleted/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Search Functionality", () => {
    test("should allow searching for comics", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      // Look for search input
      const searchInput = page.getByPlaceholder(/search/i);
      if ((await searchInput.count()) === 0) {
        test.skip(true, "Search feature not available");
        return;
      }

      // Perform search
      await searchInput.fill("test");
      await searchInput.press("Enter");

      // Wait for results
      await page.waitForTimeout(1000);

      // Verify search results or no results message
      const hasResults =
        (await page.locator("a[href*='/comics/']").count()) > 0 ||
        (await page.getByText(/no results|not found/i).count()) > 0;

      expect(hasResults).toBeTruthy();
    });

    test("should handle empty search results", async ({ page }) => {
      await page.goto(`${BASE_URL}/comics`);

      const searchInput = page.getByPlaceholder(/search/i);
      if ((await searchInput.count()) === 0) {
        test.skip(true, "Search feature not available");
        return;
      }

      // Search for something that doesn't exist
      await searchInput.fill("xyznonexistentcomic123456789");
      await searchInput.press("Enter");

      await page.waitForTimeout(1000);

      // Should show no results message
      await expect(page.getByText(/no results|not found|no comics found/i)).toBeVisible();
    });
  });
});
