import { TestMetadata, TestError, ElementInfo } from '../types';
import { test, expect } from '@playwright/test';

export class TestUtils {
  /**
   * Creates test metadata for better organization and reporting
   */
  static createTestMetadata(
    title: string,
    category: 'ui' | 'api',
    options: Partial<TestMetadata> = {}
  ): TestMetadata {
    return {
      title,
      category,
      tags: options.tags || [],
      priority: options.priority || 'medium',
      aiAssisted: options.aiAssisted || false
    };
  }

  /**
   * Waits for a condition with a timeout
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 70000,
    interval: number = 1000
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    return false;
  }

  /**
   * Captures element information for debugging
   */
  static async captureElementInfo(
    page: any,
    selector: string
  ): Promise<ElementInfo> {
    try {
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }

      const visible = await element.isVisible();
      const enabled = await element.isEnabled();
      const text = await element.textContent();
      
      // Get element attributes
      const attributes = await element.evaluate((el: Element) => {
        const result: Record<string, string> = {};
        for (const { name, value } of Array.from(el.attributes)) {
          result[name] = value;
        }
        return result;
      });

      return {
        selector,
        text: text?.trim(),
        visible,
        enabled,
        attributes
      };
    } catch (error: unknown) {
      throw new TestError({
        name: 'ElementError',
        message: `Failed to capture element info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'assertion'
      });
    }
  }

  /**
   * Generates a unique test ID
   */
  static generateTestId(prefix: string = 'test'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Safely extracts text content from an element
   */
  static async getElementText(
    page: any,
    selector: string,
    defaultValue: string = ''
  ): Promise<string> {
    try {
      return await page.locator(selector).textContent() || defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
}