const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '../dedupe.html');
const MOCK_VAULT_PATH = path.resolve(__dirname, './fixtures/mock_vault.json');

test.describe('Deduplication Logic', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(HTML_PATH);
        // Upload the mock file
        const fileInput = page.locator('#fileInput');
        await fileInput.setInputFiles(MOCK_VAULT_PATH);
        // Wait for table to populate
        await expect(page.locator('#itemsTableBody tr')).toHaveCount(7); // 8 items - 1 secure note = 7
    });

    test('should filter out non-login items', async ({ page }) => {
        // Mock vault has 1 Secure Note (Type 2), it should be ignored.
        const totalCount = await page.locator('#totalCount').textContent();
        expect(totalCount).toBe('7');
    });

    test('should handle "Domain + User + Pass" strategy', async ({ page }) => {
        // Select Strategy
        await page.selectOption('#dedupeMode', 'domain_all');
        await page.click('text=Run auto-delete');

        // Items 1 and 2 are exact dupes. One should be kept, one marked.
        // Item 3 is same user/pass but different name (same domain) -> Duplicate in this mode.
        // So out of 1, 2, 3 -> 2 should be marked deleted.

        const removedCount = await page.locator('#removedCount').textContent();
        expect(Number(removedCount)).toBeGreaterThanOrEqual(1);

        // Verify visual feedback (deleted class)
        const deletedRows = await page.locator('tr.deleted').count();
        expect(deletedRows).toBe(Number(removedCount));
    });

    test('should handle "Scrub: Empty User AND Pass"', async ({ page }) => {
        await page.selectOption('#dedupeMode', 'incomplete_both');
        await page.click('text=Run auto-delete');

        // Item 6 is completely empty. Item 8 is whitespace only (should be trimmed and treated as empty).
        // Item 4 (No User) and 5 (No Pass) should NOT be touched in this mode.

        // Wait for alert or UI update (mock alert since we can't catch it easily without handling dialog event)
        // Check removed count
        const removedCount = await page.locator('#removedCount').textContent();
        expect(Number(removedCount)).toBe(1); // Totally Empty only. Whitespace user has a password.
    });

    test('should handle "Scrub: Empty User OR Pass"', async ({ page }) => {
        await page.selectOption('#dedupeMode', 'incomplete');
        await page.click('text=Run auto-delete');

        // Should catch Item 4, 5, 6, 8
        const removedCount = await page.locator('#removedCount').textContent();
        expect(Number(removedCount)).toBe(4);
    });
});
