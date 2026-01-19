import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('h1')).toContainText(/sign in/i);
  });

  test('should display sign-up page', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.locator('h1')).toContainText(/sign up/i);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/sign-in');
    await page.click('text=/forgot password/i');
    await expect(page).toHaveURL(/forgot-password/);
  });
});

test.describe('Comic Listing', () => {
  test('should display comics on homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="comic-card"]').first()).toBeVisible();
  });

  test('should display comics listing page', async ({ page }) => {
    await page.goto('/comics');
    await expect(page.locator('h1')).toContainText(/comics/i);
  });

  test('should filter comics by genre', async ({ page }) => {
    await page.goto('/comics');
    await page.click('[data-testid="genre-filter"]');
    await page.click('text=/action/i');
    await expect(page).toHaveURL(/genre=action/);
  });

  test('should search for comics', async ({ page }) => {
    await page.goto('/comics');
    await page.fill('[data-testid="search-input"]', 'test');
    await page.press('[data-testid="search-input"]', 'Enter');
    await expect(page).toHaveURL(/search=test/);
  });
});

test.describe('Comic Details', () => {
  test('should display comic details page', async ({ page }) => {
    await page.goto('/comics/test-comic');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show chapters list', async ({ page }) => {
    await page.goto('/comics/test-comic');
    await expect(page.locator('[data-testid="chapter-list"]')).toBeVisible();
  });

  test('should display bookmark button', async ({ page }) => {
    await page.goto('/comics/test-comic');
    await expect(page.locator('button:has-text("Bookmark")')).toBeVisible();
  });
});

test.describe('Chapter Reader', () => {
  test('should display chapter reader', async ({ page }) => {
    await page.goto('/comics/test-comic/1');
    await expect(page.locator('[data-testid="chapter-reader"]')).toBeVisible();
  });

  test('should navigate between pages with arrow keys', async ({ page }) => {
    await page.goto('/comics/test-comic/1');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
  });

  test('should toggle reading mode', async ({ page }) => {
    await page.goto('/comics/test-comic/1');
    await page.click('[data-testid="reading-mode-toggle"]');
    await expect(page.locator('[data-value="horizontal"]')).toBeVisible();
  });
});

test.describe('Bookmarks', () => {
  test.beforeEach(async ({ page }) => {
    // Login before bookmark tests
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should add bookmark', async ({ page }) => {
    await page.goto('/comics/test-comic');
    await page.click('button:has-text("Add to Bookmarks")');
    await expect(page.locator('button:has-text("Bookmarked")')).toBeVisible();
  });

  test('should display bookmarks page', async ({ page }) => {
    await page.goto('/bookmarks');
    await expect(page.locator('h1')).toContainText(/bookmarks/i);
  });

  test('should remove bookmark from bookmarks page', async ({ page }) => {
    await page.goto('/bookmarks');
    await page.click('[data-testid="remove-bookmark"]');
    await expect(page.locator('text=/removed/i')).toBeVisible();
  });
});

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login before profile tests
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('h1')).toContainText(/profile/i);
  });

  test('should display edit profile page', async ({ page }) => {
    await page.goto('/profile/edit');
    await expect(page.locator('h1')).toContainText(/edit/i);
  });

  test('should update profile information', async ({ page }) => {
    await page.goto('/profile/edit');
    await page.fill('[name="name"]', 'Updated Name');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/updated/i')).toBeVisible();
  });

  test('should change password', async ({ page }) => {
    await page.goto('/profile/change-password');
    await page.fill('[name="currentPassword"]', 'testpassword');
    await page.fill('[name="newPassword"]', 'newtestpassword');
    await page.fill('[name="confirmPassword"]', 'newtestpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/changed/i')).toBeVisible();
  });
});

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText(/admin/i);
  });

  test('should display comics management page', async ({ page }) => {
    await page.goto('/admin/comics');
    await expect(page.locator('[data-testid="admin-table"]')).toBeVisible();
  });

  test('should create new comic', async ({ page }) => {
    await page.goto('/admin/comics/new');
    await page.fill('[name="title"]', 'New Test Comic');
    await page.fill('[name="description"]', 'Test description');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/created/i')).toBeVisible();
  });

  test('should edit comic', async ({ page }) => {
    await page.goto('/admin/comics/1');
    await page.fill('[name="title"]', 'Updated Comic Title');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/updated/i')).toBeVisible();
  });

  test('should delete comic', async ({ page }) => {
    await page.goto('/admin/comics');
    await page.click('[data-testid="delete-button"]');
    await page.click('text=/confirm/i');
    await expect(page.locator('text=/deleted/i')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/comics');
    const images = await page.locator('img[loading="lazy"]').count();
    expect(images).toBeGreaterThan(0);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/comics');
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
