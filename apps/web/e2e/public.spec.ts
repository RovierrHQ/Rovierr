import { expect, test } from '@playwright/test'

test('home shows title and sign-in for anonymous user', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Starter Template/)
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()
  await expect(page.getByText(/sign in to access your issues/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
})

test('login page shows welcome and Google sign-in', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByText(/welcome/i).first()).toBeVisible()
  await expect(
    page.getByText(/sign in with your google account/i)
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /sign in with google/i })
  ).toBeVisible()
})

test('protected org route redirects to login when unauthenticated', async ({
  page
}) => {
  await page.goto('/org/some-org-id')

  await expect(page).toHaveURL(/\/login/)
})
