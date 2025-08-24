import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface NumberCardProps {
  title: string
  icon?: LucideIcon
  value: number
  type: 'number' | 'currency'
  description?: string
}

export default function NumberCard(props: NumberCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
        {props.icon && <props.icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {props.type === 'currency'
            ? formatCurrency(props.value)
            : formatNumber(props.value)}
        </div>
        {props.description && <p className="text-xs text-muted-foreground">{props.description}</p>}
      </CardContent>
    </Card>
  )
}
