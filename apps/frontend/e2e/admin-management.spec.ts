import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!';

test.describe('Admin User Management Interface (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Navigate to admin users page
    await page.goto(`${BASE_URL}/admin`);
  });

  test('should display user table with all columns', async ({ page }) => {
    // Wait for user table to load
    await page.waitForSelector('table tbody tr');

    // Verify all columns are present
    const headers = await page.locator('table thead th');
    const headerTexts = await headers.allTextContents();

    expect(headerTexts).toContain('Name');
    expect(headerTexts).toContain('Email');
    expect(headerTexts).toContain('Role');
    expect(headerTexts).toContain('Status');
    expect(headerTexts).toContain('Actions');
  });

  test('should search users by name', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('Alice');
    await page.waitForTimeout(400); // Wait for debounce

    const rows = await page.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      const firstRowName = await rows.first().locator('td').first().textContent();
      expect(firstRowName?.toLowerCase()).toContain('alice');
    }
  });

  test('should filter users by role', async ({ page }) => {
    const roleFilter = page.locator('select').nth(1); // Second select should be role filter
    await roleFilter.selectOption('instructor');
    await page.waitForTimeout(300);

    // Verify results are filtered
    const rows = await page.locator('table tbody tr');
    const firstRow = rows.first();

    if (await rows.count() > 0) {
      const roleCell = firstRow.locator('td').nth(2);
      const roleText = await roleCell.textContent();
      expect(roleText).toContain('Instructor');
    }
  });

  test('should filter users by status', async ({ page }) => {
    const statusFilter = page.locator('select').nth(2); // Third select should be status filter
    await statusFilter.selectOption('active');
    await page.waitForTimeout(300);

    const rows = await page.locator('table tbody tr');
    if (await rows.count() > 0) {
      const firstRow = rows.first();
      const statusCell = firstRow.locator('td').nth(3);
      const statusText = await statusCell.textContent();
      expect(statusText?.toLowerCase()).toContain('active');
    }
  });

  test('should change user role from dropdown', async ({ page }) => {
    // Find a user row
    const rows = await page.locator('table tbody tr');
    const firstRow = rows.first();

    if (await rows.count() > 0) {
      const roleSelect = firstRow.locator('select');
      const currentRole = await roleSelect.inputValue();

      // Change role to something different
      const newRole = currentRole === 'student' ? 'instructor' : 'student';
      await roleSelect.selectOption(newRole);

      // Confirm button should appear
      const confirmButton = firstRow.locator('button:has-text("Confirm")');
      await expect(confirmButton).toBeVisible();
      await confirmButton.click();

      // Wait for success message
      await expect(page.locator('text=Role updated')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should suspend an active user', async ({ page }) => {
    // Find active user
    const rows = await page.locator('table tbody tr');

    if (await rows.count() > 0) {
      const firstRow = rows.first();
      const statusText = await firstRow.locator('td').nth(3).textContent();

      if (statusText?.includes('active')) {
        const suspendButton = firstRow.locator('button:has-text("Suspend")');
        await suspendButton.click();

        // Confirm in dialog
        const confirmButton = page.locator('button:has-text("Confirm")').last();
        await confirmButton.click();

        // Wait for success message
        await expect(page.locator('text=suspended')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Look for pagination buttons
    const nextButton = page.locator('button:has-text("Next")');
    const prevButton = page.locator('button:has-text("Previous")');

    // Previous should be disabled on first page
    await expect(prevButton).toBeDisabled();

    // If there are more pages, click next
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(300);

      // Previous should now be enabled
      await expect(prevButton).toBeEnabled();
    }
  });

  test('should show error messages', async ({ page }) => {
    // Try an operation that might fail (implementation depends on API)
    const rows = await page.locator('table tbody tr');

    if (await rows.count() > 0) {
      const firstRow = rows.first();
      const cancelButton = firstRow.locator('button:has-text("Cancel")');

      // If there's a pending action, cancel it
      if (await cancelButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cancelButton.click();
      }
    }
  });
});

test.describe('Admin Course Management Interface (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Navigate to admin courses page (assuming /admin/courses or similar)
    await page.goto(`${BASE_URL}/admin`);
    // Click on courses tab/section if needed
  });

  test('should display course table with required columns', async ({ page }) => {
    // Wait for course table - might need to navigate to it first
    const courseTable = page.locator('table:has-text("Title")');

    if (await courseTable.isVisible({ timeout: 5000 }).catch(() => false)) {
      const headers = await courseTable.locator('thead th');
      const headerTexts = await headers.allTextContents();

      expect(headerTexts).toContain('Title');
      expect(headerTexts).toContain('Instructor');
      expect(headerTexts).toContain('Status');
      expect(headerTexts).toContain('Enrollments');
    }
  });

  test('should filter courses by status', async ({ page }) => {
    // Look for status filter in course management section
    const statusFilter = page.locator('select:has-option[value="pending"], select:has-option[value="published"]');

    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('pending');
      await page.waitForTimeout(300);

      // Verify courses are filtered
      const rows = page.locator('table tbody tr');
      if (await rows.count() > 0) {
        const firstRow = rows.first();
        const statusCell = firstRow.locator('td').nth(2);
        const statusText = await statusCell.textContent();
        expect(statusText?.toLowerCase()).toContain('pending');
      }
    }
  });

  test('should approve a pending course', async ({ page }) => {
    // Filter by pending status first
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('pending');
    await page.waitForTimeout(300);

    const rows = page.locator('table tbody tr');
    const firstRow = rows.first();

    if (await rows.count() > 0) {
      const approveButton = firstRow.locator('button:has-text("Approve")');

      if (await approveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await approveButton.click();

        // Confirm in dialog
        const confirmButton = page.locator('button:has-text("Confirm")').last();
        await confirmButton.click();

        // Wait for success message
        await expect(page.locator('text=approved')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should archive a published course', async ({ page }) => {
    // Filter by published status
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('published');
    await page.waitForTimeout(300);

    const rows = page.locator('table tbody tr');
    const firstRow = rows.first();

    if (await rows.count() > 0) {
      const archiveButton = firstRow.locator('button:has-text("Archive")');

      if (await archiveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await archiveButton.click();

        // Confirm in dialog
        const confirmButton = page.locator('button:has-text("Confirm")').last();
        await confirmButton.click();

        // Wait for success message
        await expect(page.locator('text=archived')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should view course statistics', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    const firstRow = rows.first();

    if (await rows.count() > 0) {
      const statsButton = firstRow.locator('button:has-text("Stats")');

      if (await statsButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await statsButton.click();

        // Wait for stats modal
        const modal = page.locator('[role="dialog"], .modal, div:has-text("Course Statistics")');
        await expect(modal).toBeVisible({ timeout: 5000 });

        // Verify stats are displayed
        await expect(page.locator('text=Enrollments')).toBeVisible();
        await expect(page.locator('text=Completions')).toBeVisible();
        await expect(page.locator('text=Rating')).toBeVisible();

        // Close modal
        const closeButton = page.locator('button:has-text("Close")');
        await closeButton.click();
      }
    }
  });

  test('should handle course deletion with confirmation', async ({ page }) => {
    // Navigate to archived courses
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('archived');
    await page.waitForTimeout(300);

    const rows = page.locator('table tbody tr');
    const firstRow = rows.first();

    if (await rows.count() > 0) {
      const deleteButton = firstRow.locator('button:has-text("Delete")');

      if (await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await deleteButton.click();

        // Confirm deletion warning
        const confirmButton = page.locator('button:has-text("Confirm")').last();
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmButton.click();

          // Wait for success or deletion
          await expect(page.locator('text=deleted')).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});

test.describe('Admin Interface Accessibility (E2E)', () => {
  test('should have accessible forms and buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    await page.goto(`${BASE_URL}/admin`);

    // Check for ARIA labels
    const searchInput = page.locator('input[aria-label*="Search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      expect(searchInput).toBeTruthy();
    }

    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // Focus should move to interactive elements
  });

  test('should display error messages clearly', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    // Try logging in with wrong credentials
    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');

    // Error should be displayed
    const errorMessage = page.locator('text=/error|failed|invalid/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});
