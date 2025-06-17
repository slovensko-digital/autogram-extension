import { PlaywrightTestConfig, devices } from '@playwright/test';
import path from 'path';

const config: PlaywrightTestConfig = {
  testDir: './',
  timeout: 30 * 1000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    actionTimeout: 15000,
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            `--disable-extensions-except=${path.join(process.cwd(), 'dist')}`,
            `--load-extension=${path.join(process.cwd(), 'dist')}`,
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox extensions are packed differently
        launchOptions: {
          firefoxUserPrefs: {
            'extensions.autoDisableScopes': 0,
            'extensions.enableScopes': 15,
          },
        },
      },
    },
  ],
};

export default config;
