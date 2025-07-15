import { notifications } from '@mantine/notifications'
import { Text } from '@mantine/core'
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react'

type NotificationType = 'success' | 'warning' | 'error'

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <IconCheck size={20} />
    case 'warning':
      return <IconAlertTriangle size={20} />
    case 'error':
      return <IconX size={20} />
    default:
      return null
  }
}

const mapTypeToColor: Record<NotificationType, string> = {
  success: 'var(--clr-notification-success)',
  warning: 'var(--clr-notification-warning)',
  error: 'var(--clr-notification-error)',
}

export const showNotification = (type: NotificationType, content: string) => {
  notifications.show({
    icon: getIcon(type),
    title: <Text tt="capitalize">{type}</Text>,
    message: content,
    color: mapTypeToColor[type],
  })
}
