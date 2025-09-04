'use client'

import { memo } from 'react'
import { Stock } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Target, Zap } from 'lucide-react'

interface RankCardProps {
  stock: Stock
  rank: number
}

function RankCardComponent({ stock, rank }: RankCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const getDistanceColor = (distance: number) => {
    if (distance <= 5) return 'text-green-600'
    if (distance <= 15) return 'text-yellow-600'
    return 'text-destructive'
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              #{rank}
            </Badge>
            <CardTitle className="text-lg font-bold">{stock.ticker}</CardTitle>
            {stock.haveOptions ? (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Zap className="h-3 w-3 mr-1" />
                Opções
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
                Sem Opções
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stock.currentPrice)}
            </div>
            <div className="text-sm text-muted-foreground">
              Preço Atual
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Melhor Preço
            </div>
            <div className="text-lg font-semibold">
              {formatCurrency(stock.bestPrice)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Distância
            </div>
            <div className={`text-lg font-semibold ${getDistanceColor(stock.distanceBetweenPrices)}`}>
              {formatPercentage(stock.distanceBetweenPrices)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Dividendo Atual</div>
            <div className="text-lg font-semibold text-blue-600">
              {formatPercentage(stock.currentDividend * 100)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Dividendo Ideal</div>
            <div className="text-lg font-semibold text-green-600">
              {formatPercentage(stock.bestDividend * 100)}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Score:</span>
            <span className="font-semibold">{stock.scoreByBestPrice}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const RankCard = memo(RankCardComponent)
