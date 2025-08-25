import { AppConfig } from '@/core/app-config'
import { test, expect, Page } from '@playwright/test'

async function waitForAuth(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.waitForFunction(() => {
    const stockLink = document.querySelector('nav a[href="/stock"]')
    const dashboardLink = document.querySelector('nav a[href="/dashboard"]')
    return dashboardLink !== null && stockLink !== null
  }, { timeout: 10000 })

  await page.waitForTimeout(1000)
}

test.describe('Navigation - Authenticated Actions', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await waitForAuth(page)
  })

  test('should display navbar elements for authenticated user', async ({ page }) => {
    // Check if the main site title is visible
    await expect(page.locator('nav span').first()).toContainText(AppConfig.siteName)

    // Check if navigation links are visible
    await expect(page.locator('nav a[href="/"]')).toBeVisible()
    await expect(page.locator('nav a[href="/stock"]')).toBeVisible()
    await expect(page.locator('nav a[href="/dashboard"]')).toBeVisible()

    // Check if notifications button is visible
    await expect(page.locator('button:has(svg.lucide-bell)').first()).toBeVisible()

    // Check if logout button is visible
    await expect(page.locator('nav button:has-text("Cerrar Sesión")')).toBeVisible()
  })

  test('should navigate to Productos page', async ({ page }) => {
    // Click on Productos link
    await page.locator('nav a[href="/"]').click()
    await page.waitForLoadState('networkidle')

    // Verify we are on the products page
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('Productos disponibles')
  })

  test('should navigate to Stock page', async ({ page }) => {
    const stockLink = page.locator('nav a[href="/stock"]')
    await expect(stockLink).toBeVisible()

    // Click on Stock link
    await stockLink.click()

    await page.waitForURL('/stock', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // Verify we are on the stock page
    await expect(page).toHaveURL('/stock')
    await expect(page.locator('h1')).toContainText('Stock')
  })

  test('should navigate to Dashboard page', async ({ page }) => {
    const dashboardLink = page.locator('nav a[href="/dashboard"]')
    await expect(dashboardLink).toBeVisible()

    // Click on Dashboard link
    await dashboardLink.click()

    await page.waitForURL('/dashboard', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // Verify we are on the dashboard page
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should open and display notifications', async ({ page }) => {
    // Click on the notifications button
    const notificationsButton = page.locator('button:has(svg.lucide-bell)').first()
    await notificationsButton.click()

    // Wait for dropdown to open
    await expect(page.locator('[data-radix-popper-content-wrapper]')).toBeVisible()

    // Check for notifications content
    const notificationsHeader = page.locator('text=Notificaciones de stock bajo')
    if (await notificationsHeader.count() > 0) {
      await expect(notificationsHeader).toBeVisible()
    }

    await page.waitForLoadState('networkidle')

    // Check if notifications are displayed
    const notificationItems = page.locator('[data-radix-popper-content-wrapper] .border-b')
    if (await notificationItems.count() > 0) {
      await expect(notificationItems.first()).toBeVisible()
    }

    // Close notifications
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-radix-popper-content-wrapper]')).not.toBeVisible()
  })
})

test.describe('Navigation - Logout', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test('should logout and redirect to login page', async ({ page }) => {
    await waitForAuth(page)

    // Ensure logout button is visible
    const logoutButton = page.locator('nav button:has-text("Cerrar Sesión")')
    await expect(logoutButton).toBeVisible()

    // Click on logout button
    await logoutButton.click()

    // Wait for navigation
    await page.waitForURL(/.*login.*/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/.*login.*/)

    // Verify login page elements are visible
    await expect(page.locator('button#kc-login')).toBeVisible()
    await expect(page.locator('text=Iniciar Sesión con Keycloak')).toBeVisible()

    // Should not see authenticated navigation items
    await expect(page.locator('nav a:has-text("Stock")')).not.toBeVisible()
    await expect(page.locator('nav a:has-text("Dashboard")')).not.toBeVisible()
    await expect(page.locator('nav button:has-text("Cerrar Sesión")')).not.toBeVisible()
  })
})
