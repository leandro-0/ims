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

interface Product {
  id: string
  name: string
  description: string
  price: number
  initialStock: number
  stock: number
  category: string
}

interface ProductResponse {
  content: Product[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  first: boolean
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number
  empty: boolean
}

const CATEGORIES = [
  { value: "FURNITURE", label: "Muebles" },
  { value: "ELECTRONICS", label: "Electrónicos" },
  { value: "CLOTHING", label: "Ropa" },
  { value: "BOOKS", label: "Libros" },
  { value: "SPORTS", label: "Deportes" },
  { value: "HOME", label: "Hogar" },
]

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Datos de ejemplo para simular el backend
  const mockData: ProductResponse = {
    content: [
      {
        id: "451bf5ca-b5f3-4c6e-84cf-28dd4755341c",
        name: "Armario Empotrado",
        description: "Armario empotrado de madera maciza con acabado en roble natural",
        price: 842.75,
        initialStock: 22,
        stock: 8,
        category: "FURNITURE",
      },
      {
        id: "552bf5ca-b5f3-4c6e-84cf-28dd4755341d",
        name: "Laptop Gaming",
        description: "Laptop para gaming con procesador Intel i7 y tarjeta gráfica RTX 4060",
        price: 1299.99,
        initialStock: 15,
        stock: 12,
        category: "ELECTRONICS",
      },
      {
        id: "653bf5ca-b5f3-4c6e-84cf-28dd4755341e",
        name: "Camiseta Deportiva",
        description: "Camiseta deportiva de material transpirable para entrenamiento",
        price: 29.99,
        initialStock: 50,
        stock: 35,
        category: "CLOTHING",
      },
      {
        id: "754bf5ca-b5f3-4c6e-84cf-28dd4755341f",
        name: "Mesa de Centro",
        description: "Mesa de centro moderna con diseño minimalista",
        price: 199.5,
        initialStock: 10,
        stock: 7,
        category: "FURNITURE",
      },
      {
        id: "855bf5ca-b5f3-4c6e-84cf-28dd4755341g",
        name: "Auriculares Bluetooth",
        description: "Auriculares inalámbricos con cancelación de ruido",
        price: 149.99,
        initialStock: 25,
        stock: 18,
        category: "ELECTRONICS",
      },
    ],
    pageable: {
      pageNumber: 0,
      pageSize: 10,
      sort: { empty: false, sorted: true, unsorted: false },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    last: false,
    totalPages: 1,
    totalElements: 5,
    first: true,
    size: 10,
    number: 0,
    sort: { empty: false, sorted: true, unsorted: false },
    numberOfElements: 5,
    empty: false,
  }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    initialStock: "",
    category: "",
  })

  // Simular carga de datos del backend
  const loadProducts = async () => {
    setLoading(true)
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Filtrar productos según búsqueda, categorías y precio
      let filteredProducts = mockData.content

      // Filtro por búsqueda
      if (searchTerm) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      // Filtro por categorías múltiples
      if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter((product) => selectedCategories.includes(product.category))
      }

      // Filtro por precio mínimo
      if (minPrice && !isNaN(Number.parseFloat(minPrice))) {
        filteredProducts = filteredProducts.filter((product) => product.price >= Number.parseFloat(minPrice))
      }

      // Filtro por precio máximo
      if (maxPrice && !isNaN(Number.parseFloat(maxPrice))) {
        filteredProducts = filteredProducts.filter((product) => product.price <= Number.parseFloat(maxPrice))
      }

      setProducts(filteredProducts)
      setTotalElements(filteredProducts.length)
      setTotalPages(Math.ceil(filteredProducts.length / 10))
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

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      initialStock: Number.parseInt(formData.initialStock),
      stock: Number.parseInt(formData.initialStock),
      category: formData.category,
    }

    // Simular llamada al backend
    mockData.content.push(newProduct)

    setFormData({ name: "", description: "", price: "", initialStock: "", category: "" })
    setIsAddDialogOpen(false)
    loadProducts()

    toast.success("Producto agregado correctamente")
  }

  const handleEditProduct = async () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.initialStock || !formData.category) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    const updatedProduct: Product = {
      ...editingProduct,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      initialStock: Number.parseInt(formData.initialStock),
      category: formData.category,
    }

    // Simular llamada al backend
    const index = mockData.content.findIndex((p) => p.id === editingProduct.id)
    if (index !== -1) {
      mockData.content[index] = updatedProduct
    }

    setFormData({ name: "", description: "", price: "", initialStock: "", category: "" })
    setIsEditDialogOpen(false)
    setEditingProduct(null)
    loadProducts()

    toast.success("Producto actualizado correctamente")
  }

  const handleDeleteProduct = async (productId: string) => {
    // Simular llamada al backend
    const index = mockData.content.findIndex((p) => p.id === productId)
    if (index !== -1) {
      mockData.content.splice(index, 1)
    }

    loadProducts()

    toast.success("Producto eliminado correctamente")
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
    return CATEGORIES.find((cat) => cat.value === category)?.label || category
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
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
          <p className="text-muted-foreground">Administra tu inventario de productos de manera eficiente</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                    {CATEGORIES.map((category) => (
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
          <CardDescription>Total de productos: {totalElements}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {/* Primera fila: Búsqueda y botón limpiar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={clearAllFilters} className="whitespace-nowrap bg-transparent">
                Limpiar Filtros
              </Button>
            </div>

            {/* Segunda fila: Filtros de precio */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2 items-center">
                <Label htmlFor="min-price" className="whitespace-nowrap">
                  Precio mín:
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-24"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Label htmlFor="max-price" className="whitespace-nowrap">
                  Precio máx:
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  step="0.01"
                  placeholder="999.99"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>

            {/* Tercera fila: Filtros de categorías */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Categorías:</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.value}`}
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => handleCategoryToggle(category.value)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`category-${category.value}`} className="text-sm cursor-pointer">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedCategories.map((categoryValue) => {
                    const category = CATEGORIES.find((cat) => cat.value === categoryValue)
                    return (
                      <Badge
                        key={categoryValue}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleCategoryToggle(categoryValue)}
                      >
                        {category?.label} ×
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
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
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.description}</div>
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
                  {CATEGORIES.map((category) => (
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
  )
}
