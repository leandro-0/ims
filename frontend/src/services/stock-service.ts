import BaseService, { BaseResponse } from "./base-service"

export interface StockMovement {
  id: string
  date: string
  type: "INCOMING" | "OUTGOING"
  product: {
    productId: string
    name: string
  }
  username: string
  quantity: number
  action: string
}

export interface StockMovementResponse extends BaseResponse {
  content: StockMovement[]
}

export interface StockMovementFilters {
  page?: number
  size?: number
}

export class StockMovementService extends BaseService {
  async getMovements(filters: StockMovementFilters): Promise<StockMovementResponse> {
    const url = `/stock-movements?page=${filters.page ?? 0}&size=${filters.size ?? 10}`

    return this.request<StockMovementResponse>(url) as Promise<StockMovementResponse>
  }
}

export const stockMovementsService = new StockMovementService()