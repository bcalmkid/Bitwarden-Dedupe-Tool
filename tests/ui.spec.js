const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '../dedupe.html');
const MOCK_VAULT_PATH = path.resolve(__dirname, './fixtures/mock_vault.json');

test.describe('UI Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(HTML_PATH);
        await page.locator('#fileInput').setInputFiles(MOCK_VAULT_PATH);
    });

    test('Theme Toggle should switch classes and persist', async ({ page }) => {
        const toggleBtn = page.locator('#themeToggle');

        // Default is dark
        await expect(page.locator('body')).not.toHaveClass(/light-mode/);

        // Switch to light
        await toggleBtn.click();
        await expect(page.locator('body')).toHaveClass(/light-mode/);
        await expect(page.locator('#themeToggleText')).toHaveText('Light Mode');

        // Reload and check persistence
        await page.reload();
        await expect(page.locator('body')).toHaveClass(/light-mode/);
    });

    test('Selection Bar should appear when items selected', async ({ page }) => {
        // Select first item
        await page.locator('input.custom-checkbox').nth(1).check(); // nth(0) is Select All

        const bar = page.locator('#selectionBar');
        await expect(bar).toHaveClass(/visible/);
        await expect(page.locator('#selectionText')).toContainText('1 items selected');

        // Check Action Priority
        const deleteBtn = page.locator('#selectionDeleteBtn');
        const restoreBtn = page.locator('#selectionRestoreBtn');

        await expect(deleteBtn).toHaveClass(/btn-primary/);
        await expect(restoreBtn).toHaveClass(/btn-outline/);
    });

    test('Password Reveal should toggle mask', async ({ page }) => {
        const row = page.locator('#itemsTableBody tr').nth(0);
        const passVal = row.locator('.password-val .truncator-text').first(); // Truncator text might be duped in DOM
        const toggleBtn = row.locator('.password-container button');

        await expect(passVal).toHaveText('••••••••');

        await toggleBtn.click();
        await expect(passVal).not.toHaveText('••••••••');
        await expect(passVal).not.toHaveText('Empty');

        await toggleBtn.click();
        await expect(passVal).toHaveText('••••••••');
    });

    test('Action Column Alignment', async ({ page }) => {
        const actionCell = page.locator('.action-cell').first();
        // Check computed style for alignment
        const align = await actionCell.evaluate((el) => window.getComputedStyle(el).textAlign);
        expect(align).toBe('center'); // Ensure it matches our CSS update
    });
});
