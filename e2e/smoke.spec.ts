import { test, expect } from '@playwright/test'

test('header renders and navigation works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('SpeakFlow')).toBeVisible()
  await expect(page.getByRole('combobox')).toBeVisible()
  await page.getByRole('link', { name: 'Membership' }).click()
  await expect(page.getByRole('heading', { name: 'Membership' })).toBeVisible()
})
