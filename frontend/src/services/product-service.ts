import { getSession, signOut } from 'next-auth/react'

// Tipos para las peticiones y respuestas
export interface Product {
  id: string
  name: string
  description: string
  price: number
  initialStock: number
  stock: number
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
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string
  stock: number
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
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

    return this.request<ProductResponse>(endpoint)
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
    })
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(product: UpdateProductRequest): Promise<Product> {
    return this.request<Product>(`/${product.id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(productId: string): Promise<void> {
    return this.request<void>(`/${productId}`, {
      method: "DELETE",
    })
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductById(productId: string): Promise<Product> {
    return this.request<Product>(`/${productId}`)
  }

  /**
   * Actualiza solo el stock de un producto
   */
  async updateProductStock(productId: string, newStock: number): Promise<Product> {
    return this.request<Product>(`/${productId}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ stock: newStock }),
    })
  }

  /**
   * Obtiene todas las categorías disponibles
   */
  async getCategories(): Promise<string[]> {
    return this.request<string[]>("/categories")
  }

  /**
   * Exporta productos a CSV
   */
  async exportProducts(filters: ProductFilters = {}): Promise<Blob> {
    const params = new URLSearchParams()

    if (filters.name) params.append("name", filters.name)
    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((category) => {
        params.append("categories", category)
      })
    }
    if (filters.minPrice !== undefined) {
      params.append("minPrice", filters.minPrice.toString())
    }
    if (filters.maxPrice !== undefined) {
      params.append("maxPrice", filters.maxPrice.toString())
    }

    const queryString = params.toString()
    const endpoint = `/export${queryString ? `?${queryString}` : ""}`

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Accept: "text/csv",
      },
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`)
    }

    return response.blob()
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
  { value: "BOOKS", label: "Libros" },
  { value: "SPORTS", label: "Deportes" },
  { value: "HOME", label: "Hogar" },
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"]
