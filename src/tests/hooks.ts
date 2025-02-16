import { test as baseTest } from "@playwright/test";

/**
 * We extend the default Playwright "test" so that in the global afterEach,
 * we capture a screenshot whenever a test fails, then attach it to Allure.
 */
baseTest.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === "failed") {
    // Capture screenshot
    const screenshotBuffer = await page.screenshot();
    // Attach to Allure
    testInfo.attach("failure-screenshot", {
      body: screenshotBuffer,
      contentType: "image/png",
    });
  }
});

export const test = baseTest;
export { expect } from "@playwright/test";
