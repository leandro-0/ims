import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import TablePagination from "../table-pagination"
import { StockMovement } from "@/services/stock-service"
import { Badge } from "../ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface StockMovementsTableProps {
  movements: StockMovement[]
  loading: boolean
  setCurrentPage: (page: number) => void
  currentPage: number
  totalPages: number
  pageSize: number
  setPageSize: (size: number) => void
  totalElements: number
}

export default function StockMovementsTable(props: StockMovementsTableProps) {
  const convertActionText = (action: string) => {
    switch (action) {
      case "UPDATED":
        return "Actualización de stock"
      case "DELETED":
        return "Producto eliminado"
      case "INSERTED":
        return "Producto creado"
      default:
        return action
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          Mostrando {props.movements.length} movimientos de {props.totalElements}
        </div>
      </div>

      <Card>
        <CardContent className="p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo de movimiento</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Usuario accionante</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Acci&oacute;n realizada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando datos...
                  </TableCell>
                </TableRow>
              ) : props.movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No hay movimientos de stock registrados
                  </TableCell>
                </TableRow>
              ) : (
                props.movements.map((mov, i) => (
                  <TableRow key={`mov-${i}`}>
                    <TableCell>{new Date(mov.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={mov.type === "INCOMING" ? "outline" : "destructive"}
                        className={mov.type === "INCOMING" ? "bg-green-800 text-white" : ""}
                      >
                        {mov.type === "INCOMING" ? "Entrada" : "Salida"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger>{mov.product.name}</TooltipTrigger>
                        <TooltipContent>
                          <span className="max-w-xs break-words">ID: {mov.product.productId}</span>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{mov.username}</TableCell>
                    <TableCell className="text-center">{mov.quantity}</TableCell>
                    <TableCell>{convertActionText(mov.action)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TablePagination
        currentPage={props.currentPage}
        totalPages={props.totalPages}
        pageSize={props.pageSize}
        setPageSize={props.setPageSize}
        setCurrentPage={props.setCurrentPage}
      />
    </>
  )
}