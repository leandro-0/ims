import { test, expect, Page } from '@playwright/test'

async function waitForNetworkIdle(page: Page) {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
}

test.describe('Dashboard', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await waitForNetworkIdle(page)
  })

  test('should display dashboard title and main sections', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1:has-text("Dashboard de Inventario")')).toBeVisible()

    // Verify main sections are present
    await expect(page.locator('text=Total de productos')).toBeVisible()
    await expect(page.locator('text=Unidades en stock')).toBeVisible()
    await expect(page.locator('text=Valor total')).toBeVisible()
  })

  test('should display low stock products table', async ({ page }) => {
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Check for table headers
    await expect(page.locator('th')).toHaveCount(5)
    await expect(page.locator('th:has-text("Nombre")')).toBeVisible()
    await expect(page.locator('th:has-text("Descripción")')).toBeVisible()
    await expect(page.locator('th:has-text("Categoría")')).toBeVisible()
    await expect(page.locator('th:has-text("Precio")')).toBeVisible()
    await expect(page.locator('th:has-text("Stock")')).toBeVisible()

    const productsInfo = page.locator('text=/Mostrando .* de .* productos/')
    await expect(productsInfo).toBeVisible()

    // Check that table has the correct structure
    const tableCard = page.locator('[data-slot="card"]').filter({ hasText: 'Productos en stock bajo' })
    await expect(tableCard).toBeVisible()
    await expect(tableCard.locator('text=Productos con cantidad en stock menor o igual a su stock mínimo')).toBeVisible()
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
    const pageSizeButton = page.locator('#change-page-size')
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

  test('should display charts and graphs', async ({ page }) => {
    // Verify pie charts are present
    await expect(page.locator('text=Distribución por categorías')).toBeVisible()
    await expect(page.locator('text=Movimientos de stock por categoría')).toBeVisible()

    // Verify bar charts are present
    await expect(page.locator('text=Movimientos de entradas')).toBeVisible()
    await expect(page.locator('text=Movimientos de salidas')).toBeVisible()

    await page.waitForSelector('.recharts-wrapper', { timeout: 10000 })

    // Verify Recharts containers exist
    const rechartsWrappers = page.locator('.recharts-wrapper')
    expect(await rechartsWrappers.count()).toBeGreaterThanOrEqual(4)

    const responsiveContainers = page.locator('.recharts-responsive-container')
    expect(await responsiveContainers.count()).toBeGreaterThanOrEqual(4)

    // Verify chart legends exist for pie charts
    const legendItems = page.locator('div').filter({ has: page.locator('div[style*="background-color"]') })
    expect(await legendItems.count()).toBeGreaterThan(0)
  })

  test('should display movement statistics cards', async ({ page }) => {
    // Verify movement cards are present
    await expect(page.locator('text=Entradas totales')).toBeVisible()
    await expect(page.locator('text=Salidas totales')).toBeVisible()
    await expect(page.locator('text=Top 3 usuarios con más movimientos')).toBeVisible()

    // Verify the movement descriptions
    await expect(page.locator('text=Movimientos de entrada en las últimas 24 horas')).toBeVisible()
    await expect(page.locator('text=Movimientos de salida en las últimas 24 horas')).toBeVisible()
    await expect(page.locator('text=Usuarios con mayor actividad en las últimas 24 horas')).toBeVisible()
  })

  test('should display chart descriptions and tooltips', async ({ page }) => {
    // Verify chart descriptions
    await expect(page.locator('text=Porcentaje de productos por categoría')).toBeVisible()
    await expect(page.locator('text=Porcentaje de movimientos por categoría en las últimas 24 horas')).toBeVisible()
    await expect(page.locator('text=Entradas de productos registradas en esta semana')).toBeVisible()
    await expect(page.locator('text=Salidas de productos registradas en esta semana')).toBeVisible()

    // Verify that chart containers have the correct height styling
    const chartContainers = page.locator('div.h-64')
    expect(await chartContainers.count()).toBeGreaterThanOrEqual(4)

    // Verify PieChart icons are present
    const pieChartIcons = page.locator('svg[data-testid="pie-chart"]')
    if (await pieChartIcons.count() === 0) {
      const chartIcons = page.locator('svg.h-5.w-5')
      expect(await chartIcons.count()).toBeGreaterThan(0)
    }
  })
})