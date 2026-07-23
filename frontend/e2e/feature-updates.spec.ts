import { test, expect, type Page } from '@playwright/test';

const MOCK_UID = 'e2e-user-updates';
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

test.describe('FEATURE UPDATES E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await page.goto(BOARD_URL);
    await expect(page.locator('.app-container')).toHaveAttribute('data-hydrated', 'true');
  });

  test('Task Resources section renders in task detail drawer and allows uploading files', async ({ page }) => {
    // Open first card drawer
    const card = page.getByTestId('card-card-1');
    await expect(card).toBeVisible();
    await card.click();

    // Check TaskResourcesSection is visible
    const resourcesSection = page.getByTestId('task-resources-section');
    await expect(resourcesSection).toBeVisible();
    await expect(page.getByTestId('upload-resource-btn')).toBeVisible();

    // Test file input attachment
    const fileInput = page.getByTestId('resource-file-input');
    await fileInput.setInputFiles({
      name: 'requirements.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF sample content'),
    });

    // Check item appears in list
    await expect(page.getByText('requirements.pdf')).toBeVisible();
  });

  test('Project Intelligence opens AI Project Manager Modal with diff review', async ({ page }) => {
    // Open Project Intelligence drawer
    const piBtn = page.getByTestId('project-intelligence-btn');
    await expect(piBtn).toBeVisible();
    await piBtn.click();

    // Click Spustit AI Project Manager
    const aiPmBtn = page.getByTestId('open-ai-pm-btn');
    await expect(aiPmBtn).toBeVisible();
    await aiPmBtn.click();

    // Modal should appear
    const modal = page.getByTestId('ai-pm-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AI Project Manager' })).toBeVisible();
    await expect(page.getByTestId('apply-pm-changes-btn')).toBeVisible();
  });
});
