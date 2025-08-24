"use client"

import { useState, useEffect, useCallback } from 'react'
import { Package, DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import NumberCard from '@/components/dashboard/number-card'
import LoadingPage from '@/components/loading-page'
import IMSPage from '@/components/ims-page'
import PieChartCard from '@/components/dashboard/pie-chart-card'
import RankingCard from '@/components/dashboard/ranking-card'
import BarChartCard from '@/components/dashboard/bar-chart-card'
import ProductsTable from '@/components/products/products-table'
import { getCategoryLabel, handleApiError, Product, productService } from '@/services/product-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { dashboardService, StatsData } from '@/services/dashboard-service'
import { formatDate } from '@/lib/utils'

const barColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48']

export default function InventoryDashboard() {
  // Stats state
  const [data, setData] = useState<StatsData | null>(null)
  const [loadingStats, setLoading] = useState(false)

  // Low stock products table state
  const [products, setProducts] = useState<Product[]>([])
  const [loadingLowStock, setLoadingLowStock] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const fetchStatsData = async () => {
    setLoading(true)
    const loadedData = await dashboardService.getStats()
    setData(loadedData)
    setLoading(false)
  }

  useEffect(() => {
    fetchStatsData()
  }, [])

  const loadLowStockProducts = useCallback(async () => {
    try {
      setLoadingLowStock(true)
      const response = await productService.getLowStockProducts({
        page: currentPage,
        size: pageSize
      })
      setProducts(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      toast.error("Error al cargar productos con stock bajo: " + handleApiError(error))
    } finally {
      setLoadingLowStock(false)
    }
  }, [currentPage, pageSize])

  useEffect(() => {
    loadLowStockProducts()
  }, [loadLowStockProducts])

  if (loadingStats || !data) {
    return <LoadingPage />
  }

  const dataCategoriesDistribution = data.categoriesDistribution.map((category, index) => ({
    name: getCategoryLabel(category.name),
    value: (category.value / data.summary.totalProducts) * 100,
    color: barColors[index % barColors.length]
  }))

  const dataCategoriesMovements = data.categoriesMovement.map((category, index) => ({
    name: getCategoryLabel(category.name),
    value: (category.value / (Math.max(data.movementsLast24Hours.in + data.movementsLast24Hours.out, 1))) * 100,
    color: barColors[index % barColors.length]
  }))

  return (
    <IMSPage title="Dashboard de Inventario" icon={BarChart3} rolesNeeded={["role_admin", "role_employee"]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <NumberCard
          title={'Total de productos'}
          value={data.summary.totalProducts}
          type={'number'}
          icon={Package}
          description='Productos únicos en inventario'
        />
        <NumberCard
          title={'Unidades en stock'}
          value={data.summary.totalStock}
          type={'number'}
          icon={BarChart3}
          description='Unidades totales disponibles'
        />
        <NumberCard
          title={'Valor total'}
          value={data.summary.totalValue}
          type={'currency'}
          icon={DollarSign}
          description='Valor monetario del inventario'
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PieChartCard
          title={'Distribución por categorías'}
          data={dataCategoriesDistribution}
          description='Porcentaje de productos por categoría'
        />
        <PieChartCard
          title={'Movimientos de stock por categoría'}
          data={dataCategoriesMovements}
          description='Porcentaje de movimientos por categoría en las últimas 24 horas'
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <NumberCard
          title={'Entradas totales'}
          value={data.movementsLast24Hours.in}
          type={'number'}
          icon={TrendingUp}
          description='Movimientos de entrada en las últimas 24 horas'
        />
        <NumberCard
          title={'Salidas totales'}
          value={data.movementsLast24Hours.out}
          type={'number'}
          icon={TrendingDown}
          description='Movimientos de salida en las últimas 24 horas'
        />
        <RankingCard
          title={'Top 3 usuarios con más movimientos'}
          description={'Usuarios con mayor actividad en las últimas 24 horas'}
          valueUnit='movimientos'
          items={data.movementsLast24Hours.topUsers}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BarChartCard
          title={'Movimientos de entradas'}
          description={'Entradas de productos registradas en esta semana'}
          tooltipText={'Entradas'}
          barColor={'#10b981'}
          data={data.movementsLast7Days.in.map(item => ({ name: formatDate(item.date), value: item.count }))}
        />
        <BarChartCard
          title={'Movimientos de salidas'}
          description={'Salidas de productos registradas en esta semana'}
          tooltipText={'Salidas'}
          barColor={'#ef4444'}
          data={data.movementsLast7Days.out.map(item => ({ name: formatDate(item.date), value: item.count }))}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos en stock bajo</CardTitle>
          <CardDescription>Productos con cantidad en stock menor o igual a su stock mínimo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-muted-foreground">
              Mostrando {products.length} de {totalElements} productos
            </div>
          </div>
          <ProductsTable
            products={products}
            loading={loadingLowStock}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            includeActions={false}
          />
        </CardContent>
      </Card>
    </IMSPage >
  )
}
