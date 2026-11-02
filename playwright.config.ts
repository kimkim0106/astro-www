import { defineConfig, devices } from '@playwright/test';

const defaultCiWorkers = 4;

// WebKit (Linux) は Google Fonts の Noto Sans JP の太字 (700) の見出しを、
// 実行ごとに輪郭が数ピクセルずつ違う形で描画する。レイアウトや本文 (500) は変わらない。
// 同じブラウザのバージョンで実測した差は 1 枚あたり 124〜250 ピクセルだった。
// 色の差が大きく、threshold を 0.5 に上げても吸収できないため、差分ピクセル数で許容する。
// 過去の基準画像の更新で、内容が変わったときの差は最小でも 576 ピクセルだったので、
// 上限はその間の 400 とし、文言の変更やレイアウト崩れは引き続き失敗にする。
const webkitScreenshotTolerance = {
  toHaveScreenshot: { maxDiffPixels: 400 },
};

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
      expect: webkitScreenshotTolerance,
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      expect: webkitScreenshotTolerance,
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
