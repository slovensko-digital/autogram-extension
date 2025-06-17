import { test, expect } from '@playwright/test';
import { 
  setupBrowserWithExtension, 
  waitForExtensionInjection, 
  verifyDitecOverride 
} from './helpers/extension-helper';

test.describe('Local development tests', () => {
  test('Extension should work on localhost in development mode', async ({ browser }) => {
    // Skip this test in production mode
    test.skip(process.env.NODE_ENV === 'production', 'This test is for development only');
    
    const context = await setupBrowserWithExtension(browser);
    const page = await context.newPage();
    
    // Go to localhost - needs a local server running
    await page.goto('http://localhost:3000/');
    
    // Wait and verify
    await waitForExtensionInjection(page);
    const isOverridden = await verifyDitecOverride(page);
    expect(isOverridden).toBeTruthy();
    
    await context.close();
  });
  
  test('Extension should work with test server from example-usage', async ({ browser }) => {
    // Skip this test in production mode
    test.skip(process.env.NODE_ENV === 'production', 'This test is for development only');
    
    const context = await setupBrowserWithExtension(browser);
    const page = await context.newPage();
    
    // Go to example-usage test server
    await page.goto('http://localhost:49675/');
    
    // Wait and verify
    await waitForExtensionInjection(page);
    const isOverridden = await verifyDitecOverride(page);
    expect(isOverridden).toBeTruthy();
    
    await context.close();
  });
});
