import { ShoppingBasket } from "lucide-react"

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'bento.leandroj.tech') {
      return 'https://api.bento.leandroj.tech/api/v1'
    }
  }

  return "http://localhost:8080/api/v1"
}

function getStompBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (baseUrl) {
    return baseUrl + "/ws"
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'bento.leandroj.tech') {
      return 'https://api.bento.leandroj.tech/ws'
    }
  }

  return "http://localhost:8080/ws"
}

export class AppConfig {
  public static readonly siteName = "Bento"
  public static readonly siteIcon = ShoppingBasket
  public static readonly apiBaseUrl = getApiBaseUrl()
  public static readonly stompBaseUrl = getStompBaseUrl()
}