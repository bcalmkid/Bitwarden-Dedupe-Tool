const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '../dedupe.html');
const MOCK_VAULT_PATH = path.resolve(__dirname, './fixtures/mock_vault.json');

test.describe('Undo Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(HTML_PATH);
        await page.locator('#fileInput').setInputFiles(MOCK_VAULT_PATH);
    });

    test('should undo manual deletion', async ({ page }) => {
        const firstRow = page.locator('#itemsTableBody tr').first();
        const deleteBtn = firstRow.locator('.action-delete');
        const undoBtn = page.locator('#undoBtn');

        // Initially disabled
        await expect(undoBtn).toBeDisabled();

        // Delete item
        await deleteBtn.click();
        await expect(firstRow).toHaveClass(/deleted/);
        await expect(undoBtn).toBeEnabled();

        // Undo
        await undoBtn.click();
        await expect(firstRow).not.toHaveClass(/deleted/);
        await expect(undoBtn).toBeDisabled();
    });

    test('should undo bulk deletion', async ({ page }) => {
        // Select first two items - click the cell to trigger event delegation
        await page.locator('td.checkbox-cell').nth(1).click();
        await page.locator('td.checkbox-cell').nth(2).click();

        // Click bulk delete
        await page.click('#selectionDeleteBtn');

        await expect(page.locator('#removedCount')).toHaveText('2');

        // Undo
        await page.click('#undoBtn');
        await expect(page.locator('#removedCount')).toHaveText('0');

        // Verify no rows have 'deleted' class
        const deletedRows = await page.locator('tr.deleted').count();
        expect(deletedRows).toBe(0);
    });

    test('should undo auto-dedupe run', async ({ page }) => {
        // Handle alert BEFORE clicking
        page.on('dialog', dialog => dialog.dismiss());

        // Mock default behavior for auto-dedupe
        await page.click('text=Run auto-delete');

        await expect(page.locator('#removedCount')).not.toHaveText('0');

        // Undo the whole run
        await page.click('#undoBtn');
        await expect(page.locator('#removedCount')).toHaveText('0');
    });

    test('should clear undo stack on app reset', async ({ page }) => {
        await page.locator('.action-delete').first().click();
        await expect(page.locator('#undoBtn')).toBeEnabled();

        // Trigger reset
        page.on('dialog', dialog => dialog.accept());
        await page.click('text=Reset');

        // App should be back to upload screen
        await expect(page.locator('#uploadOverlay')).not.toHaveClass(/hidden/);

        // Re-upload and check undo btn (it should be reset)
        await page.locator('#fileInput').setInputFiles(MOCK_VAULT_PATH);
        await expect(page.locator('#undoBtn')).toBeDisabled();
    });
});
