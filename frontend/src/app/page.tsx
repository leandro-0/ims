"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Filter, Package } from "lucide-react"
import { toast } from "sonner"
import {
  productService,
  type Product,
  type ProductFilters,
  PRODUCT_CATEGORIES,
  handleApiError,
  type CreateProductRequest,
  type UpdateProductRequest,
} from "@/services/product-service"
import IMSPage from "@/components/ims-page"
import ProductForm from "@/components/products/product-form"
import ProductsTable from "@/components/products/products-table"
import { AuthContext } from "@/context/AuthContext"
import DebouncedInput, { DebouncedInputRef } from "@/components/debounced-input"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const searchInputRef = useRef<DebouncedInputRef>(null)

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const filters: ProductFilters = {
        page: currentPage,
        size: pageSize,
      }
      if (searchTerm.trim()) {
        filters.name = searchTerm.trim()
      }
      if (selectedCategories.length > 0) {
        filters.categories = selectedCategories
      }
      if (minPrice && !isNaN(Number(minPrice))) {
        filters.minPrice = Number(minPrice)
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filters.maxPrice = Number(maxPrice)
      }

      const response = await productService.getProducts(filters)
      setProducts(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      toast.error("Error al cargar productos: " + handleApiError(error))
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, selectedCategories, minPrice, maxPrice])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleSearch = () => {
    setCurrentPage(0)
    loadProducts()
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    setCurrentPage(0)
    if (checked) {
      setSelectedCategories((prev) => [...prev, category])
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category))
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setMinPrice("")
    setMaxPrice("")
    setCurrentPage(0)
    searchInputRef.current?.clear()
  }

  const handleCreateProduct = async (productData: CreateProductRequest) => {
    try {
      await productService.createProduct(productData)
      toast.success("Producto creado exitosamente")
      setIsCreateModalOpen(false)
      loadProducts()
    } catch (error) {
      toast.error("Error al crear producto: " + handleApiError(error))
    }
  }

  const handleEditProduct = async (productData: UpdateProductRequest) => {
    try {
      await productService.updateProduct(productData)
      toast.success("Producto actualizado exitosamente")
      setIsEditModalOpen(false)
      setEditingProduct(null)
      loadProducts()
    } catch (error) {
      toast.error("Error al actualizar producto: " + handleApiError(error))
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      await productService.deleteProduct(productToDelete.id)
      toast.success("Producto eliminado exitosamente")
      setProductToDelete(null)
      loadProducts()
    } catch (error) {
      toast.error("Error al eliminar producto: " + handleApiError(error))
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  return (
    <IMSPage icon={Package} title="Productos disponibles">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="mb-2">Buscar por nombre</Label>
              <div className="flex gap-2">
                <DebouncedInput
                  ref={searchInputRef}
                  id="search"
                  placeholder="Nombre del producto..."
                  onDebounce={(value) => {
                    setCurrentPage(0)
                    setSearchTerm(value)
                  }}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div>
                <Label htmlFor="minPrice" className="mb-2">Precio mínimo</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => {
                    setCurrentPage(0)
                    setMinPrice(e.target.value)
                  }}
                  className="w-32"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="mb-2">Precio máximo</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="999999"
                  value={maxPrice}
                  onChange={(e) => {
                    setCurrentPage(0)
                    setMaxPrice(e.target.value)
                  }}
                  className="w-32"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-4">Categorías</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {PRODUCT_CATEGORIES.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.value}
                    checked={selectedCategories.includes(category.value)}
                    onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                  />
                  <Label htmlFor={category.value}>{category.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Info */}
      <AuthContext.Consumer>
        {
          ({ user, hasRole, hasAnyRole }) => <>
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-muted-foreground">
                Mostrando {products.length} de {totalElements} productos
              </div>

              {user && hasAnyRole(["role_admin", "role_employee"]) && (
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Crear nuevo producto</DialogTitle>
                    </DialogHeader>
                    <ProductForm onSubmit={handleCreateProduct} onCancel={() => setIsCreateModalOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <ProductsTable
              products={products}
              loading={loading}
              openEditModal={openEditModal}
              setProductToDelete={setProductToDelete}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalPages={totalPages}
              hasAnyRole={hasAnyRole}
            />

            {/* Edit modal */}
            {hasAnyRole(["role_admin", "role_employee"]) && (
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Editar producto</DialogTitle>
                  </DialogHeader>
                  {editingProduct && (
                    <ProductForm
                      product={editingProduct}
                      onSubmit={handleEditProduct}
                      onCancel={() => {
                        setIsEditModalOpen(false)
                        setEditingProduct(null)
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            )}

            {/* Delete modal */}
            {hasRole("role_admin") && (
              <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará el producto &quot;<span className="font-bold">{productToDelete?.name}</span>&quot; del
                      sistema.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProduct}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        }
      </AuthContext.Consumer>
    </IMSPage >
  )
}
