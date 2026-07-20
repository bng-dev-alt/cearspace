import { test, expect, type Page } from '@playwright/test';

/**
 * E2E proti současné aplikaci (clearspace, česká UI, projektové routování, mock auth).
 * Běží v demo režimu (localStorage), takže session naseedujeme přes addInitScript a
 * board se sám naseeduje z INITIAL_COLUMNS při navigaci na /projects/project-default.
 * Playwright dává každému testu čistý kontext -> deterministická data.
 */

const MOCK_UID = 'e2e-user';
const BOARD_URL = '/projects/project-default';

async function seedAuth(page: Page) {
  await page.addInitScript((uid) => {
    const session = {
      user: { id: uid, email: 'e2e@clearspace.test', user_metadata: { display_name: 'E2E Tester' } },
      access_token: 'mock-jwt-token-' + uid,
    };
    window.localStorage.setItem('kanban_mock_session', JSON.stringify(session));
    window.localStorage.setItem(
      'kanban_mock_profiles',
      JSON.stringify([{ id: uid, email: 'e2e@clearspace.test', display_name: 'E2E Tester', created_at: new Date().toISOString() }])
    );
  }, MOCK_UID);
}

test.describe('Clearspace board E2E', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => console.log('BROWSER ERROR:', err.message));
    await seedAuth(page);
    await page.goto(BOARD_URL);
    // Počkej na klientskou hydrataci (event handlery navázané).
    await expect(page.locator('.app-container')).toHaveAttribute('data-hydrated', 'true');
  });

  test('vykreslí board s českými sloupci a správnými počty', async ({ page }) => {
    for (const name of ['Nápady', 'Naplánováno', 'V průběhu', 'K revizi', 'Hotovo']) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByTestId('column-count-column-1')).toHaveText('2');
    await expect(page.getByTestId('column-count-column-2')).toHaveText('2');
    await expect(page.getByTestId('column-count-column-3')).toHaveText('1');
    await expect(page.getByTestId('column-count-column-4')).toHaveText('1');
    await expect(page.getByTestId('column-count-column-5')).toHaveText('1');
  });

  test('přidá kartu do sloupce Nápady', async ({ page }) => {
    await page.getByTestId('add-card-btn-column-1').click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toHaveText('Přidat kartu do: Nápady');

    await modal.locator('#card-title').fill('Napsat E2E testy');
    await modal.locator('#card-details').fill('Automatizovat klíčové toky přes Playwright.');
    await modal.locator('button[type="submit"]').click();

    await expect(modal).not.toBeVisible();
    await expect(page.getByText('Napsat E2E testy')).toBeVisible();
    await expect(page.getByTestId('column-count-column-1')).toHaveText('3');
  });

  test('přejmenuje sloupec', async ({ page }) => {
    await page.getByTestId('column-title-column-4').click();
    const input = page.getByTestId('column-input-column-4');
    await expect(input).toBeVisible();
    await input.fill('QA & Ověření');
    await input.press('Enter');
    await expect(page.getByTestId('column-title-column-4')).toHaveText('QA & Ověření');
  });

  test('přetáhne kartu mezi sloupci', async ({ page }) => {
    // Nativní HTML5 drag&drop -- Playwrightův dragTo() ho nespouští spolehlivě,
    // takže dispatchneme sekvenci DnD eventů se sdíleným DataTransfer.
    const card = page.getByTestId('card-card-3'); // Konfigurace CI/CD pipeline (Naplánováno)
    const target = page.getByTestId('column-column-4'); // K revizi
    await expect(card).toBeVisible();
    await expect(page.getByTestId('column-count-column-2')).toHaveText('2');
    await expect(page.getByTestId('column-count-column-4')).toHaveText('1');

    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await card.dispatchEvent('dragstart', { dataTransfer });
    await target.dispatchEvent('dragenter', { dataTransfer });
    await target.dispatchEvent('dragover', { dataTransfer });
    await target.dispatchEvent('drop', { dataTransfer });
    await card.dispatchEvent('dragend', { dataTransfer });

    await expect(page.getByTestId('column-count-column-2')).toHaveText('1');
    await expect(page.getByTestId('column-count-column-4')).toHaveText('2');
    await expect(page.getByTestId('cards-list-column-4').getByTestId('card-card-3')).toBeVisible();
  });

  test('Project Intelligence: chip má pulse tečku a panel ukazuje deterministické insighty', async ({ page }) => {
    // Pulse chip nese živý stav zdraví.
    await expect(page.getByTestId('pi-chip-dot')).toBeVisible();

    await page.getByTestId('project-intelligence-btn').click();

    const panel = page.getByTestId('project-intelligence-drawer');
    await expect(panel).toBeVisible();
    // Deterministický insight: card-4 má tag "Blokováno" -> 1 blokovaný úkol.
    await expect(panel.getByText(/blokovan/i).first()).toBeVisible();
    // Zdraví a doporučené akce jsou přítomné.
    await expect(page.getByTestId('pi-health')).toBeVisible();
    await expect(page.getByTestId('pi-actions')).toBeVisible();
  });

  test('Project Intelligence se otevře klávesovou zkratkou (Ctrl/Cmd+I)', async ({ page }) => {
    await expect(page.getByTestId('project-intelligence-drawer')).toHaveCount(0);
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+KeyI`);
    await expect(page.getByTestId('project-intelligence-drawer')).toBeVisible();
  });
});
