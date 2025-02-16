import { Page } from "@playwright/test";
import { AIManager } from "./manager";
import { ElementInfo } from "../core/types";

export class SelectorEngine {
  /**
   * Multi-step AI approach for single element
   */
  public async generateSelector(page: Page, description: string): Promise<string> {
    const fullHtml = await page.content();
    const selector = await AIManager.multiStepSelectorGeneration(fullHtml, description);
    if (await this.validateSelector(page, selector)) {
      return selector;
    }
    throw new Error(`AI-based selector not found for '${description}'`);
  }

  public async findElement(page: Page, description: string): Promise<ElementInfo> {
    const selector = await this.generateSelector(page, description);
    const handle = await page.$(selector);
    if (!handle) throw new Error(`Element not found for: "${description}"`);

    const visible = await handle.isVisible();
    const enabled = await handle.isEnabled();
    const text = (await handle.textContent())?.trim() || "";

    return { selector, text, visible, enabled };
  }

  /**
   * Multi-element approach
   */
  public async findElements(page: Page, description: string): Promise<string[]> {
    const fullHtml = await page.content();
    const rawSelectors = await AIManager.multiStepFindElements(fullHtml, description);

    const validSelectors: string[] = [];
    for (const sel of rawSelectors) {
      if (await this.validateSelector(page, sel)) {
        validSelectors.push(sel);
      }
    }
    return validSelectors;
  }

  private async validateSelector(page: Page, selector: string): Promise<boolean> {
    try {
      const handle = await page.$(selector);
      return !!handle;
    } catch {
      return false;
    }
  }

  // Self-healing & fallback references (unused in POC)
  public async healSelector(page: Page, brokenSelector: string, description: string): Promise<string> {
    const newSelector = await this.generateSelector(page, description);
    if (await this.validateSelector(page, newSelector)) {
      return newSelector;
    }
    throw new Error(`Unable to heal broken selector: ${brokenSelector}`);
  }

  public generateGenericSelectors(description: string): string[] {
    // not used in POC
    return [];
  }
}
