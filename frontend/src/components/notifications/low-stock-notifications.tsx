"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { LowStockNotification, notificationService } from "@/services/notification-service"
import NotificationItem from "./notification-item"
import { useSubscription } from 'react-stomp-hooks'

interface LowStockNotificationsProps {
  className?: string
}

interface NotificationBellIndicatorProps {
  showIndicator: boolean
  setShowIndicator: (show: boolean) => void
}

function NotificationBellIndicator(props: NotificationBellIndicatorProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useSubscription("/topic/low-stock", (_) => {
    props.setShowIndicator(true)
  })

  return (
    !props.showIndicator ? null
      : (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg">
          <div className="absolute inset-0 bg-red-400 rounded-full animate-ping"></div>
          <div className="relative w-full h-full bg-red-500 rounded-full"></div>
        </div>
      )
  )
}

export function LowStockNotifications({ className }: LowStockNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<LowStockNotification[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [mounted, setMounted] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadNotifications = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const newNotifications = await notificationService.getNotifications({ page: pageNum })
      setPage(newNotifications.pageable.pageNumber)
      setNotifications(prev => [...prev, ...newNotifications.content])
      if (newNotifications.last) {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      loadNotifications(0)
    }
  }, [isOpen, notifications.length, loadNotifications])

  const lastNotificationElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadNotifications(page + 1)
      }
    })

    if (node) observer.current.observe(node)
  }, [loading, hasMore, page, loadNotifications])

  const onOpenChange = (open: boolean) => {
    setShowIndicator(false)
    setIsOpen(open)
    if (!open) {
      setNotifications([])
      setPage(0)
      setHasMore(true)
    }
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={cn(
        "relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100",
        className
      )}
        disabled
      >
        <Bell className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm"
          className={cn(
            "relative p-2 text-gray-900 hover:text-gray-500 hover:bg-gray-100",
            className
          )}
        >
          <Bell className="h-6 w-6" />
          <NotificationBellIndicator showIndicator={showIndicator} setShowIndicator={setShowIndicator} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 max-h-96 overflow-hidden"
        sideOffset={4}
      >
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">
            Notificaciones de stock bajo
          </h3>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && !loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No hay notificaciones
            </div>
          ) : (
            <>
              {notifications.map((notification, index) =>
                <NotificationItem
                  key={notification.product.productId + notification.date}
                  notification={notification}
                  isLast={index === notifications.length - 1}
                  lastNotificationElementRef={index === notifications.length - 1 ? lastNotificationElementRef : undefined}
                />
              )}

              {loading && (
                <div className="p-4 text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span className="text-sm text-gray-500">Cargando...</span>
                  </div>
                </div>
              )}

              {!hasMore && notifications.length > 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No hay más notificaciones
                </div>
              )}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
