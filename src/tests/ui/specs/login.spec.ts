//import { test, expect } from '@playwright/test';
import { test, expect } from "../../hooks";
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';

test.describe('Login Tests', () => {
    let loginPage: LoginPage;
    let inventoryPage: InventoryPage;

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({
            type: 'ui',
            description: 'UI Test Suite for Sauce Demo Login'
        });
        loginPage = new LoginPage(page);
        inventoryPage = new InventoryPage(page);
        await loginPage.goto();
    });

    test('should login successfully with valid credentials', async () => {
        test.info().annotations.push({
            type: 'ui',
            description: 'Successful login with standard user'
        });
        await loginPage.login('standard_user', 'secret_sauce');
        await inventoryPage.verifyPageLoaded();
    });

    test('should show error message with locked out user', async () => {
        test.info().annotations.push({
            type: 'ui',
            description: 'Verify locked out user error message'
        });
        await loginPage.login('locked_out_user', 'secret_sauce');
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('locked out');
    });

    test('should show error message with invalid credentials', async () => {
        test.info().annotations.push({
            type: 'ui',
            description: 'Verify invalid credentials error message'
        });
        await loginPage.login('invalid_user', 'invalid_password');
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Username and password do not match');
    });

    test('should require username and password', async () => {
        test.info().annotations.push({
            type: 'ui',
            description: 'Verify empty credentials validation'
        });
        await loginPage.login('', '');
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Username is required');
    });

});