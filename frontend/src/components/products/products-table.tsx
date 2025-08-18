import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  type Product,
} from "@/services/product-service"
import ProductTableRow from "@/components/products/product-table-row"

interface ProductsTableProps {
  products: Product[]
  loading: boolean
  openEditModal: (product: Product) => void
  setProductToDelete: (product: Product | null) => void
  setCurrentPage: (page: number) => void
  currentPage: number
  totalPages: number
  pageSize: number
  setPageSize: (size: number) => void
  hasAnyRole: (roles: string[]) => boolean
}

export default function ProductsTable(props: ProductsTableProps) {
  const hasAccessToActions = props.hasAnyRole(["role_admin", "role_employee"])
  const canDelete = props.hasAnyRole(["role_admin"])

  return (
    <>
      <Card>
        <CardContent className="p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                {hasAccessToActions && (
                  <TableHead className="text-center">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : props.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                props.products.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    openEditModal={props.openEditModal}
                    setProductToDelete={props.setProductToDelete}
                    canDelete={canDelete}
                    hasAccessToActions={hasAccessToActions}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="pageSize">Elementos por página:</Label>
          <Select
            value={props.pageSize.toString()}
            onValueChange={(value) => {
              props.setPageSize(Number(value))
              props.setCurrentPage(0)
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => props.setCurrentPage(Math.max(0, props.currentPage - 1))}
            disabled={props.currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Página {props.currentPage + 1} de {props.totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => props.setCurrentPage(Math.min(props.totalPages - 1, props.currentPage + 1))}
            disabled={props.currentPage >= props.totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}