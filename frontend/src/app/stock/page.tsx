"use client"

import IMSPage from "@/components/ims-page"
import { StockMovement, StockMovementService } from "@/services/stock-service"
import { Blocks } from "lucide-react"
import { toast } from "sonner"
import { useCallback, useEffect, useState } from "react"
import StockMovementsTable from "@/components/stock/stock-movements-table"
import { handleApiError } from "@/services/product-service"

export default function StockPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const loadMovements = useCallback(async () => {
    try {
      setLoading(true)
      const response = await StockMovementService.getMovements()
      setMovements(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      toast.error("Error al cargar movimientos de stock: " + handleApiError(error))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  useEffect(() => {
    loadMovements()
  }, [loadMovements])

  return (
    <IMSPage title="Stock" icon={Blocks} rolesNeeded={["role_employee", "role_admin"]}>
      <StockMovementsTable
        movements={movements}
        loading={loading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
        totalElements={totalElements}
      />
    </IMSPage>
  )
}