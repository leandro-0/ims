import { AppConfig } from "@/core/app-config"
import { LucideIcon } from "lucide-react"

interface IMSPageProps {
  children?: React.ReactNode
  icon?: LucideIcon
  title: string
}

export default function IMSPage(props: IMSPageProps) {
  return (
    <div>
      <title>{props.title} | {AppConfig.siteName}</title>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-4">
          {props.icon && <props.icon className="h-8 w-8 text-primary" />}
          <h1 className="text-lg font-bold">{props.title}</h1>
        </div>

        {props.children}
      </div>
    </div>
  )
}