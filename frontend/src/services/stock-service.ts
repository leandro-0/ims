import BaseService from "./base-service"

export interface StockMovement {
  id: string
  date: string
  type: "in" | "out"
  product: {
    id: string
    name: string
  }
  username: string
  quantity: number
  notes?: string
}

export interface StockMovementResponse {
  content: StockMovement[]
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

export class StockMovementService extends BaseService {
  static async getMovements(): Promise<StockMovementResponse> {
    // return this.request<StockMovementResponse>("/stock/movements") as Promise<StockMovementResponse>

    // TODO: Replace with actual API call
    return {
      content: [
        {
          id: "1",
          date: new Date().toISOString(),
          type: "in",
          product: {
            id: "p1",
            name: "Producto 1",
          },
          username: "Usuario 1",
          quantity: 10,
          notes: "Entrada de stock inicial",
        },
        {
          id: "2",
          date: new Date().toISOString(),
          type: "out",
          product: {
            id: "p2",
            name: "Producto 2",
          },
          username: "Usuario 2",
          quantity: 5,
          notes: "Salida de stock por venta",
        },
      ],
      pageable: {
        pageNumber: 0,
        pageSize: 10,
        sort: {
          empty: false,
          sorted: true,
          unsorted: false,
        },
        offset: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalPages: 1,
      totalElements: 2,
      first: true,
      size: 10,
      number: 0,
      sort: {
        empty: false,
        sorted: true,
        unsorted: false,
      },
      numberOfElements: 2,
      empty: false,
    }
  }
}
