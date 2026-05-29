import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression testing configuration for Percy.
 * Captures screenshots of key pages for visual regression detection.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e/visual-regression',
  fullyParallel: false, // Run sequentially for consistent visual captures
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker for visual consistency
  reporter: [
    ['html', { outputFolder: 'visual-regression-report' }],
    ['json', { outputFile: 'visual-regression-results.json' }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Percy integration
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev -- --port 3001',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },

  timeout: 60000,
  expect: {
    timeout: 10000,
  },
});
