import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Time Progress/);
});

test('shows progress bars', async ({ page }) => {
    await page.goto('/');

    // Expect the progress bars to be visible
    await expect(page.getByText('Week')).toBeVisible();
    await expect(page.getByText('Month')).toBeVisible();
    await expect(page.getByText('Quarter')).toBeVisible();
    await expect(page.getByText('Year')).toBeVisible();
});
