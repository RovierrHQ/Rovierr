import { expect, test } from '@playwright/test'
import { attachDebugAndThrow, installDebugCapture } from './utils/debug-capture'
import { TEST_ORG_ID, TEST_TEAM_ID } from './utils/seed-org'

const CREATE_TIMEOUT_MS = process.env.CI ? 20_000 : 10_000

// Runs in "authenticated" project only (playwright.config.ts testMatch).

test('any user can access home page', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Starter Template/)
})

test('authenticated user with active org is redirected to org home', async ({
  page
}) => {
  await page.goto('/')

  await expect(page).toHaveURL(new RegExp(`/org/${TEST_ORG_ID}`))
  await expect(page.getByRole('heading', { name: /my issues/i })).toBeVisible()
})

test('My Issues page shows empty state or table', async ({ page }) => {
  await page.goto(`/org/${TEST_ORG_ID}`)

  await expect(page.getByRole('heading', { name: /my issues/i })).toBeVisible()
  await expect(page.getByText(/no issues assigned|title/i)).toBeVisible()
})

test('Board page shows columns', async ({ page }) => {
  await page.goto(`/org/${TEST_ORG_ID}/team/${TEST_TEAM_ID}/board`)

  await expect(page.getByRole('heading', { name: /board/i })).toBeVisible()
  await expect(page.getByText(/todo/i)).toBeVisible()
  await expect(page.getByText(/in progress/i)).toBeVisible()
  await expect(page.getByText(/done/i)).toBeVisible()
})

test('Team Issues page shows New issue and table', async ({ page }) => {
  await page.goto(`/org/${TEST_ORG_ID}/team/${TEST_TEAM_ID}/issues`)

  await expect(
    page.getByRole('heading', { name: /team issues/i })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /new issue/i })).toBeVisible()
})

test('can create issue from Team Issues page', async ({ page }, testInfo) => {
  const debug = installDebugCapture(page)
  await page.goto(`/org/${TEST_ORG_ID}/team/${TEST_TEAM_ID}/issues`)

  await page.getByRole('button', { name: /new issue/i }).click()
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: /new issue/i })
  ).toBeVisible()

  const title = `E2E issue ${Date.now()}`
  await page.getByRole('dialog').getByPlaceholder(/title/i).fill(title)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /create issue/i })
    .click()

  const row = page.getByRole('row').filter({ hasText: title })
  try {
    await expect(row).toBeVisible({ timeout: CREATE_TIMEOUT_MS })
  } catch {
    await attachDebugAndThrow(
      page,
      testInfo,
      debug,
      title,
      'Create issue failed: issue did not appear in table.'
    )
  }
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: /new issue/i })
  ).toBeHidden()
})

test('can edit issue from Team Issues page', async ({ page }, testInfo) => {
  const debug = installDebugCapture(page)
  await page.goto(`/org/${TEST_ORG_ID}/team/${TEST_TEAM_ID}/issues`)

  const title = `E2E edit-me ${Date.now()}`
  await page.getByRole('button', { name: /new issue/i }).click()
  await page.getByRole('dialog').getByPlaceholder(/title/i).fill(title)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /create issue/i })
    .click()

  const row = page.getByRole('row').filter({ hasText: title })
  try {
    await expect(row).toBeVisible({ timeout: CREATE_TIMEOUT_MS })
  } catch {
    await attachDebugAndThrow(
      page,
      testInfo,
      debug,
      title,
      'Create (edit test) failed: issue did not appear in table.'
    )
  }
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 3000 })

  await page
    .getByRole('row')
    .filter({ hasText: title })
    .getByRole('button', { name: /open actions/i })
    .click()
  await page.getByRole('menuitem', { name: /edit/i }).click()

  await expect(
    page.getByRole('dialog').getByRole('heading', { name: /edit issue/i })
  ).toBeVisible()
  const updatedTitle = `E2E edited ${Date.now()}`
  await page.getByRole('dialog').getByPlaceholder(/title/i).fill(updatedTitle)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /^save$/i })
    .click()

  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
  await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(title)).not.toBeVisible()
})

test('can delete issue from Team Issues page', async ({ page }, testInfo) => {
  const debug = installDebugCapture(page)
  await page.goto(`/org/${TEST_ORG_ID}/team/${TEST_TEAM_ID}/issues`)

  const title = `E2E delete-me ${Date.now()}`
  await page.getByRole('button', { name: /new issue/i }).click()
  await page.getByRole('dialog').getByPlaceholder(/title/i).fill(title)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /create issue/i })
    .click()

  const row = page.getByRole('row').filter({ hasText: title })
  try {
    await expect(row).toBeVisible({ timeout: CREATE_TIMEOUT_MS })
  } catch {
    await attachDebugAndThrow(
      page,
      testInfo,
      debug,
      title,
      'Create (delete test) failed: issue did not appear in table.'
    )
  }
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 3000 })

  await page
    .getByRole('row')
    .filter({ hasText: title })
    .getByRole('button', { name: /open actions/i })
    .click()
  await page.getByRole('menuitem', { name: /delete/i }).click()

  await expect(
    page.getByRole('alertdialog').getByText(/delete.*cannot be undone/i)
  ).toBeVisible()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: /^delete$/i })
    .click()

  await expect(page.getByRole('alertdialog')).toBeHidden({ timeout: 5000 })
  await expect(
    page.getByRole('row').filter({ hasText: title })
  ).not.toBeVisible({ timeout: 10000 })
})
