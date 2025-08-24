import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"
import {
  type Product,
  PRODUCT_CATEGORIES,
} from "@/services/product-service"

const getCategoryLabel = (value: string) => {
  return PRODUCT_CATEGORIES.find((cat) => cat.value === value)?.label || value
}

interface ProductTableRowProps {
  product: Product
  openEditModal: (product: Product) => void
  setProductToDelete: (product: Product) => void
  canDelete: boolean
  hasAccessToActions: boolean
}

export default function ProductTableRow({ product, openEditModal, setProductToDelete, canDelete, hasAccessToActions }: ProductTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell className="max-w-xs truncate">{product.description}</TableCell>
      <TableCell>
        <Badge variant="secondary">{getCategoryLabel(product.category)}</Badge>
      </TableCell>
      <TableCell className="text-right">${product.price.toLocaleString()}</TableCell>
      <TableCell className="text-right">
        <span className={product.stock <= (product.minimunStock ?? 0) ? "text-destructive font-semibold" : ""}>
          {product.stock}
        </span>
      </TableCell>
      {hasAccessToActions && (
        <TableCell>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="icon" onClick={() => openEditModal(product)}>
              <Edit className="h-4 w-4" />
            </Button>
            {canDelete && (
              <Button variant="outline" size="icon" onClick={() => setProductToDelete(product)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  )
}