import { test, expect, Page } from '@playwright/test'

async function waitForNetworkIdle(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

test.describe('Products CRUD - Guest Users', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await waitForNetworkIdle(page)
  })

  test('should display products page elements', async ({ page }) => {
    // Check the main title
    await expect(page.locator('h1')).toContainText('Productos disponibles')

    // Check for filters card
    await expect(page.locator('div[data-slot="card-title"]').first()).toContainText('Filtros')

    // Look for search input
    const searchInput = page.locator('input[placeholder="Nombre del producto..."]')
    await expect(searchInput).toBeVisible()

    // Look for price filters
    const minPriceInput = page.locator('input[placeholder="0"]')
    const maxPriceInput = page.locator('input[placeholder="999999"]')
    await expect(minPriceInput).toBeVisible()
    await expect(maxPriceInput).toBeVisible()

    // Check for category checkboxes
    const categoryCheckboxes = page.locator('button[role="checkbox"]')
    await expect(categoryCheckboxes.first()).toBeVisible()

    // Look for the "Agregar" button, should not be visible to guests
    const addButton = page.locator('button:has-text("Agregar")')
    await expect(addButton).not.toBeVisible()
  })

  test('should not display actions in product table', async ({ page }) => {
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Check for table headers
    await expect(page.locator('th')).toHaveCount(5)

    // Check for specific column headers
    await expect(page.locator('th:has-text("Nombre")')).toBeVisible()
    await expect(page.locator('th:has-text("Descripción")')).toBeVisible()
    await expect(page.locator('th:has-text("Categoría")')).toBeVisible()
    await expect(page.locator('th:has-text("Precio")')).toBeVisible()
    await expect(page.locator('th:has-text("Stock")')).toBeVisible()
    await expect(page.locator('th:has-text("Acciones")')).not.toBeVisible()
  })
})

