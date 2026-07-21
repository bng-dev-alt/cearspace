import { test, expect, type Page } from '@playwright/test';

/**
 * WCAG 1.4.10 (Reflow): obsah nesmí na 320px vyžadovat vodorovné scrollování.
 * Hlídá všechny stránky napříč breakpointy -- levné a chytá regrese, které
 * vzniknou nenápadně (např. inline `minmax(320px, 1fr)` v nové mřížce).
 */
const MOCK_UID = 'e2e-user';

async function seedAuth(page: Page) {
  await page.addInitScript((uid) => {
    window.localStorage.setItem(
      'kanban_mock_session',
      JSON.stringify({
        user: { id: uid, email: 'e2e@clearspace.test', user_metadata: { display_name: 'E2E Tester' } },
        access_token: 'mock-jwt-token-' + uid,
      })
    );
    window.localStorage.setItem(
      'kanban_mock_profiles',
      JSON.stringify([
        { id: uid, email: 'e2e@clearspace.test', display_name: 'E2E Tester', created_at: new Date().toISOString() },
      ])
    );
  }, MOCK_UID);
}

const PAGES = ['/projects/project-default', '/', '/team', '/ai-control-center', '/ai-history'];
const WIDTHS = [320, 375, 768, 1024, 1440];

for (const width of WIDTHS) {
  test(`stránky nepřetékají vodorovně @${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await seedAuth(page);

    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.locator('.app-navbar')).toBeVisible();
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        return de.scrollWidth - de.clientWidth;
      });
      expect(overflow, `${path} @${width}px`).toBeLessThanOrEqual(0);
    }
  });
}
