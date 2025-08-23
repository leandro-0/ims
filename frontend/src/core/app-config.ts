import { ShoppingBasket } from "lucide-react"

export class AppConfig {
  public static readonly siteName = "Bento"
  public static readonly siteIcon = ShoppingBasket
  public static readonly apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
  public static readonly stompBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") + "/ws"
}