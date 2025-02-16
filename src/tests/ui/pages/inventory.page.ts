import { Page, expect } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async verifyPageLoaded() {
    // Wait for a key element that confirms the inventory page is loaded
    await expect(this.page.locator('.inventory_list')).toBeVisible({ timeout: 5000 });
  }

  async verifyGrid() {
    // Check that the inventory grid is visible and contains items
    const grid = this.page.locator('.inventory_list');
    await expect(grid).toBeVisible();
    const items = grid.locator('.inventory_item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  }
  

  async sortItems(option: string) {
    // Simulate sorting: click on the sort dropdown and select the given option
    await this.page.click('.product_sort_container');
    await this.page.click(`text=${option}`);
    // Optionally, add a wait or validation for the sorted order
  }

  async verifyFirstProductHasAllProperties() {
    // Validate that the first product card displays name, description, and price
    const firstProduct = this.page.locator('.inventory_item').first();
    await expect(firstProduct.locator('.inventory_item_name')).toBeVisible();
    await expect(firstProduct.locator('.inventory_item_desc')).toBeVisible();
    await expect(firstProduct.locator('.inventory_item_price')).toBeVisible();
  }

  async addItemToCart(productName: string) {
    // Find the product by name and click its "Add to cart" button
    const product = this.page.locator('.inventory_item').filter({ hasText: productName });
    await product.locator('button', { hasText: 'Add to cart' }).click();
  }

  async verifyCartIconShows(count: number) {
    // Check that the cart icon displays the expected number of items
    const cartIcon = this.page.locator('.shopping_cart_badge');
    await expect(cartIcon).toHaveText(count.toString());
  }
}
