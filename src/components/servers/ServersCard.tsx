import { useNavigate } from '@tanstack/react-router'
import { Card, Group, Stack, Text } from '@mantine/core'
import { IconClock } from '@tabler/icons-react'
import type { Server } from '@/types/serversType'
import { formatProjectDate } from '@/utils/commonFunction'
import { McpIcons } from '@/assets/mcp-icons'
import { PATHS } from '@/constants/paths'
import classes from './servers.module.css'
import { useMantineColorScheme } from '@mantine/core'

type ServersCardProps = {
  server: Server
}

function ServersCard({ server }: ServersCardProps) {
  const { colorScheme } = useMantineColorScheme()
  const navigate = useNavigate()
  const iconName =
    colorScheme === 'light'
      ? server.name.toLowerCase()
      : `${server.name.split("-")[0].toLowerCase()}-dark`

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

  const handleClick = () => {
    navigate({
      to: PATHS.SERVERS_DETAIL,
      params: { serverId: server.name.toLowerCase() }, // Send server name as serverId
    })
  }

  return (
    <Card h="100%" onClick={handleClick} className={classes.card}>
      <Stack justify="space-between" className="flex-grow" gap="lg">
        <Stack>
          <Group>
            <IconComponent style={{ width: 32, height: 32 }} />
            <Text
              fw={600}
              fz="var(--size-lg)"
              tt="capitalize"
              c="var(--clr-servers-card-title)"
            >
              {server.name}
            </Text>
          </Group>
          <Text
            fw={400}
            fz="var(--size-sm)"
            c="var(--clr-servers-card-description)"
            lineClamp={2}
          >
            {server.description}
          </Text>
        </Stack>
        <Group gap="xs">
          <IconClock size={16} color="var(--mantine-color-gray-6)" />
          <Text fw={400} fz="var(--size-sm)" c="var(--mantine-color-gray-6)">
            {formatProjectDate(server.last_updated)}
          </Text>
        </Group>
      </Stack>
    </Card>
  )
}

export default ServersCard
