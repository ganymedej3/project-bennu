import { Page, Locator, expect } from '@playwright/test';
import { SelectorEngine } from '../../../ai/selector-engine';

export class LoginPage {
    readonly page: Page;
    readonly selectorEngine: SelectorEngine;

    // Traditional selectors
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.selectorEngine = new SelectorEngine();

        // Initialize traditional selectors
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorMessage = page.locator('[data-test="error"]');
    }

    /**
     * Navigate to login page
     */
    /*async goto() {
        await this.page.goto('/');
    }*/

        async goto() {
            await this.page.goto('https://www.saucedemo.com/');
        }

    /**
     * Login with provided credentials
     */
    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    /**
     * Get error message text
     */
    async getErrorMessage(): Promise<string> {
        await this.errorMessage.waitFor({ state: 'visible' });
        const text = await this.errorMessage.textContent();
        return text || '';
    }

    /**
     * Verify login page is loaded
     */
    async verifyPageLoaded() {
        await expect(this.loginButton).toBeVisible();
        await expect(this.usernameInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
    }

    /**
     * AI-enhanced element finder
     */
    async findElement(description: string) {
        return this.selectorEngine.findElement(this.page, description);
    }

    
    /**
     * Verify visual state using AI
     */
    /*
    async verifyVisualState(selector: string, expectedState: string) {
        return this.visualVerifier.verifyStateChange(
            this.page,
            selector,
            expectedState
        );
    }*/
}