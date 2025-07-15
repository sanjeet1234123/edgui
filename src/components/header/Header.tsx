import { Link } from '@tanstack/react-router'
import {
  ActionIcon,
  Button,
  Group,
  ThemeIcon,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconCode,
  IconCube,
  IconMenu2,
  IconMoon,
  IconSun,
  IconX,
} from '@tabler/icons-react'
import { useEffect } from 'react'
import ProjectPopover from './ProjectPopover'
import classes from './Header.module.css'
import NexaStackLogo from '@/assets/logos/nexastack-logo.png'
import NexaStackDarkLogo from '@/assets/logos/nexastack-dark-logo.png'
import NexaStackIcon from '@/assets/images/nexastack-logo.svg'
import { NotificationDrawer } from '../notificationDrawer/index'

const AgentSRELink = 'https://agentsre.prod.neuralcompany.team/'

interface HeaderProps {
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  toggle: () => void
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  sidebarOpen: boolean
}

function Header({
  setCollapsed,
  toggle,
  setSidebarOpen,
  sidebarOpen,
}: HeaderProps) {
  const is1140px = useMediaQuery('(min-width: 1140px)')
  const is768px = useMediaQuery('(max-width: 768px)')

  const { colorScheme, setColorScheme } = useMantineColorScheme()

  useEffect(() => {
    if (colorScheme === 'dark') {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [colorScheme])

  return (
    <Group justify="space-between" h="100%" align="center" w="100%">
      {/* Nexastack Logo */}
      <Link to="/">
        {is768px ? (
          <img width={30} src={NexaStackIcon} alt="Nexastack Icon" />
        ) : (
          <img
            src={colorScheme === 'light' ? NexaStackLogo : NexaStackDarkLogo}
            className={classes.logo}
            alt="Nexastack Logo"
          />
        )}
      </Link>

      <Group gap="xl" h="100%" align="center" pr="lg">
        {/* Agent SRE*/}
        {is1140px && (
          <Button
            size="compact-md"
            variant="transparent"
            leftSection={<IconCode stroke={1.5} />}
            color="var(--clr-link)"
            onClick={() => {
              window.open(AgentSRELink, '_blank')
            }}
            className={classes.agentSRE}
          >
            Agent SRE
          </Button>
        )}

        {/* Help center */}
        {is1140px && (
          <Button
            size="compact-md"
            variant="transparent"
            leftSection={<IconCube stroke={1.5} />}
            color="var(--clr-link)"
            disabled={true}
          >
            Help center
          </Button>
        )}

        {/* Project-Environment toggle & Logout */}
        <ProjectPopover />

        <Group gap="sm">
          {/* Color scheme toggle */}
          <Tooltip
            label={colorScheme === 'light' ? 'Dark mode' : 'Light mode'}
            position="bottom"
          >
            <ThemeIcon
              variant="default"
              style={{
                cursor: 'pointer',
              }}
              onClick={() =>
                setColorScheme(colorScheme === 'light' ? 'dark' : 'light')
              }
            >
              {colorScheme === 'light' ? (
                <IconMoon stroke={1.5} />
              ) : (
                <IconSun stroke={1.5} />
              )}
            </ThemeIcon>
          </Tooltip>
          <NotificationDrawer />
          <div className="md:hidden">
            <ActionIcon
              variant="default"
              size="lg"
              onClick={() => {
                toggle(), setCollapsed(false), setSidebarOpen(!sidebarOpen)
              }}
            >
              {sidebarOpen ? (
                <IconMenu2 stroke={1.5} />
              ) : (
                <IconX stroke={1.5} />
              )}
            </ActionIcon>
          </div>
        </Group>
      </Group>
    </Group>
  )
}

export default Header
