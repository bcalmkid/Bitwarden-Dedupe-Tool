const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.resolve(__dirname, '../dedupe.html');

test.describe('Edge Cases and Sidebar Search', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(HTML_PATH);
    });

    test('should handle items with no URIs (No Domain)', async ({ page }) => {
        // Create a minimal vault with an item having no URIs
        const tinyVault = {
            items: [
                { type: 1, name: "No URI Item", login: { username: "user", password: "p" } },
                { type: 1, name: "Empty URI Item", login: { uris: [{ uri: "" }], username: "user", password: "p" } }
            ]
        };

        // Inject data directly via script to test edge case without file system
        await page.evaluate((data) => {
            bitwardenData = data;
            bitwardenData.items.forEach(item => {
                item._isDeleted = false;
                item._hostname = getBaseUrl(item);
                item._timestamp = 0;
            });
            uploadOverlay.classList.add('hidden');
            app.classList.remove('hidden');
            renderSidebar();
            renderTable();
        }, tinyVault);

        // Check sidebar
        const sidebar = page.locator('#sidebarList');
        await expect(sidebar).toContainText('No Domain');

        // Count should be 2 because both "no uris" and "empty uri" map to "No Domain"
        await expect(sidebar.locator('.nav-item').filter({ hasText: 'No Domain' }).locator('.count')).toHaveText('2');
    });

    test('should filter sidebar by search input', async ({ page }) => {
        const MOCK_VAULT_PATH = path.resolve(__dirname, './fixtures/mock_vault.json');
        await page.locator('#fileInput').setInputFiles(MOCK_VAULT_PATH);

        const searchInput = page.locator('#sidebarSearch');
        await searchInput.fill('github');

        const sidebarItems = page.locator('#sidebarList .nav-item');
        // github.com and "all items" (which is always visible)
        // Wait for search to trigger (oninput)
        await expect(sidebarItems).toHaveCount(2);
    });

    test('should handle "Review Deleted" mode persistence', async ({ page }) => {
        const MOCK_VAULT_PATH = path.resolve(__dirname, './fixtures/mock_vault.json');
        await page.locator('#fileInput').setInputFiles(MOCK_VAULT_PATH);

        // Delete an item
        await page.locator('.action-delete').first().click();

        // Turn on Review Deleted - click the switch div as it's more reliable than the hidden checkbox
        const reviewToggle = page.locator('.toggle-switch');
        await reviewToggle.click();

        // Table should only show 1 item
        await expect(page.locator('#itemsTableBody tr')).toHaveCount(1);
        await expect(page.locator('#itemsTableBody tr')).toHaveClass(/deleted/);

        // Sidebar count for "All Items" should reflect ONLY deleted items if we are in review mode
        // nth(0) is Health Report, nth(1) is All Items
        await expect(page.locator('#sidebarList .nav-item').nth(1).locator('.count')).toHaveText('1');
    });
});
