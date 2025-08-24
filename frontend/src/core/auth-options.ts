import { NextAuthOptions } from "next-auth"
import { jwtDecode } from "jwt-decode"

const clientId = process.env.KEYCLOAK_CLIENT_ID || "ims"
const serverIssuer = process.env.KEYCLOAK_ISSUER_SERVER || process.env.KEYCLOAK_ISSUER || "http://localhost:7080/realms/ims-realm"
export const issuer = process.env.KEYCLOAK_ISSUER || "http://localhost:7080/realms/ims-realm"

interface KeycloakProfile {
  sub: string
  name?: string
  email?: string
  preferred_username?: string
  realm_access?: {
    roles?: string[]
  }
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${serverIssuer}/protocol/openid-connect/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "keycloak-pkce",
      name: "Keycloak",
      type: "oauth",
      authorization: {
        url: `${issuer}/protocol/openid-connect/auth`,
        params: {
          scope: "openid profile email",
          response_type: "code",
        }
      },
      token: `${serverIssuer}/protocol/openid-connect/token`,
      userinfo: `${serverIssuer}/protocol/openid-connect/userinfo`,
      jwks_endpoint: `${serverIssuer}/protocol/openid-connect/certs`,
      issuer: issuer,
      clientId: clientId,
      clientSecret: undefined,
      client: {
        token_endpoint_auth_method: "none"
      },
      profile(profile: KeycloakProfile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email,
          username: profile.preferred_username,
          roles: profile.realm_access?.roles || []
        }
      },
      checks: ["pkce", "state"],
    }
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // En el primer login
      if (account?.access_token) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = Date.now() + (Number(account.expires_in) || 3600) * 1000

        const decodedToken = jwtDecode(account?.access_token)
        if (decodedToken && typeof decodedToken !== 'string') {
          token.roles = decodedToken?.resource_access.ims.roles || []
        }
      }

      if (profile) {
        const keycloakProfile = profile as KeycloakProfile
        token.username = keycloakProfile.preferred_username
      }

      if (token.accessToken && token.expiresAt && Date.now() > token.expiresAt) {
        return {}
      }

      return token
    },
    async session({ session, token }) {
      // Si el token está vacío (invalidado), no crear sesión
      if (!token.accessToken) {
        return {} as any
      }

      session.accessToken = token.accessToken as string
      session.user.username = token.username as string
      session.user.roles = token.roles as string[]

      return session
    }
  },
  events: {
    // Evento cuando se invalida sesión
    async signOut({ token }) {
      if (token?.accessToken) {
        // Opcional: Llamar al logout endpoint de Keycloak
        try {
          await fetch(`${serverIssuer}/protocol/openid-connect/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: clientId,
              refresh_token: token.refreshToken as string || '',
            }),
          })
        } catch (error) {
          console.error('Error al invalidar en Keycloak:', error)
        }
      }
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutos
  },
  debug: process.env.NODE_ENV === 'development'
}