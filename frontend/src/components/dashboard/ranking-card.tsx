import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/utils'

interface RankingCardProps {
  title: string
  description?: string
  items: {
    name: string
    value: number
  }[]
  valueUnit?: string
  noValueText?: string
}

export default function RankingCard(props: RankingCardProps) {
  const items = props.items.sort((a, b) => b.value - a.value)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        {props.description && <CardDescription>{props.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="space-y-2">
            {items.length === 0 && (
              <span className="text-sm text-muted-foreground">{props.noValueText || 'No hay datos disponibles'}</span>
            )}

            {items.length > 0 && items.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <Badge variant="secondary">{index + 1}</Badge>
                <span className="text-sm">
                  {item.name}
                  <span className='text-xs text-muted-foreground'> - {formatNumber(item.value)}{props.valueUnit && ` ${props.valueUnit}`}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}