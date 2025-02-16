import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './src/tests',
  timeout: 60000,
  retries: 0,
  expect: {
    timeout: 5000, // 5s for expect-based checks
  },
  workers: 1,

  // Add this to launch Chrome in headed mode
  use: {
    headless: false, // This launches the browser in headed mode
    browserName: 'chromium', // Specifically use Chrome
    viewport: { width: 1280, height: 720 }, // Optional: set a specific viewport size
  },

  projects: [
    {
      name: 'api-tests',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        baseURL: 'https://jsonplaceholder.typicode.com'
      }
    },
    {
      name: 'ui-tests',
      testMatch: '**/ui/**/*.spec.ts',
      use: {
        baseURL: 'https://www.saucedemo.com',
        screenshot: { mode: 'only-on-failure' },
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      }
    }
  ],

  reporter: [
    ['line'],
    ['allure-playwright', { outputFolder: "./allure-results" }],
    ['html', {
      open: 'never'
    }]
  ]
};

export default config;