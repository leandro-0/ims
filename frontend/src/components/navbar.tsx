"use client"

import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { AppConfig } from "@/core/app-config"
import { redirect } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

type MenuOption = {
  label: string
  href: string
  rolesNeeded: string[]
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { logout, isAuthenticated, hasAnyRole } = useAuth()

  const menuOptions: MenuOption[] = [
    {
      label: "Productos",
      href: "/",
      rolesNeeded: [],
    },
    {
      label: "Stock",
      href: "/stock",
      rolesNeeded: ["role_admin", "role_employee"],
    },
    {
      label: "Dashboard",
      href: "/admin-dashboard",
      rolesNeeded: ["role_admin", "role_employee"],
    },
  ]

  const desktopLinkCns = "hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-gray-900"
  const mobileLinkCns = "text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
  const getLink = (index: number, option: MenuOption, platform: string, cns: string) => {
    if (option.rolesNeeded.length > 0 && !hasAnyRole(option.rolesNeeded)) {
      return null
    }

    return (
      <Link key={`link-nav-${platform}-${index}`} href={option.href} className={cns}>
        {option.label}
      </Link>
    )
  }
  const getDesktopLink = (index: number, option: MenuOption) => {
    return getLink(index, option, "desktop", desktopLinkCns)
  }
  const getMobileLink = (index: number, option: MenuOption) => {
    return getLink(index, option, "mobile", mobileLinkCns)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => redirect('/')}>
              <AppConfig.siteIcon className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">{AppConfig.siteName}</span>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuOptions.map((option, i) => getDesktopLink(i, option))}
              {!isAuthenticated && (
                <Link href="/login" className={desktopLinkCns}>
                  Iniciar sesión
                </Link>
              )}
              {isAuthenticated && (
                <button onClick={logout} className={cn(desktopLinkCns, "cursor-pointer")}>
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 mr-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {menuOptions.map((option, i) => getMobileLink(i, option))}
            {!isAuthenticated && (
              <Link href="/login" className={mobileLinkCns}>
                Iniciar sesión
              </Link>
            )}
            {isAuthenticated && (
              <button onClick={logout} className={mobileLinkCns}>
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
