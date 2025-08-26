import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PieChartIcon } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface PieChartCardProps {
  title: string
  description?: string
  data: {
    name: string
    value: number
    color: string
  }[]
  outerRadius?: number
  innerRadius?: number
  paddingAngle?: number
}

export default function PieChartCard(props: PieChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          {props.title}
        </CardTitle>
        {props.description && <CardDescription>{props.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={props.data}
                cx="50%"
                cy="50%"
                outerRadius={props.outerRadius || 80}
                innerRadius={props.innerRadius || 40}
                paddingAngle={props.paddingAngle || 3}
                dataKey={'value'}
              >
                {props.data.map((entry, index) => (
                  <Cell key={`cell-${props.title}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {props.data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-xs">{entry.name}: {formatNumber(entry.value)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}