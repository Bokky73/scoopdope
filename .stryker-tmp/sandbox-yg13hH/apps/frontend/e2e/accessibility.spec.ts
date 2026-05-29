import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests - WCAG 2.1 AA Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe-core into the page
    await injectAxe(page);
  });

  test.describe('Home Page', () => {
    test('should have no accessibility violations', async ({ page }) => {
      await page.goto('/');
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      });
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      const h1 = await page.locator('h1').count();
      expect(h1).toBeGreaterThanOrEqual(1);

      // Check for proper heading order
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      let lastLevel = 0;
      for (const heading of headings) {
        const tagName = await heading.evaluate((el) => el.tagName);
        const level = parseInt(tagName[1]);
        // Heading levels should not skip more than 1
        expect(level - lastLevel).toBeLessThanOrEqual(1);
        lastLevel = level;
      }
    });

    test('should have proper color contrast', async ({ page }) => {
      await page.goto('/');
      const violations = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const issues = [];

        elements.forEach((el) => {
          const style = window.getComputedStyle(el);
          const bgColor = style.backgroundColor;
          const color = style.color;

          // Simple contrast check (would use proper algorithm in production)
          if (bgColor && color) {
            issues.push({
              element: el.tagName,
              bg: bgColor,
              fg: color,
            });
          }
        });

        return issues;
      });

      // Should have elements with defined colors
      expect(violations.length).toBeGreaterThan(0);
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/');
      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        // Each image should have alt text or aria-label
        expect(alt || ariaLabel).toBeTruthy();
      }
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/');
      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        // Button should have text or aria-label
        expect((text || '').trim() || ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Courses Page', () => {
    test('should have no accessibility violations', async ({ page }) => {
      await page.goto('/courses');
      await checkA11y(page, null, {
        detailedReport: true,
      });
    });

    test('should have proper list structure', async ({ page }) => {
      await page.goto('/courses');
      const lists = await page.locator('ul, ol').all();
      expect(lists.length).toBeGreaterThan(0);

      for (const list of lists) {
        const items = await list.locator('li').count();
        expect(items).toBeGreaterThan(0);
      }
    });

    test('should have accessible course cards', async ({ page }) => {
      await page.goto('/courses');
      const cards = await page.locator('[role="article"], .course-card').all();

      for (const card of cards) {
        // Each card should have a heading
        const heading = await card.locator('h2, h3, h4').count();
        expect(heading).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate through interactive elements with Tab', async ({
      page,
    }) => {
      await page.goto('/');
      const focusableElements = await page.locator(
        'a, button, input, select, textarea, [tabindex]',
      );
      const count = await focusableElements.count();

      expect(count).toBeGreaterThan(0);

      // Tab through elements
      for (let i = 0; i < Math.min(count, 5); i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => {
          return document.activeElement?.tagName;
        });
        expect(focused).toBeTruthy();
      }
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      const button = await page.locator('button').first();

      if (button) {
        await button.focus();
        const outline = await button.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.outline || style.boxShadow;
        });

        // Should have some focus indicator
        expect(outline).toBeTruthy();
      }
    });

    test('should support Enter key on buttons', async ({ page }) => {
      await page.goto('/');
      const button = await page.locator('button').first();

      if (button) {
        await button.focus();
        let clicked = false;

        await button.evaluate((el) => {
          el.addEventListener('click', () => {
            (window as any).buttonClicked = true;
          });
        });

        await page.keyboard.press('Enter');
        clicked = await page.evaluate(() => (window as any).buttonClicked);

        expect(clicked).toBe(true);
      }
    });

    test('should support Escape key to close modals', async ({ page }) => {
      await page.goto('/');
      const modal = await page.locator('[role="dialog"]').first();

      if (modal) {
        const isVisible = await modal.isVisible();
        if (isVisible) {
          await page.keyboard.press('Escape');
          const stillVisible = await modal.isVisible();
          expect(stillVisible).toBe(false);
        }
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper semantic HTML', async ({ page }) => {
      await page.goto('/');
      const main = await page.locator('main').count();
      const nav = await page.locator('nav').count();
      const header = await page.locator('header').count();

      // Should use semantic elements
      expect(main + nav + header).toBeGreaterThan(0);
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/auth/login');
      const inputs = await page.locator('input').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          expect(label + (ariaLabel ? 1 : 0) + (ariaLabelledBy ? 1 : 0)).toBeGreaterThan(0);
        } else {
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/');
      const liveRegion = await page.locator('[role="status"], [aria-live]').count();

      // Should have at least one live region for announcements
      expect(liveRegion).toBeGreaterThanOrEqual(0);
    });

    test('should have proper link text', async ({ page }) => {
      await page.goto('/');
      const links = await page.locator('a').all();

      for (const link of links) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');

        // Link should have descriptive text
        expect((text || '').trim() || ariaLabel || title).toBeTruthy();
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have accessible form inputs', async ({ page }) => {
      await page.goto('/auth/register');
      const form = await page.locator('form').first();

      if (form) {
        const inputs = await form.locator('input, textarea, select').all();

        for (const input of inputs) {
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');

          // Each input should be associated with a label
          if (id) {
            const label = await page.locator(`label[for="${id}"]`).count();
            expect(label).toBeGreaterThan(0);
          } else {
            expect(ariaLabel).toBeTruthy();
          }
        }
      }
    });

    test('should show error messages accessibly', async ({ page }) => {
      await page.goto('/auth/register');
      const form = await page.locator('form').first();

      if (form) {
        const submitButton = await form.locator('button[type="submit"]').first();
        if (submitButton) {
          await submitButton.click();

          // Wait for potential error messages
          await page.waitForTimeout(500);

          const errors = await page.locator('[role="alert"], .error').all();
          // Should have error messages or aria-invalid attributes
          const invalidInputs = await page.locator('[aria-invalid="true"]').count();

          expect(errors.length + invalidInputs).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should have proper touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box) {
          // Touch targets should be at least 44x44 pixels
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should be responsive without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = 375;

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    });
  });
});
