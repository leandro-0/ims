"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Tipos para Keycloak
interface KeycloakProfile {
  id?: string
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  emailVerified?: boolean
}

interface KeycloakTokenParsed {
  exp?: number
  iat?: number
  auth_time?: number
  jti?: string
  iss?: string
  aud?: string
  sub?: string
  typ?: string
  azp?: string
  session_state?: string
  preferred_username?: string
  email_verified?: boolean
  name?: string
  given_name?: string
  family_name?: string
  email?: string
  realm_access?: {
    roles: string[]
  }
  resource_access?: {
    [key: string]: {
      roles: string[]
    }
  }
}

interface KeycloakInstance {
  init: (options: any) => Promise<boolean>
  login: (options?: any) => void
  logout: (options?: any) => void
  register: (options?: any) => void
  accountManagement: () => void
  createLoginUrl: (options?: any) => string
  createLogoutUrl: (options?: any) => string
  createRegisterUrl: (options?: any) => string
  createAccountUrl: () => string
  isTokenExpired: (minValidity?: number) => boolean
  updateToken: (minValidity?: number) => Promise<boolean>
  clearToken: () => void
  hasRealmRole: (role: string) => boolean
  hasResourceRole: (role: string, resource?: string) => boolean
  loadUserProfile: () => Promise<KeycloakProfile>
  loadUserInfo: () => Promise<any>
  authenticated?: boolean
  token?: string
  tokenParsed?: KeycloakTokenParsed
  refreshToken?: string
  idToken?: string
  idTokenParsed?: KeycloakTokenParsed
  realmAccess?: {
    roles: string[]
  }
  resourceAccess?: {
    [key: string]: {
      roles: string[]
    }
  }
  refreshTokenParsed?: KeycloakTokenParsed
  timeSkew?: number
  responseMode?: string
  flow?: string
  adapter?: string
  responseType?: string
  subject?: string
  pkceMethod?: string
}

interface AuthContextType {
  keycloak: KeycloakInstance | null
  authenticated: boolean
  loading: boolean
  user: KeycloakProfile | null
  token: string | null
  login: () => void
  logout: () => void
  hasRole: (role: string) => boolean
  hasRealmRole: (role: string) => boolean
  hasResourceRole: (role: string, resource?: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configuración de Keycloak
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "inventory-realm",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "inventory-app",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [keycloak, setKeycloak] = useState<KeycloakInstance | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<KeycloakProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        // Importar Keycloak dinámicamente
        const Keycloak = (await import("keycloak-js")).default
        const keycloakInstance = new Keycloak(keycloakConfig)

        const authenticated = await keycloakInstance.init({
          onLoad: "check-sso",
          silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
          pkceMethod: "S256",
        })

        setKeycloak(keycloakInstance)
        setAuthenticated(authenticated)

        if (authenticated) {
          setToken(keycloakInstance.token || null)
          try {
            const userProfile = await keycloakInstance.loadUserProfile()
            setUser(userProfile)
          } catch (error) {
            console.error("Error loading user profile:", error)
          }
        }

        // Configurar renovación automática de token
        if (authenticated) {
          setInterval(() => {
            keycloakInstance
              .updateToken(70)
              .then((refreshed) => {
                if (refreshed) {
                  setToken(keycloakInstance.token || null)
                  console.log("Token refreshed")
                }
              })
              .catch(() => {
                console.log("Failed to refresh token")
                keycloakInstance.logout()
              })
          }, 60000) // Verificar cada minuto
        }
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error)
      } finally {
        setLoading(false)
      }
    }

    initKeycloak()
  }, [])

  const login = () => {
    keycloak?.login({
      redirectUri: window.location.origin,
    })
  }

  const logout = () => {
    keycloak?.logout({
      redirectUri: window.location.origin,
    })
  }

  const hasRole = (role: string): boolean => {
    return hasRealmRole(role) || hasResourceRole(role)
  }

  const hasRealmRole = (role: string): boolean => {
    return keycloak?.hasRealmRole(role) || false
  }

  const hasResourceRole = (role: string, resource?: string): boolean => {
    return keycloak?.hasResourceRole(role, resource) || false
  }

  const value: AuthContextType = {
    keycloak,
    authenticated,
    loading,
    user,
    token,
    login,
    logout,
    hasRole,
    hasRealmRole,
    hasResourceRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Hook para proteger rutas
export function useRequireAuth() {
  const { authenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && !authenticated) {
      // Redirigir al login si no está autenticado
      window.location.href = "/login"
    }
  }, [authenticated, loading])

  return { authenticated, loading }
}
