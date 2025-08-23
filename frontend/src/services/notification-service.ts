import BaseService, { BaseResponse } from "./base-service"

export interface LowStockNotification {
  date: string
  product: {
    productId: string
    name: string
  }
  currentStock: number
  minimumStock: number
}

export interface LowStockNotificationFilters {
  page?: number
  size?: number
}

export interface LowStockNotificationtResponse extends BaseResponse {
  content: LowStockNotification[]
}

export class NotificationService extends BaseService {
  async getNotifications(filters: LowStockNotificationFilters): Promise<LowStockNotificationtResponse> {
    const url = `/low-stock-notifications?page=${filters.page ?? 0}&size=${filters.size ?? 10}`
    return this.request<LowStockNotificationtResponse>(url) as Promise<LowStockNotificationtResponse>
  }
}

export const notificationService = new NotificationService()
