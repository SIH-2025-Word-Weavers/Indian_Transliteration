import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './validation/scripts',
  testMatch: '**/*.spec.js',
  timeout: 90000, // 90s timeout for OCR
  retries: 0,
  workers: 1,
  reporter: 'list',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true, // Allow reusing existing dev server
    timeout: 30000,
  },
});