test.describe('Products CRUD - Authenticated Users', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await waitForNetworkIdle(page)
  })

  test('should display products page elements', async ({ page }) => {
    // Check the main title
    await expect(page.locator('h1')).toContainText('Productos disponibles')

    // Check for filters card
    await expect(page.locator('div[data-slot="card-title"]').first()).toContainText('Filtros')

    // Look for search input
    const searchInput = page.locator('input[placeholder="Nombre del producto..."]')
    await expect(searchInput).toBeVisible()

    // Look for price filters
    const minPriceInput = page.locator('input[placeholder="0"]')
    const maxPriceInput = page.locator('input[placeholder="999999"]')
    await expect(minPriceInput).toBeVisible()
    await expect(maxPriceInput).toBeVisible()

    // Check for category checkboxes
    const categoryCheckboxes = page.locator('button[role="checkbox"]')
    await expect(categoryCheckboxes.first()).toBeVisible()

    // Look for the "Agregar" button
    const addButton = page.locator('button:has-text("Agregar")')
    await expect(addButton).toBeVisible()
  })

  test('should open add product dialog', async ({ page }) => {
    // Click the "Agregar" button
    const addButton = page.locator('button:has-text("Agregar")')
    await addButton.click()

    // Wait for dialog to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Check dialog title
    await expect(page.locator('[role="dialog"] h2')).toContainText('Crear nuevo producto')

    // Check for form fields in the dialog
    await expect(page.locator('[role="dialog"] input[placeholder="Nombre del producto"]')).toBeVisible()
    await expect(page.locator('[role="dialog"] textarea[placeholder="Descripción del producto"]')).toBeVisible()
    await expect(page.locator('[role="dialog"] input[placeholder="0.00"]')).toBeVisible()
    await expect(page.locator('[role="dialog"] button:has-text("Selecciona una categoría")')).toBeVisible()

    // Close the dialog
    const cancelButton = page.locator('[role="dialog"] button:has-text("Cancelar")')
    await cancelButton.click()
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should search products', async ({ page }) => {
    // Use search input
    const searchInput = page.locator('input[placeholder="Nombre del producto..."]')
    await searchInput.fill('test product')

    // Click the search button
    const searchButton = page.locator('#search-button').filter({ hasText: '' }).first()
    await searchButton.click()

    await page.waitForLoadState('networkidle')

    // Verify the table shows either results or no results message
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Check if we have products or no results message
    const noResultsMessage = page.locator('text=No se encontraron productos')
    const isNoResultsVisible = await noResultsMessage.isVisible()

    if (!isNoResultsVisible) {
      // Verify at least one product row exists
      const productRows = page.locator('tbody tr')
      const rowCount = await productRows.count()
      expect(rowCount).toBeGreaterThan(0)
    } else {
      await expect(noResultsMessage).toBeVisible()
    }

    // Clear search
    await searchInput.clear()
  })

  test('should filter products by category', async ({ page }) => {
    // Click first category checkbox
    const firstCategoryCheckbox = page.locator('button[role="checkbox"]').first()
    await firstCategoryCheckbox.click()

    await page.waitForLoadState('networkidle')

    // Verify the checkbox is checked
    await expect(firstCategoryCheckbox).toHaveAttribute('data-state', 'checked')

    // Clear filters using the "Limpiar filtros" button
    const clearFiltersButton = page.locator('button:has-text("Limpiar filtros")')
    await clearFiltersButton.click()

    // Verify checkbox is unchecked
    await expect(firstCategoryCheckbox).toHaveAttribute('data-state', 'unchecked')
  })

  test('should display product table', async ({ page }) => {
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Check for table headers
    await expect(page.locator('th')).toHaveCount(6)

    // Check for specific column headers
    await expect(page.locator('th:has-text("Nombre")')).toBeVisible()
    await expect(page.locator('th:has-text("Descripción")')).toBeVisible()
    await expect(page.locator('th:has-text("Categoría")')).toBeVisible()
    await expect(page.locator('th:has-text("Precio")')).toBeVisible()
    await expect(page.locator('th:has-text("Stock")')).toBeVisible()
    await expect(page.locator('th:has-text("Acciones")')).toBeVisible()

    // Check for products info text
    const productsInfo = page.locator('text=/Mostrando .* de .* productos/')
    await expect(productsInfo).toBeVisible()
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

  test('should filter by price range', async ({ page }) => {
    // Find price range inputs
    const minPriceInput = page.locator('input[placeholder="0"]')
    const maxPriceInput = page.locator('input[placeholder="999999"]')

    await minPriceInput.fill('10')
    await maxPriceInput.fill('100')

    await page.waitForLoadState('networkidle')

    // Clear filters
    const clearFiltersButton = page.locator('button:has-text("Limpiar filtros")')
    await clearFiltersButton.click()

    // Verify inputs are cleared
    await expect(minPriceInput).toHaveValue('')
    await expect(maxPriceInput).toHaveValue('')
  })

  test('should create a new product', async ({ page }) => {
    // Click the "Agregar" button
    const addButton = page.locator('button:has-text("Agregar")')
    await addButton.click()

    // Wait for dialog to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Fill the product form
    await page.locator('[role="dialog"] input[placeholder="Nombre del producto"]').fill('Test Product')
    await page.locator('[role="dialog"] textarea[placeholder="Descripción del producto"]').fill('Test Description')
    await page.locator('[role="dialog"] input[placeholder="0.00"]').fill('50.00')
    await page.locator('[role="dialog"] input[placeholder="0"]').first().fill('100') // Initial stock

    // Select a category
    const categorySelect = page.locator('[role="dialog"] button:has-text("Selecciona una categoría")')
    await categorySelect.click()
    await page.locator('[role="option"]').first().click()

    // Submit the form
    const createButton = page.locator('[role="dialog"] button:has-text("Crear producto")')
    await createButton.click()

    // Wait for success message and dialog to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should edit an existing product', async ({ page }) => {
    // Click edit button on first product
    const editButton = page.locator('button[aria-label="Editar producto"]').first()
    if (await editButton.count() === 0) {
      return
    }
    await editButton.click()

    // Wait for edit dialog to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('[role="dialog"] h2')).toContainText('Editar producto')

    // Modify the product name
    const nameInput = page.locator('[role="dialog"] input[placeholder="Nombre del producto"]')
    await nameInput.clear()
    await nameInput.fill('Updated Product Name')

    // Submit the form
    const updateButton = page.locator('[role="dialog"] button:has-text("Actualizar producto")')
    await updateButton.click()

    // Wait for dialog to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should delete a product', async ({ page }) => {
    // Click delete button on first product
    const deleteButton = page.locator('button[aria-label="Eliminar producto"]').first()
    if (await deleteButton.count() === 0) {
      return
    }
    await deleteButton.click()

    // Wait for confirmation dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('[role="dialog"] h2')).toContainText('¿Estás seguro?')

    // Confirm deletion
    const confirmButton = page.locator('[role="dialog"] button:has-text("Eliminar")')
    await confirmButton.click()

    // Wait for dialog to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })
})
