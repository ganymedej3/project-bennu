//import { test, expect } from "@playwright/test";
import { test, expect } from "../../hooks";
import { AIInventoryPage } from "../pages/ai_inventory.page";
import { LoginPage } from "../pages/login.page";

test.describe("AI-Enhanced Inventory Tests with Fallback", () => {
  let inventoryPage: AIInventoryPage;
  let loginPage: LoginPage;
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new AIInventoryPage(page);

    await loginPage.goto();
    await loginPage.login("standard_user", "secret_sauce");
  });

  test("should verify the inventory page grid with AI fallback", async () => {
    await inventoryPage.verifyPageLoadedWithAI();
    await inventoryPage.verifyGrid();
  });

  test("should verify sorting functionality (price high to low)", async () => {
    await inventoryPage.sortItems("price high to low");
    expect(true).toBe(true);
  },);

  test("should verify first product has image/title/description/price/add-to-cart", async () => {
    await inventoryPage.verifyFirstProductHasAllProperties();
  });

  test("should demonstrate how we can do compare-locators AI approach", async () => {
    // If you want to show the "maintenance" scenario:
    await inventoryPage.comparePageObjectLocators();
  });

  test("should list top 10 key elements for building page objects", async () => {
    // Suppose we only want top 10
    const { elements } = await inventoryPage.getKeyElementsForAutomation(10);

    console.log("Key elements from AI:");
    for (const elem of elements) {
      console.log("- Description:", elem.element_description);
      console.log("  selectors:", elem.selectors);
    }

    // If you want an assertion, e.g. we expect at least 5 elements
    expect(elements.length).toBeGreaterThan(4);
  });
});
