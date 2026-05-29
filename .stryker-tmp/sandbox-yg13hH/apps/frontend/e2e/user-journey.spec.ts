import { test, expect } from '@playwright/test';

/**
 * Generates a unique email/username per test run so tests don't collide.
 */
function uniqueUser() {
  const ts = Date.now();
  return {
    username: `testuser_${ts}`,
    email: `testuser_${ts}@example.com`,
    password: 'Test@1234!',
  };
}

test.describe('Critical user journey: register → enroll → complete lesson', () => {
  test('register → login → browse courses → enroll → view lesson → mark complete', async ({ page }) => {
    const user = uniqueUser();

    // ── 1. Register ──────────────────────────────────────────────────────────
    await page.goto('/auth/register');
    await page.getByLabel(/username/i).fill(user.username);
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/^password$/i).fill(user.password);
    await page.getByRole('button', { name: /register|sign up|create account/i }).click();

    // After registration the app should redirect to login or dashboard
    await expect(page).toHaveURL(/login|dashboard|courses/);

    // ── 2. Login ─────────────────────────────────────────────────────────────
    // If redirected to login, fill credentials; otherwise already authenticated
    if (page.url().includes('login')) {
      await page.getByLabel(/email/i).fill(user.email);
      await page.getByLabel(/^password$/i).fill(user.password);
      await page.getByRole('button', { name: /log in|sign in/i }).click();
      await expect(page).not.toHaveURL(/login/);
    }

    // ── 3. Browse courses ────────────────────────────────────────────────────
    await page.goto('/courses');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Pick the first course
    const firstCourseLink = page.getByRole('link', { name: /view course|intro to stellar/i }).first();
    await expect(firstCourseLink).toBeVisible();
    await firstCourseLink.click();

    // ── 4. Enroll ────────────────────────────────────────────────────────────
    await expect(page).toHaveURL(/courses\/\d+|courses\/.+/);
    const enrollBtn = page.getByRole('button', { name: /enroll/i });
    await expect(enrollBtn).toBeVisible();
    await enrollBtn.click();

    // Confirm enrollment feedback
    await expect(
      page.getByText(/enrolled|you are enrolled|enrollment confirmed/i),
    ).toBeVisible({ timeout: 8_000 });

    // ── 5. View first lesson ─────────────────────────────────────────────────
    const lessonLink = page.getByRole('link', { name: /lesson|start|begin/i }).first();
    await expect(lessonLink).toBeVisible();
    await lessonLink.click();
    await expect(page).toHaveURL(/lesson/);

    // ── 6. Mark lesson complete ───────────────────────────────────────────────
    const completeBtn = page.getByRole('button', { name: /mark (as )?complete|complete lesson/i });
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();

    await expect(
      page.getByText(/completed|lesson complete|well done|progress saved/i),
    ).toBeVisible({ timeout: 8_000 });
  });
});
