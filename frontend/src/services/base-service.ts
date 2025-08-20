import { AppConfig } from "@/core/app-config"
import { getSession } from "next-auth/react"

export default class BaseService {
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | void> {
    const url = `${AppConfig.apiBaseUrl}${endpoint}`
    const session = await getSession()
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    if (config.headers && session?.accessToken) {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${session.accessToken}`
    }
    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      if (response.status === 204) return;
      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }
}