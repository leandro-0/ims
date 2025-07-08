"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Navbar } from "@/components/navbar"
import {
   productService,
  handleApiError,
  PRODUCT_CATEGORIES,
  type Product,
  type ProductFilters,
} from "@/services/product-service"

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)


  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    initialStock: "",
    category: "",
  })

  // Cargar productos desde el backend
  const loadProducts = async () => {
    setLoading(true)
    try {
      const filters: ProductFilters = {
        page: currentPage,
        size: pageSize,
        name: searchTerm || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined
      }

      const response = await productService.getProducts(filters)

      setProducts(response.content)
      setTotalElements(response.totalElements)
      setTotalPages(response.totalPages)
    } catch (error) {
      toast.error("No se pudieron cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [searchTerm, selectedCategories, minPrice, maxPrice, currentPage])

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.initialStock || !formData.category) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      await productService.createProduct({
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        initialStock: Number.parseInt(formData.initialStock),
        category: formData.category,
    })

      setFormData({ name: "", description: "", price: "", initialStock: "", category: "" })
      setIsAddDialogOpen(false)
      loadProducts()
      toast.success("Producto agregado correctamente")
    } catch (error) {
      toast.error("No se pudo agregar el producto")
    }
  }

  const handleEditProduct = async () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.initialStock || !formData.category) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      await productService.updateProduct({
        id: editingProduct.id,
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        initialStock: Number.parseInt(formData.initialStock),
        stock: editingProduct.stock, // Mantener el stock actual
        category: formData.category,
      })
    
      setFormData({ name: "", description: "", price: "", initialStock: "", category: "" })
      setIsEditDialogOpen(false)
      setEditingProduct(null)
      loadProducts()

      toast.success("Producto actualizado correctamente")
    } catch (error) {
      toast.error("No se pudo actualizar el producto")
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId)
      loadProducts()
      toast.success("Producto eliminado correctamente")
    } catch (error) {
      toast.error("No se pudo eliminar el producto")
    }

    
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      initialStock: product.initialStock.toString(),
      category: product.category,
    })
    setIsEditDialogOpen(true)
  }

  const getCategoryLabel = (category: string) => {
    return PRODUCT_CATEGORIES.find((cat) => cat.value === category)?.label || category
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Sin stock", variant: "destructive" as const }
    if (stock <= 5) return { label: "Stock bajo", variant: "secondary" as const }
    return { label: "En stock", variant: "default" as const }
  }

  const handleCategoryToggle = (categoryValue: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryValue)) {
        return prev.filter((cat) => cat !== categoryValue)
      } else {
        return [...prev, categoryValue]
      }
    })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setMinPrice("")
    setMaxPrice("")
    setCurrentPage(0)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }
  const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`
  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Navbar />
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
          <p className="text-muted-foreground">Administra tu inventario de productos de manera eficiente</p>
          </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              <DialogDescription>Completa la información del nuevo producto</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="initialStock">Stock Inicial *</Label>
                  <Input
                    id="initialStock"
                    type="number"
                    value={formData.initialStock}
                    onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProduct}>Agregar Producto</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos en Inventario
          </CardTitle>
          <CardDescription>
            Total de productos: {totalElements} | Página {currentPage + 1} de {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {/* Filtros principales - Responsive */}
            <div className="flex flex-col space-y-4">
              {/* Primera fila: Búsqueda */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Segunda fila: Precios y botón limpiar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-3 flex-1">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                    Precio mínimo
                  </Label>
                  <Input
                    id="min-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                    Precio máximo
                  </Label>
                  <Input
                    id="max-price"
                    type="number"
                    step="0.01"
                    placeholder="999.99"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="text-sm"
                  />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full sm:w-auto whitespace-nowrap bg-transparent"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
          
            {/* Fila de categorías */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
                <Label className="text-sm font-medium whitespace-nowrap">Categorías:</Label>
                <Select
                  onValueChange={(value) => {
                    if (value && !selectedCategories.includes(value)) {
                      setSelectedCategories((prev) => [...prev, value])
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Agregar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.filter((category) => !selectedCategories.includes(category.value)).map(
                      (category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Categorías seleccionadas */}
              </div>
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {selectedCategories.map((categoryValue) => {
                    const category = PRODUCT_CATEGORIES.find((cat) => cat.value === categoryValue)
                    return (
                      <Badge
                        key={categoryValue}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleCategoryToggle(categoryValue)}
                      >
                        {category?.label} ×
                      </Badge>
                    )
                  })}
                </div>
              )}
          </div>

           <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px] max-w-xs">Producto</TableHead>
                    <TableHead className="min-w-[100px]">Categoría</TableHead>
                    <TableHead className="min-w-[80px]">Precio</TableHead>
                    <TableHead className="min-w-[60px]">Stock</TableHead>
                    <TableHead className="min-w-[80px]">Estado</TableHead>
                    <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Cargando productos...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const stockStatus = getStockStatus(product.stock)
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="max-w-xs">
                              <div className="font-medium truncate">{product.name}</div>
                              <div
                                className="text-sm text-muted-foreground line-clamp-2 leading-tight"
                                title={product.description}
                              >
                                {product.description}
                              </div>
                            </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getCategoryLabel(product.category)}</Badge>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el producto "
                                    {product.name}" del inventario.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {products.length} de {totalElements} productos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm">
                  {currentPage + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para editar producto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Modifica la información del producto</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Precio *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-initialStock">Stock Inicial *</Label>
                <Input
                  id="edit-initialStock"
                  type="number"
                  value={formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditProduct}>Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  )
}
