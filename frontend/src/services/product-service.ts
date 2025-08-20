import BaseService from './base-service'

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
  name?: string
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  page?: number
  size?: number
}

class ProductService extends BaseService {
  /**
   * Obtiene productos paginados con filtros
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams()
    if (filters.name) {
      params.append("name", filters.name)
    }
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
    if (filters.page !== undefined) {
      params.append("page", filters.page.toString())
    } else {
      params.append("page", "0")
    }
    if (filters.size !== undefined) {
      params.append("size", filters.size.toString())
    } else {
      params.append("size", "10")
    }

    const queryString = params.toString()
    const endpoint = `/products/search${queryString ? `?${queryString}` : ""}`

    return this.request<ProductResponse>(endpoint) as Promise<ProductResponse>
  }

  /**
   * Crea un nuevo producto
   */
  async createProduct(product: CreateProductRequest): Promise<Product> {
    const productData = {
      id: "",
      name: product.name,
      description: product.description,
      price: product.price,
      initialStock: product.initialStock,
      stock: product.initialStock,
      category: product.category,
    }

    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }) as Promise<Product>
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(product: UpdateProductRequest): Promise<Product> {
    return this.request<Product>(`/products/${product.id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }) as Promise<Product>
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(productId: string): Promise<void> {
    return this.request<void>(`/products/${productId}`, {
      method: "DELETE",
    })
  }
}

export const productService = new ProductService()

export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return "Ha ocurrido un error inesperado"
}

export const PRODUCT_CATEGORIES = [
  { value: "FURNITURE", label: "Muebles" },
  { value: "ELECTRONICS", label: "Electrónicos" },
  { value: "CLOTHING", label: "Ropa" },
  { value: "FOOD", label: "Comida" },
  { value: "TOYS", label: "Juguetes" },
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"]
