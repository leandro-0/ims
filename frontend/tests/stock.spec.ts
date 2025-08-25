import { test, expect, Page } from '@playwright/test'

async function waitForNetworkIdle(page: Page) {
  await page.goto('/stock')
  await page.waitForLoadState('networkidle')
}

test.describe('Stock Movements', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await waitForNetworkIdle(page)
  })

  test('should display stock movements page elements', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: 'Stock' })).toBeVisible()

    // Verify table headers are present
    await expect(page.locator('th').filter({ hasText: 'Fecha' })).toBeVisible()
    await expect(page.locator('th').filter({ hasText: 'Tipo de movimiento' })).toBeVisible()
    await expect(page.locator('th').filter({ hasText: 'Producto' })).toBeVisible()
    await expect(page.locator('th').filter({ hasText: 'Usuario accionante' })).toBeVisible()
    await expect(page.locator('th').filter({ hasText: 'Cantidad' })).toBeVisible()
    await expect(page.locator('th').filter({ hasText: 'Acción realizada' })).toBeVisible()

    // Verify table is present
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('should load stock movements', async ({ page }) => {
    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10000 })

    // Check if movements are loaded
    const loadingCell = page.locator('td').filter({ hasText: 'Cargando datos...' })
    const movementRows = page.locator('tbody tr')

    await expect(loadingCell).not.toBeVisible({ timeout: 10000 })
    const hasMovements = await movementRows.count() > 1

    if (hasMovements) {
      // Verify movement data structure
      const firstMovementRow = movementRows.first()
      await expect(firstMovementRow).toBeVisible()

      const cells = firstMovementRow.locator('td')
      await expect(cells).toHaveCount(6)
    }

    const countDisplay = page.locator('div.text-sm.text-muted-foreground').filter({ hasText: /Mostrando \d+ movimientos de \d+/ })
    await expect(countDisplay).toBeVisible()
  })

  test('should handle pagination', async ({ page }) => {
    // Look for pagination controls
    const pagination = page.locator('nav[aria-label="pagination"]')
    if (await pagination.count() === 0) {
      return
    }

    await expect(pagination).toBeVisible()

    // Check for page size selector
    const pageSizeButton = page.locator('button:has-text("10")')
    if (await pageSizeButton.count() > 0) {
      await expect(pageSizeButton).toBeVisible()
    }

    // Check for next/previous buttons if there are multiple pages
    const nextButton = page.locator('button[aria-label="Go to next page"]')
    const prevButton = page.locator('button[aria-label="Go to previous page"]')

    if (await nextButton.count() > 0) {
      await expect(nextButton).toBeVisible()
    }
    if (await prevButton.count() > 0) {
      await expect(prevButton).toBeVisible()
    }
  })

  test('should change page size', async ({ page }) => {
    const pageSizeButton = page.locator('button[role="combobox"]')
    if (await pageSizeButton.count() === 0) {
      test.skip(true, 'Page size selector not available')
      return
    }

    await expect(pageSizeButton).toBeVisible()

    // Click to open dropdown
    await pageSizeButton.click()
    const pageSizeOption = page.locator('div[role="menuitem"]').filter({ hasText: '20' })

    if (await pageSizeOption.count() > 0) {
      await pageSizeOption.click()
      await page.waitForLoadState('networkidle')

      // Verify the page size changed
      await expect(page.locator('button:has-text("20")')).toBeVisible()
    }
  })
})