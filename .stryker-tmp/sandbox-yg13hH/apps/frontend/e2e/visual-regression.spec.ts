import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for key pages.
 * These tests capture screenshots for visual regression detection.
 */

test.describe('Visual Regression - Dashboard', () => {
  test('dashboard page layout', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Capture full page screenshot
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
      mask: [page.locator('[data-testid="dynamic-content"]')],
    });
  });

  test('dashboard responsive layout - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
    });
  });

  test('dashboard header and navigation', async ({ page }) => {
    await page.goto('/dashboard');
    const header = page.locator('header');
    
    await expect(header).toHaveScreenshot('dashboard-header.png');
  });
});

test.describe('Visual Regression - Courses', () => {
  test('courses listing page', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('courses-list.png', {
      fullPage: true,
      mask: [page.locator('[data-testid="course-card"]')],
    });
  });

  test('course detail page', async ({ page }) => {
    await page.goto('/courses/1');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('course-detail.png', {
      fullPage: true,
    });
  });

  test('course enrollment modal', async ({ page }) => {
    await page.goto('/courses/1');
    await page.click('[data-testid="enroll-button"]');
    await page.waitForSelector('[data-testid="enrollment-modal"]');
    
    const modal = page.locator('[data-testid="enrollment-modal"]');
    await expect(modal).toHaveScreenshot('enrollment-modal.png');
  });
});

test.describe('Visual Regression - User Profile', () => {
  test('profile page layout', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('profile-page.png', {
      fullPage: true,
    });
  });

  test('profile achievements section', async ({ page }) => {
    await page.goto('/profile');
    const achievements = page.locator('[data-testid="achievements-section"]');
    
    await expect(achievements).toHaveScreenshot('profile-achievements.png');
  });

  test('profile credentials section', async ({ page }) => {
    await page.goto('/profile');
    const credentials = page.locator('[data-testid="credentials-section"]');
    
    await expect(credentials).toHaveScreenshot('profile-credentials.png');
  });
});

test.describe('Visual Regression - Authentication', () => {
  test('login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('login-page.png');
  });

  test('signup page', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('signup-page.png');
  });

  test('error states', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid');
    await page.click('[data-testid="submit-button"]');
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toHaveScreenshot('login-error.png');
  });
});

test.describe('Visual Regression - Components', () => {
  test('button states', async ({ page }) => {
    await page.goto('/components/buttons');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('buttons-component.png');
  });

  test('form inputs', async ({ page }) => {
    await page.goto('/components/forms');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('forms-component.png');
  });

  test('modals and dialogs', async ({ page }) => {
    await page.goto('/components/modals');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('modals-component.png');
  });

  test('notifications and alerts', async ({ page }) => {
    await page.goto('/components/notifications');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('notifications-component.png');
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`dashboard on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
        fullPage: true,
      });
    });
  }
});

test.describe('Visual Regression - Dark Mode', () => {
  test('dashboard in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
    });
  });

  test('courses in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('courses-dark-mode.png', {
      fullPage: true,
    });
  });
});
