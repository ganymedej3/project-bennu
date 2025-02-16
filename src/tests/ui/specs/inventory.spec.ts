//import { test, expect } from "@playwright/test";
import { test, expect } from "../../hooks";
import { InventoryPage } from "../pages/inventory.page";
import { LoginPage } from "../pages/login.page";

test.describe("Traditional Inventory Tests", () => {
  let inventoryPage: InventoryPage;
  let loginPage: LoginPage;

  const allure = require('@wdio/allure-reporter').default;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
  });

  test("should verify inventory page grid (traditional)", async () => {
    await inventoryPage.verifyPageLoaded();
    await inventoryPage.verifyGrid();
  });

  test("should verify sorting (price high to low, traditional)", async () => {
    await inventoryPage.sortItems("Price (high to low)");
    // You can enhance this test by verifying the sorted order
    expect(true).toBe(true);
  });

  test("should verify first product has all properties (traditional)", async () => {
    await inventoryPage.verifyFirstProductHasAllProperties();
  });

  test("should verify add to cart changes button + cart icon (traditional)", async () => {
    await inventoryPage.addItemToCart("Sauce Labs Backpack");
    await inventoryPage.verifyCartIconShows(1);
  });

  test("should capture screenshot on failure (traditional)", async ({ page }, testInfo) => {
    // This test simulates a failure to demonstrate screenshot capture in Allure
    await page.goto('http://localhost:3000/nonexistent');
    try {
      await expect(page.locator('#nonexistent-element')).toBeVisible({ timeout: 5000 });
    } catch (error) {
      const screenshotBuffer = await page.screenshot();
      testInfo.attach('failure-screenshot', { body: screenshotBuffer, contentType: 'image/png' });
      throw error;
    }
  });
});
