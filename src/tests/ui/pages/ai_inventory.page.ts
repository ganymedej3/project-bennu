import { Page, expect } from "@playwright/test";
import { AIManager } from "../../../ai/manager";
import fs from "fs";
import path from "path";

export class AIInventoryPage {
  private readonly page: Page;

  // We'll define "static" locators that might be wrong
  private inventoryContainerLocator = ".inventory_container_broken";
  private inventoryItemsLocator = ".inventory_item_broken";
  private sortDropdownLocator = ".product_sort_container_broken";

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 1) Verify page container is visible. If it fails, fallback to AI
   */
  async verifyPageLoadedWithAI() {
    try {
      console.log(`
        Checking for the purposefully broken locator`);
      await expect(
        this.page.locator(this.inventoryContainerLocator)
      ).toBeVisible({ timeout: 3000 });
    } catch (err) {
      console.warn(
        "\n" +
          "Static locator for inventory container is broken. Attempting AI fallback..."
      );
      //const newSelector = await this.fallbackToAI("main inventory container");
      const newSelector = await this.fallbackToAI(
        "target is the exact css selector for inventory list element inside the main inventory container"
      );
      console.log(`
        Locator found by AI: ${newSelector}`);
      this.inventoryContainerLocator = newSelector;
      await expect(
        this.page.locator(this.inventoryContainerLocator)
      ).toBeVisible();
    }
  }

