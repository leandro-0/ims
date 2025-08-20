import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  type Product,
} from "@/services/product-service"
import ProductTableRow from "@/components/products/product-table-row"
import TablePagination from "../table-pagination"

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