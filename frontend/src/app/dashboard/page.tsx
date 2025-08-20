"use client"

import IMSPage from "@/components/ims-page"
import { ChartArea } from "lucide-react"

export default function DashboardPage() {
  return (
    <IMSPage title="Dashboard" icon={ChartArea} rolesNeeded={["role_employee", "role_admin"]}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      </div>
    </IMSPage>
  )
}
