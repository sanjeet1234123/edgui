import { Card, Group, Text } from '@mantine/core'
import { forwardRef } from 'react'
import { IconCheck } from '@tabler/icons-react'
import type { Server } from '@/types/serversType'
import { McpIcons } from '@/assets/mcp-icons'
import { useSelectedServersStore } from '@/store/selectedServersStore'
import { useMantineColorScheme } from '@mantine/core'

interface ServerPlaygroundServerCardProps {
  server: Server
  lastElementRef?: (node: HTMLDivElement) => void
}

const ServerPlaygroundServerCard = forwardRef<
  HTMLDivElement,
  ServerPlaygroundServerCardProps
>(({ server, lastElementRef }, ref) => {
  const { isServerSelected, toggleServer } = useSelectedServersStore()
  const isSelected = isServerSelected(server.id)
  const { colorScheme } = useMantineColorScheme()

  const iconName =
    colorScheme === 'light' || isSelected
      ? server.name.toLowerCase()
      : `${server.name.split('-')[0].toLowerCase()}-dark`

  // First try direct match
  let iconKey: string | undefined = undefined
  if (Object.keys(McpIcons).includes(iconName)) {
    iconKey = iconName
  } else {
    // If no direct match, check if any icon name is included in the server name
    iconKey = Object.keys(McpIcons).find(key => iconName.includes(key))
  }

  // Use found icon or fallback to user
  const IconComponent = iconKey
    ? McpIcons[iconKey as keyof typeof McpIcons]
    : McpIcons.user

  return (
    <Card
      padding="md"
      ref={node => {
        // Apply both the forwarded ref and the lastElementRef if it exists
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
        if (lastElementRef && node) lastElementRef(node)
      }}
      onClick={() => toggleServer(server)}
      style={{
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--mantine-color-gray-1)' : undefined,
        transition: 'background-color 0.2s ease',
      }}
    >
      <Group justify="space-between">
        <Group>
          <IconComponent
            style={{ width: 28, height: 28, color: isSelected ? 'black' : '' }}
          />
          <Text style={{ color: isSelected ? 'black' : '' }}>
            {server.name}
          </Text>
        </Group>
        {isSelected && (
          <IconCheck size={20} stroke={1.5} color={isSelected ? 'black' : ''} />
        )}
      </Group>
    </Card>
  )
})

ServerPlaygroundServerCard.displayName = 'ServerPlaygroundServerCard'

export default ServerPlaygroundServerCard
