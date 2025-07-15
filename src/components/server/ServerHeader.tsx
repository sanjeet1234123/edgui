import { useNavigate } from '@tanstack/react-router'
import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconArrowUpRight, IconBrandGithub } from '@tabler/icons-react'
import classes from './server.module.css'
import type { Server } from '@/types/serversType'
import { McpIcons } from '@/assets/mcp-icons'
import { formatServerDate } from '@/utils/commonFunction'
import { PATHS } from '@/constants/paths'
import { useMantineColorScheme } from '@mantine/core'

type ServerHeaderProps = {
  server: Server
}

function ServerHeader({ server }: ServerHeaderProps) {
  const { colorScheme } = useMantineColorScheme()
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  const navigate = useNavigate()

  const serverName = server?.name
  const serverDescription = server?.description
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

  // Use found icon or fallback to user
  const IconComponent = iconKey
    ? McpIcons[iconKey as keyof typeof McpIcons]
    : McpIcons.user

  const handleTryInPlayground = () => {
    navigate({
      to: PATHS.PLAYGROUND,
      search: { server: serverName },
    })
  }

  return (
    <Group justify="space-between" align="flex-start">
      <Stack style={{ maxWidth: is1024 ? '60%' : '100%' }}>
        <Group>
          <IconComponent style={{ width: 42, height: 42 }} />
          <Title className="Title">{serverName}</Title>
        </Group>

        <Text className={classes.Description}>{serverDescription}</Text>

        <Group>
          <Text className={classes.Created}>
            Created {formatServerDate(server?.last_updated || '')}
          </Text>

          <Tooltip label="Go to repository">
            <ActionIcon
              variant="transparent"
              size="sm"
              color="var(--clr-server-details-github-link)"
              onClick={() => {
                window.open(server?.characteristics.repository, '_blank')
              }}
            >
              <IconBrandGithub size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>

      {is768 ? (
        <Tooltip label="Try in Playground">
          <ActionIcon size="lg" onClick={handleTryInPlayground}>
            <IconArrowUpRight size={20} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Button
          size={is1024 ? 'md' : 'lg'}
          rightSection={<IconArrowUpRight size={20} />}
          onClick={handleTryInPlayground}
        >
          Try in Playground
        </Button>
      )}
    </Group>
  )
}

export default ServerHeader
