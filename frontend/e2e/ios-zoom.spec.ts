import { test, expect, type Page } from '@playwright/test';

/**
 * Safari na iOS zoomne stránku, když uživatel klepne do pole s písmem < 16px,
 * a po rozostření zoom nevrátí -- layout pak zůstane širší než displej.
 * V Chromiu se to neprojeví, takže to musí hlídat explicitní test.
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

/** Vrátí pole viditelných formulářových prvků s písmem pod 16px. */
const scanSmallFields = () =>
  [...document.querySelectorAll('input,select,textarea')]
    .filter((e) => e.getBoundingClientRect().width > 0)
    .map((e) => ({
      id: `${e.tagName}.${e.className || '?'}`,
      fs: parseFloat(getComputedStyle(e).fontSize),
    }))
    .filter((x) => x.fs < 16);

test.describe('iOS: pole nesmí spouštět auto-zoom', () => {
  // Rozměr iPhonu 13 Pro. Stačí šířka viewportu -- kontroluje se velikost
  // písma, ne dotykové chování, takže není potřeba plná emulace zařízení.
  test.use({ viewport: { width: 390, height: 844 } });

  test('žádné formulářové pole nemá na mobilu písmo pod 16px', async ({ page }) => {
    await seedAuth(page);
    const found: { id: string; fs: number }[] = [];

    // Board + toolbar
    await page.goto('/projects/project-default');
    await expect(page.locator('.app-container')).toHaveAttribute('data-hydrated', 'true');
    found.push(...(await page.evaluate(scanSmallFields)));

    // Detail úkolu (selecty, datum, checklist, komentář, popis)
    await page.getByTestId('card-card-1').click();
    await expect(page.getByTestId('task-detail-drawer')).toBeVisible();
    found.push(...(await page.evaluate(scanSmallFields)));
    await page.keyboard.press('Escape');

    // Dialog "Nový úkol"
    await page.getByTestId('navbar-burger').click();
    await page.getByTestId('mobile-menu-new-task').click();
    await expect(page.locator('.modal-content')).toBeVisible();
    found.push(...(await page.evaluate(scanSmallFields)));
    await page.keyboard.press('Escape');

    // Project Intelligence (textarea dotazu)
    await page.getByTestId('navbar-burger').click();
    await page.getByTestId('mobile-menu-intelligence').click();
    await expect(page.getByTestId('project-intelligence-drawer')).toBeVisible();
    found.push(...(await page.evaluate(scanSmallFields)));

    // Tým a přihlášení (pole mají styl inline -> hodnotu řídí token)
    for (const path of ['/team', '/login', '/register']) {
      await page.goto(path);
      found.push(...(await page.evaluate(scanSmallFields)));
    }

    expect(found).toEqual([]);
  });
});

test.describe('Desktop: velikosti písma zůstávají původní', () => {
  test('přihlašovací pole má na desktopu dál 0.85rem', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    const fs = await page
      .locator('#email')
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fs).toBeCloseTo(13.6, 1);
  });
});
