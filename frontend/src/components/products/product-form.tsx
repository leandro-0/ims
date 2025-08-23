"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type Product,
  PRODUCT_CATEGORIES,
  type CreateProductRequest,
  type UpdateProductRequest,
} from "@/services/product-service"
import { Textarea } from "@/components/ui/textarea"

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => void
  onCancel: () => void
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    initialStock: "",
    stock: "",
    category: "",
    minimumStock: "0",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        initialStock: product.initialStock.toString(),
        stock: product.stock.toString(),
        category: product.category,
        minimumStock: product.minimumStock?.toString() || "0",
      })
    }
  }, [product])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "El precio debe ser un número mayor a 0"
    }
    if (
      !product &&
      (!formData.initialStock || isNaN(Number(formData.initialStock)) || Number(formData.initialStock) < 0)
    ) {
      newErrors.initialStock = "El stock inicial debe ser un número mayor o igual a 0"
    }
    if (product && (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) {
      newErrors.stock = "El stock debe ser un número mayor o igual a 0"
    }
    if (!formData.category) {
      newErrors.category = "La categoría es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    if (product) {
      const updateData: UpdateProductRequest = {
        id: product.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        initialStock: product.initialStock, // Do not update stock
        stock: Number(formData.stock),
        category: formData.category,
        minimumStock: formData.minimumStock ? Number(formData.minimumStock) : 0,
      }
      onSubmit(updateData)
    } else {
      const createData: CreateProductRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        initialStock: Number(formData.initialStock),
        category: formData.category,
        minimumStock: formData.minimumStock ? Number(formData.minimumStock) : 0,
      }
      onSubmit(createData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nombre del producto"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select value={product?.category || formData.category} onValueChange={(value) => handleInputChange("category", value)}>
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
          {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Descripción del producto"
          rows={3}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0.00"
          />
          {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
        </div>

        {!product && (
          <div className="space-y-2">
            <Label htmlFor="initialStock">Stock Inicial *</Label>
            <Input
              id="initialStock"
              type="number"
              min="0"
              value={formData.initialStock}
              onChange={(e) => handleInputChange("initialStock", e.target.value)}
              placeholder="0"
            />
            {errors.initialStock && <p className="text-sm text-destructive">{errors.initialStock}</p>}
          </div>
        )}

        {product && (
          <div className="space-y-2">
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleInputChange("stock", e.target.value)}
              placeholder="0"
            />
            {errors.initialStock && <p className="text-sm text-destructive">{errors.initialStock}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="minimumStock">Stock M&iacute;nimo *</Label>
          <Input
            id="minimumStock"
            type="number"
            min="0"
            value={formData.minimumStock}
            onChange={(e) => handleInputChange("minimumStock", e.target.value)}
            placeholder="0"
          />
          {errors.initialStock && <p className="text-sm text-destructive">{errors.initialStock}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{product ? "Actualizar" : "Crear"} producto</Button>
      </div>
    </form>
  )
}