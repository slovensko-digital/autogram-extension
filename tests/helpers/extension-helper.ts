import { BrowserContext, Browser, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export async function setupBrowserWithExtension(browser: Browser): Promise<BrowserContext> {
  // Different approaches based on browser type
  if (browser.browserType().name() === 'firefox') {
    // For Firefox, we need to create a temporary extension file
    const extensionPath = path.join(__dirname, '../../dist');
    
    return await browser.newContext({
      viewport: { width: 1280, height: 720 },
      // Additional Firefox-specific config could be added here
    });
  } else {
    // For Chromium-based browsers
    return await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
  }
}

export async function waitForExtensionInjection(page: Page): Promise<void> {
  // Wait for the extension content script to run
  await page.waitForFunction(() => {
    return (window as any).autogramContentScriptLock !== undefined;
  }, { timeout: 10000 });
}

export async function mockAutogramInstance(page: Page): Promise<void> {
  // Inject mock for Autogram to test extension without real Autogram running
  await page.addInitScript(() => {
    // Mock response from Autogram
    window.addEventListener('message', (event) => {
      if (event.data && event.data.target === 'autogram-client') {
        // Send mock response based on request type
        const responseData = {
          id: event.data.id,
          success: true,
          result: {
            status: 'OK',
            message: 'Mock Autogram response',
          }
        };
        window.postMessage({ 
          source: 'autogram-response',
          ...responseData
        }, '*');
      }
    });
  });
}

export async function verifyDitecOverride(page: Page): Promise<boolean> {
  // Check if ditec object has been overridden by the extension
  return await page.evaluate(() => {
    const ditec = (window as any).ditec;
    // Check for specific properties that our extension adds
    return ditec && typeof ditec.version === 'string' && ditec.version.includes('autogram');
  });
}
