import { getSession } from 'next-auth/react'

// Tipos para las peticiones y respuestas
export interface Product {
  id: string
  name: string
  description: string
  price: number
  initialStock: number
  stock: number
  minimunStock?: number
  category: string
}

export interface ProductResponse {
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

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  initialStock: number
  category: string
  minimumStock: number
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string
  stock: number
  minimumStock: number
}

export interface ProductFilters {
  name?: string // Cambiar de 'search' a 'name' para coincidir con el backend
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  page?: number
  size?: number
}

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1/products"

class ProductService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> | undefined {
    const url = `${API_BASE_URL}${endpoint}`
    const session = await getSession()
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    if (config.headers && session?.accessToken) {
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${session.accessToken}`
    }
    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      if (response.status === 204) return;
      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  /**
   * Obtiene productos paginados con filtros
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams()

    // Nombre (búsqueda)
    if (filters.name) {
      params.append("name", filters.name)
    }

    // Categorías múltiples - enviar cada categoría como parámetro separado
    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((category) => {
        params.append("categories", category)
      })
    }

    // Filtros de precio
    if (filters.minPrice !== undefined) {
      params.append("minPrice", filters.minPrice.toString())
    }
    if (filters.maxPrice !== undefined) {
      params.append("maxPrice", filters.maxPrice.toString())
    }

    // Paginación
    if (filters.page !== undefined) {
      params.append("page", filters.page.toString())
    } else {
      params.append("page", "0") // Valor por defecto
    }

    if (filters.size !== undefined) {
      params.append("size", filters.size.toString())
    } else {
      params.append("size", "10") // Valor por defecto
    }

    const queryString = params.toString()
    const endpoint = `/search${queryString ? `?${queryString}` : ""}`

    return this.request<ProductResponse>(endpoint)!
  }

  /**
   * Crea un nuevo producto
   */
  async createProduct(product: CreateProductRequest): Promise<Product> {
    const productData = {
      id: "", // El backend generará el ID
      name: product.name,
      description: product.description,
      price: product.price,
      initialStock: product.initialStock,
      stock: product.initialStock, // Stock inicial igual al stock actual
      category: product.category,
    }

    return this.request<Product>("", {
      method: "POST",
      body: JSON.stringify(productData),
    })!
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(product: UpdateProductRequest): Promise<Product> {
    return this.request<Product>(`/${product.id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })!
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(productId: string): Promise<void> {
    return this.request<void>(`/${productId}`, {
      method: "DELETE",
    })
  }
}

// Instancia singleton del servicio
export const productService = new ProductService()

// Funciones de utilidad para manejo de errores
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return "Ha ocurrido un error inesperado"
}

// Constantes para categorías (puedes moverlas a un archivo separado)
export const PRODUCT_CATEGORIES = [
  { value: "FURNITURE", label: "Muebles" },
  { value: "ELECTRONICS", label: "Electrónicos" },
  { value: "CLOTHING", label: "Ropa" },
  { value: "FOOD", label: "Comida" },
  { value: "TOYS", label: "Juguetes" },
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"]
