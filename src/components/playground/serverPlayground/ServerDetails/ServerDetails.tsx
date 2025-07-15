import { ActionIcon, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { IconBrandGithub } from '@tabler/icons-react'
import classes from './serverDetails.module.css'
import type { Server } from '@/types/serversType'
import { McpIcons } from '@/assets/mcp-icons'
import { formatServerDate } from '@/utils/commonFunction'
import { useSelectedServersStore } from '@/store/selectedServersStore'
import { useMantineColorScheme } from '@mantine/core'

type ServerDetailsProps = {
  server: Server
}

function ServerDetails({ server }: ServerDetailsProps) {
  const { colorScheme } = useMantineColorScheme()
  const { selectedServers } = useSelectedServersStore()
  const serverName = server.name
  const serverDescription = server.description

  const iconName =
    colorScheme === 'light'
      ? server.name.toLowerCase()
      : `${server.name.split('-')[0].toLowerCase()}-dark`

  // First try direct match
  let iconKey: string | undefined = undefined
  if (iconName && Object.keys(McpIcons).includes(iconName)) {
    iconKey = iconName
  } else if (iconName) {
    // If no direct match, check if any icon name is included in the server name
    iconKey = Object.keys(McpIcons).find(key => iconName.includes(key))
  }

  const IconComponent = iconKey
    ? McpIcons[iconKey as keyof typeof McpIcons]
    : McpIcons.user

  return (
    <Stack>
      <Group>
        <IconComponent style={{ width: 32, height: 32 }} />
        <Title className={classes.Title}>{serverName}</Title>
      </Group>

      <Text lineClamp={2} className={classes.Description}>
        {serverDescription}
      </Text>

      <Group>
        <Text className={classes.Created}>
          Created {formatServerDate(selectedServers[0].last_updated || '')}
        </Text>

        <Tooltip label="Go to repository">
          <ActionIcon
            variant="transparent"
            size="sm"
            onClick={() => {
              window.open(
                selectedServers[0].characteristics.repository,
                '_blank',
              )
            }}
          >
            <IconBrandGithub size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Stack>
  )
}

export default ServerDetails
