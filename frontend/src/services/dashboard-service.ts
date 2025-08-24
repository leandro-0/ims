import BaseService from "./base-service"

type MovementCount = {
  date: string
  count: number
}

export interface StatsData {
  summary: {
    totalProducts: number
    totalStock: number
    totalValue: number
  }
  categoriesDistribution: {
    name: string
    value: number
  }[]
  categoriesMovement: {
    name: string
    value: number
  }[]
  movementsLast24Hours: {
    in: number
    out: number
    topUsers: {
      name: string
      value: number
    }[]
  }
  movementsLast7Days: {
    in: MovementCount[]
    out: MovementCount[]
  }
}

class DashboardService extends BaseService {
  async getStats(): Promise<StatsData> {
    const url = `/dashboard/stats`
    return this.request<StatsData>(url) as Promise<StatsData>
  }
}

export const dashboardService = new DashboardService()