/**
 * Verify grid layout with AI fallback (a bit of AI magic to find any missing items).
 * Because who doesn't love letting a giant language model guess at our CSS selectors?
 */
  async verifyGrid() {
    try {
      const count = await this.page.locator(this.inventoryItemsLocator).count();
      expect(count).toBeGreaterThan(0);
    } catch (err) {
      console.warn(
        "Static locator for inventory items is broken. Attempting AI fallback..."
      );
      const newSelector = await this.fallbackToAI(
        "product cards with images, titles, prices, add-to-cart"
      );
      this.inventoryItemsLocator = newSelector;
      const count2 = await this.page
        .locator(this.inventoryItemsLocator)
        .count();
      expect(count2).toBeGreaterThan(0);
    }
  }

  /**
   * 3) Verify first product has image/title/description/price/add-to-cart
   * We'll demonstrate sub-locator fallback for each property if needed.
   */
  async verifyFirstProductHasAllProperties() {
    // 1) Get the first item from the main (possibly broken) inventoryItemsLocator
    let firstItem;
    try {
      firstItem = this.page.locator(this.inventoryItemsLocator).first();
      await expect(firstItem).toBeVisible({ timeout: 3000 });
    } catch (err) {
      console.warn(
        "Broken main items locator during first product check. Falling back to AI..."
      );
      const newSelector = await this.fallbackToAI(
        "product cards with images, titles, prices, add-to-cart"
      );
      this.inventoryItemsLocator = newSelector;
      firstItem = this.page.locator(this.inventoryItemsLocator).first();
      await expect(firstItem).toBeVisible();
    }

    // Now define sub-locators for image, title, price, add-to-cart inside the first item.
    // We'll pretend these are also broken. If they fail, we do sub-locator fallback.

    // Example sub-locator properties (all broken intentionally):
    const itemImageLocator = ".inventory_item_img_broken";
    const itemTitleLocator = ".inventory_item_name_broken";
    const itemPriceLocator = ".inventory_item_price_broken";
    const itemAddToCartLocator = "button:has-text('Add to cart_broken')";

    // We'll define a helper that checks a sub-locator, if it fails => fallback
    const checkSubLocator = async (
      description: string,
      staticLocator: string
    ) => {
      let sub;
      try {
        sub = firstItem.locator(staticLocator);
        await expect(sub).toBeVisible({ timeout: 2000 });
        return sub;
      } catch (err) {
        console.warn(
          `Broken sub-locator for ${description}. Attempting AI fallback...`
        );
        const fullHtml = await this.page.content();
        // We'll pass a more precise description to AI, e.g. "the product image inside the first product card"
        const newSelector = await AIManager.fallbackLocatorAI(
          fullHtml,
          `the ${description} inside the first product card`
        );
        // now build a new sub-locator from the returned AI-based selector,
        // but we have to nest it inside 'firstItem' if needed.
        // Option A: we can attempt to do `firstItem.locator(newSelector)` if the AI returns a selector that
        //           is specifically for the sub-element. Or just do page.locator(newSelector).
        // We'll try nesting it:
        return firstItem.locator(newSelector);
      }
    };

    /**
     * @param description A description of the element (e.g. "Add to cart button")
     * @param staticLocator The expected static locator (e.g. a CSS selector)
     * @param targetLocatorType The expected target attribute or indicator (e.g. "data-test" or "css")
     * @returns A Locator for the element.
     */
    const checkSubLocatorWithTargetLocatorType = async (
      description: string,
      staticLocator: string,
      targetLocatorType: string
    ) => {
      let sub;
      try {
        sub = firstItem.locator(staticLocator);
        await expect(sub).toBeVisible({ timeout: 2000 });
        return sub;
      } catch (err) {
        console.warn(
          `Broken sub-locator for ${description}. Attempting AI fallback...`
        );
        const fullHtml = await this.page.content();
        // Pass a more precise description to the AI fallback.
        const aiDescription = `the ${description} inside the first product card`;
        const newSelector = await AIManager.fallbackLocatorAIWithLocatorType(
          fullHtml,
          aiDescription,
          targetLocatorType
        );
        console.log(
          `AI returned new locator for "${description}": ${newSelector}`
        );

        return firstItem.locator(newSelector);
      }
    };

    // 2) Check each sub-locator
    const itemImage = await checkSubLocator("product image", itemImageLocator);
    const itemTitle = await checkSubLocator("product title", itemTitleLocator);
    const itemPrice = await checkSubLocator("product price", itemPriceLocator);
    const itemAddToCart = await checkSubLocatorWithTargetLocatorType(
      "Add to cart button",
      itemAddToCartLocator,
      "data-test"
    );

  }

  /**
   * 4) Sort items
   */
  /*async sortItems(sortDescription: string) {
    const sortMapping: Record<string, string> = {
      "price high to low": "hilo",
      "price low to high": "lohi",
      "name a to z": "az",
      "name z to a": "za",
    };
    try {
      await this.page.selectOption(
        this.sortDropdownLocator,
        sortMapping[sortDescription.toLowerCase()]
      );
    } catch (err) {
      console.warn(
        "Static locator for sort dropdown is broken. Attempting AI fallback..."
      );
      const newSelector = await this.fallbackToAI(
        "the product sort dropdown on inventory page"
      );
      this.sortDropdownLocator = newSelector;
      await this.page.selectOption(
        this.sortDropdownLocator,
        sortMapping[sortDescription.toLowerCase()]
      );
    }
  }*/

  async sortItems(sortDescription: string) {
    const sortMapping: Record<string, string> = {
      "price high to low": "hilo",
      "price low to high": "lohi",
      "name a to z": "az",
      "name z to a": "za",
    };

    // Use a short wait to check if the element exists.
    let element;
    try {
      element = await this.page.waitForSelector(this.sortDropdownLocator, {
        timeout: 5000,
      });
      if (element) {
        // Element found quickly, so use it.
        await this.page.selectOption(
          this.sortDropdownLocator,
          sortMapping[sortDescription.toLowerCase()]
        );
        return;
      }
    } catch (err) {
      console.warn(
        "Static locator for sort dropdown did not appear within 5s."
      );
    }

    // If we reach here, the static locator likely failed.
    console.warn(
      "Static locator for sort dropdown is broken. Attempting AI fallback..."
    );

    // Quickly call the AI fallback
    const newSelector = await this.fallbackToAI(
      `target is the exact css selector for product sort dropdown. find the exact css selector of the element and return "select.xxxxxxxx`
      //`target is the exact css selector for product sort dropdown. This is the select element that controls the sort order on the inventory page.
      //It should uniquely identify a <select> element that has a class containing product_sort_container and is located within a header container.`
    );
    this.sortDropdownLocator = newSelector;

    // Wait for the new element to appear (again with a short timeout)
    try {
      element = await this.page.waitForSelector(this.sortDropdownLocator, {
        timeout: 5000,
      });
      if (element) {
        await this.page.selectOption(
          this.sortDropdownLocator,
          sortMapping[sortDescription.toLowerCase()]
        );
      } else {
        throw new Error("New element not found using AI fallback locator.");
      }
    } catch (err) {
      throw new Error(`
        AI fallback for sort dropdown failed: ${err}`);
    }
  }

  /**
   * 5) Fallback approach: pass the entire HTML + textual description to the AI
   * get a new selector.
   */
  private async fallbackToAI(elementDesc: string): Promise<string> {
    //not needed - should be deleted
    if (this.page.isClosed()) {
      throw new Error("Page is already closed before attempting fallback.");
    }

    console.log(`
      Initiating fallback to AI for: ${elementDesc}`);
    const fullHtml = await this.page.content();
    console.log(`
      Full HTML length: ${fullHtml.length}`);
    const aiSelector = await AIManager.fallbackLocatorAI(fullHtml, elementDesc);
    console.log(`
      AI returned new locator for "${elementDesc}": ${aiSelector}`);
    return aiSelector;
  }

  /**
   * 6) If you want to do "compare all old locators vs. new DOM," here's an example:
   */
  public async comparePageObjectLocators() {
    const oldLocators = {
      inventoryContainerLocator: this.inventoryContainerLocator,
      inventoryItemsLocator: this.inventoryItemsLocator,
      sortDropdownLocator: this.sortDropdownLocator,
    };
    const fullHtml = await this.page.content();
    const result = await AIManager.compareLocatorsAI(fullHtml, oldLocators);
    console.log("Comparison result:", result);
    // For each changed, update in memory, or you can store somewhere else
    for (const [name, data] of Object.entries(result.changed)) {
      console.log(`Locator ${name} changed from ${data.old} to ${data.new}`);
      (this as any)[name] = data.new; // dynamic update
    }
  }

  /**
   * Get up to "maxElements" key elements from the inventory page for building page objects quickly
   */
  public async getKeyElementsForAutomation(maxElements = 20): Promise<{
    elements: Array<{
      element_description: string;
      selectors: {
        id: string | null;
        class: string | null;
        css: string | null;
        "data-test": string | null;
      };
    }>;
  }> {
    const fullHtml = await this.page.content();
    // call manager
    const result = await AIManager.identifyKeyElements(fullHtml, maxElements);

    // Convert to a pretty JSON string
    const jsonString = JSON.stringify(result, null, 2);

    // We'll build a filename: "ai_inventory_elements.json" in same directory
    // You can rename or place it differently as you wish
    const filename = path.join(
      __dirname, // => src/tests/ui/pages
      "ai_inventory_elements.json" 
    );

    // write the file
    fs.writeFileSync(filename, jsonString, "utf-8");
    console.log(`Key elements JSON saved to: ${filename}`);

    return result;
  }
}
