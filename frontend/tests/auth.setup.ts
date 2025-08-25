import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../playwright/.auth/user.json')

setup('authenticate with Keycloak as user with roles', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login')

  // Click login button
  await page.click('button#kc-login')

  await page.waitForURL(/localhost:7080.*auth.*/)

  await page.fill('input#username', process.env.NEXT_KEYCLOAK_USER ?? "admin@example.com")
  await page.fill('input#password', process.env.NEXT_KEYCLOAK_PASSWORD ?? "admin1")

  await page.click('button[type="submit"]')

  await page.waitForURL('http://localhost:3000')
  await page.waitForLoadState('networkidle')

  // Wait for authentication to fully load
  await page.waitForFunction(() => {
    const stockLink = document.querySelector('a[href="/stock"]')
    const dashboardLink = document.querySelector('a[href="/dashboard"]')
    const logoutButtons = document.querySelectorAll('button')
    let logoutButton = null
    for (const button of logoutButtons) {
      if (button.textContent && button.textContent.includes('Cerrar Sesión')) {
        logoutButton = button
        break
      }
    }
    return stockLink && dashboardLink && logoutButton
  }, { timeout: 15000 })

  // Verify logged users elements are visible
  await expect(page.locator('a:has-text("Stock")').first()).toBeVisible()
  await expect(page.locator('a:has-text("Dashboard")').first()).toBeVisible()
  await expect(page.locator('button:has-text("Cerrar Sesión")').first()).toBeVisible()
  await expect(page.locator('button:has(svg.lucide-bell)').first()).toBeVisible()

  await page.context().storageState({ path: authFile })
})
