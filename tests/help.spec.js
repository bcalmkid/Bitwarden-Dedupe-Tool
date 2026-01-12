const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '../dedupe.html');
const MOCK_VAULT_PATH = path.resolve(__dirname, './fixtures/mock_vault.json');

test.describe('Keyboard Shortcuts Help', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(HTML_PATH);
        // We need to load a file to see the navbar where the help button is
        await page.locator('#fileInput').setInputFiles(MOCK_VAULT_PATH);
    });

    test('Help modal should open and close with button', async ({ page }) => {
        const helpBtn = page.getByRole('button', { name: 'Keyboard Shortcuts' });
        const overlay = page.locator('#helpOverlay');

        await expect(overlay).not.toHaveClass(/active/);

        await helpBtn.click();
        await expect(overlay).toHaveClass(/active/);

        // Click close button inside modal
        const closeBtn = overlay.locator('button[aria-label="Close help"]');
        await closeBtn.click();
        await expect(overlay).not.toHaveClass(/active/);
    });

    test('Help modal should toggle with ? key', async ({ page }) => {
        const overlay = page.locator('#helpOverlay');

        await expect(overlay).not.toHaveClass(/active/);

        await page.keyboard.press('?');
        await expect(overlay).toHaveClass(/active/);

        await page.keyboard.press('?');
        await expect(overlay).not.toHaveClass(/active/);
    });
});
