import { test, expect, Browser } from '@playwright/test';
import { 
  setupBrowserWithExtension, 
  waitForExtensionInjection, 
  mockAutogramInstance,
  verifyDitecOverride 
} from './helpers/extension-helper';


test.describe('Extension tests', () => {
  let extensionBrowser: Browser;
  
  test.beforeEach(async ({ browser }) => {
    extensionBrowser = browser;
  });
  
  test('Extension should load and override ditec on slovensko.sk', async () => {
    const context = await setupBrowserWithExtension(extensionBrowser);
    const page = await context.newPage();
    
    // Mock Autogram client responses
    await mockAutogramInstance(page);
    
    // Navigate to slovensko.sk
    await page.goto('https://www.slovensko.sk');
    
    // Wait for extension to be injected
    await waitForExtensionInjection(page);
    
    // Verify that ditec object has been overridden
    const isOverridden = await verifyDitecOverride(page);
    expect(isOverridden).toBeTruthy();
    
    await context.close();
  });
  
  test('Extension should function with ON_DOCUMENT_LOAD_INJECTION strategy', async () => {
    const context = await setupBrowserWithExtension(extensionBrowser);
    const page = await context.newPage();
    
    // Find a site that uses ON_DOCUMENT_LOAD_INJECTION
    const testUrl = 'https://pfseform.financnasprava.sk/';
    
    await mockAutogramInstance(page);
    await page.goto(testUrl);
    
    // Wait for injection
    await waitForExtensionInjection(page);
    
    // Verify ditec override
    const isOverridden = await verifyDitecOverride(page);
    expect(isOverridden).toBeTruthy();
    
    await context.close();
  });
  
  test('Extension should function with INTERVAL_INJECTION strategy', async () => {
    const context = await setupBrowserWithExtension(extensionBrowser);
    const page = await context.newPage();
    
    // Find a site that uses INTERVAL_INJECTION
    const testUrl = 'https://konto.bratislava.sk/';
    
    await mockAutogramInstance(page);
    
    // Mock original ditec object to trigger interval detection
    await page.addInitScript(() => {
      (window as any).ditec = {
        dsig: {
          // Mock properties that would be detected by interval injection
        }
      };
    });
    
    await page.goto(testUrl);
    
    // Trigger the custom event that would be triggered by interval detection
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('autogram-ditec-loaded'));
    });
    
    // Wait and verify
    await page.waitForTimeout(1000); // Give time for the event to process
    const isOverridden = await verifyDitecOverride(page);
    expect(isOverridden).toBeTruthy();
    
    await context.close();
  });
  
  test('Extension should function with DIRECT_INJECTION strategy', async () => {
    const context = await setupBrowserWithExtension(extensionBrowser);
    const page = await context.newPage();
    
    // Find a site that uses DIRECT_INJECTION
    const testUrl = 'https://obcan.justice.sk/';
    
    await mockAutogramInstance(page);
    await page.goto(testUrl);
    
    // Direct injection happens immediately so we should be able to verify quickly
    await waitForExtensionInjection(page);
    const isOverridden = await verifyDitecOverride(page);
    expect(isOverridden).toBeTruthy();
    
    await context.close();
  });
  
  test('Extension should handle conflict resolution correctly', async () => {
    const context = await setupBrowserWithExtension(extensionBrowser);
    const page = await context.newPage();
    
    // Mock an existing ditec object
    await page.addInitScript(() => {
      (window as any).ditec = {
        original: true,
        test: function() { return 'original'; }
      };
    });
    
    // Go to a page that uses CONFLICT_RESOLUTION_IMMUTABLE_PROXY
    await page.goto('https://obcan.justice.sk/');
    await waitForExtensionInjection(page);
    
    // Check if our proxy is in place and immutable
    const proxyWorking = await page.evaluate(() => {
      const ditec = (window as any).ditec;
      // Try to modify and see if it fails silently as our proxy should
      ditec.newProperty = 'test';
      return !ditec.original && ditec.newProperty === undefined;
    });
    
    expect(proxyWorking).toBeTruthy();
    
    await context.close();
  });
});
