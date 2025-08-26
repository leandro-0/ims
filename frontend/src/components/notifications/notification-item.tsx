import { getDateWithCorrectTz } from "@/lib/utils"
import { LowStockNotification } from "@/services/notification-service"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale/es"

interface NotificationItemProps {
  notification: LowStockNotification
  isLast?: boolean
  lastNotificationElementRef?: (node: HTMLDivElement) => void
}

export default function NotificationItem(props: NotificationItemProps) {
  return (
    <div
      key={`${props.notification.product.productId}-${props.notification.date}`}
      ref={props.isLast ? props.lastNotificationElementRef : null}
      className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {props.notification.product.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            El stock lleg&oacute; a <span className="font-semibold">{props.notification.currentStock}</span>, siendo <span className="font-semibold">{props.notification.minimumStock}</span> el m&iacute;nimo.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(getDateWithCorrectTz(props.notification.date), { addSuffix: true, locale: es })}
          </p>
        </div>
      </div>
    </div>
  )
}