import { defineConfig, devices } from '@playwright/test';

const defaultCiWorkers = 4;

function getWorkers(): number | string | undefined {
  const value = process.env.PLAYWRIGHT_WORKERS?.trim();

  if (!value) {
    return process.env.CI ? defaultCiWorkers : undefined;
  }

  if (/^\d+%$/.test(value)) {
    return value;
  }

  const workers = Number(value);
  return Number.isInteger(workers) && workers > 0 ? workers : defaultCiWorkers;
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: getWorkers(),
  reporter: 'html',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
