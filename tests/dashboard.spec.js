const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '../dedupe.html');
const MOCK_VAULT_PATH = path.resolve(__dirname, './fixtures/mock_vault.json');

test.describe('Health Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(HTML_PATH);
        await page.locator('#fileInput').setInputFiles(MOCK_VAULT_PATH);
        // Switch to Dashboard
        await page.click('text=Health Report');
    });

    test('should calculate correct security statistics', async ({ page }) => {
        // Wait for stats to be more than 0 to ensure calculation finished
        await expect(page.locator('#statUniqueSites')).not.toHaveText('0');

        const uniqueSites = await page.locator('#statUniqueSites').textContent();
        const duplicatePass = await page.locator('#statDuplicatePass').textContent();
        const emptyPass = await page.locator('#statEmptyPass').textContent();
        console.log(`Stats found: UniqueSites=${uniqueSites}, DuplicatePass=${duplicatePass}, EmptyPass=${emptyPass}`);

        await expect(page.locator('#statUniqueSites')).toHaveText('3');
        await expect(page.locator('#statDuplicatePass')).toHaveText('4');
        await expect(page.locator('#statEmptyPass')).toHaveText('2');

        // Grade should be visible
        await expect(page.locator('#healthGrade')).toBeVisible();
    });

    test('should toggle password visibility in dashboard', async ({ page }) => {
        // Wait for reuse list to populate
        await expect(page.locator('#statReuseList tr')).not.toHaveCount(0);

        const firstReuseRow = page.locator('#statReuseList tr').first();
        const codeEl = firstReuseRow.locator('.pass-display');
        const showBtn = firstReuseRow.locator('button');

        await expect(codeEl).toHaveText('••••••••');
        await expect(showBtn).toHaveText('Show');

        await showBtn.click();
        await expect(codeEl).not.toHaveText('••••••••');
        await expect(showBtn).toHaveText('Hide');

        await showBtn.click();
        await expect(codeEl).toHaveText('••••••••');
    });

    test('should reflect changes from main table after switching', async ({ page }) => {
        // 1. Go to "Everything"
        await page.locator('.nav-item').filter({ hasText: 'All Items' }).click();

        // 2. Delete the item with empty password
        const rowWithEmpty = page.locator('#itemsTableBody tr').filter({ hasText: 'Incomplete Pass' });
        await rowWithEmpty.locator('.action-delete').click();

        // Ensure it's marked deleted visually
        await expect(rowWithEmpty).toHaveClass(/deleted/);

        // 3. Go back to Dashboard
        await page.locator('.nav-item').filter({ hasText: 'Health Report' }).click();

        // 4. Missing Password count should decrease from 2 to 1
        await expect(page.locator('#statEmptyPass')).toHaveText('1');
    });
});
