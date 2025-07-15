import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { motion } from 'motion/react'
import {
  IconBuildingStore,
  // IconUser,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutDashboard,
  IconPlus,
  IconRocket,
  IconServer,
  IconSettings,
  IconUpload,
  IconUsers,
} from '@tabler/icons-react'
import AddNewModal from './AddNewModal'
import classes from './Navbar.module.css'
import { PATHS } from '@/constants/paths'

interface NavbarProps {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  toggle: () => void
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  sidebarOpen?: boolean
}

interface NavLinkItem {
  link: string
  label: string
  icon: React.FC<{ className?: string; stroke?: number }>
}

const MotionSpan = motion.create(motion.span)

const NavLinksData: Array<NavLinkItem> = [
  { link: PATHS.MARKETPLACE, label: 'Marketplace', icon: IconBuildingStore },
  { link: PATHS.SERVERS, label: 'MCP Marketplace', icon: IconServer },
  { link: PATHS.ADD_CLUSTER, label: 'Add Cluster', icon: IconUpload },
  { link: PATHS.PROJECTS, label: 'Projects', icon: IconUsers },
  { link: PATHS.CLUSTERS, label: 'Clusters', icon: IconLayoutDashboard },
  // { link: PATHS.ACCOUNTS, label: 'Accounts', icon: IconUser },
  { link: PATHS.DEPLOYMENTS, label: 'Deployments', icon: IconRocket },
]

const BottomNavLinksData: Array<NavLinkItem> = [
  { link: PATHS.WORKSPACE, label: 'Workspace', icon: IconSettings },
]

function Navbar({
  collapsed,
  setCollapsed,
  toggle,
  setSidebarOpen,
  sidebarOpen,
}: NavbarProps) {
  const location = useLocation()
  const [active, setActive] = useState('')
  const [opened, { open, close }] = useDisclosure(false)

  useEffect(() => {
    // Get the current pathname without leading slash
    const currentPath = location.pathname.startsWith('/')
      ? location.pathname.substring(1)
      : location.pathname

    // Find matching nav item
    const matchingNavItem = [...NavLinksData, ...BottomNavLinksData].find(
      item => {
        // Remove leading slash from item.link if it exists
        const itemPath = item.link.startsWith('/')
          ? item.link.substring(1)
          : item.link

        // Check if paths match exactly or if current path starts with item path
        return (
          currentPath === itemPath ||
          currentPath.startsWith(itemPath + '/') ||
          itemPath === currentPath.split('/')[0]
        )
      },
    )

    // Set the active item if found
    if (matchingNavItem) {
      setActive(matchingNavItem.label)
    } else {
      setActive('')
    }
  }, [location.pathname])

  const renderLinks = (items: Array<NavLinkItem>) =>
    items.map(item => (
      <Tooltip label={item.label} key={item.label}>
        <Link
          onClick={() => {
            toggle(), setSidebarOpen(!sidebarOpen)
          }}
          to={item.link}
          className={classes.link}
          data-active={item.label === active || undefined}
          viewTransition
        >
          <item.icon className={classes.linkIcon} stroke={1.5} />
          {!collapsed && (
            <MotionSpan
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden inline-block whitespace-nowrap"
            >
              {item.label}
            </MotionSpan>
          )}
        </Link>
      </Tooltip>
    ))

  return (
    <>
      <nav
        className={`${classes.navbar} ${collapsed ? classes.collapsed : ''}`}
      >
        <Tooltip label="Add new">
          <div className={classes.addNew} onClick={open}>
            <IconPlus stroke={1.5} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Add new</span>}
          </div>
        </Tooltip>

        <div className={classes.navbarMain}>{renderLinks(NavLinksData)}</div>
        <div className={classes.footer}>{renderLinks(BottomNavLinksData)}</div>

        <div
          className={classes.collapser}
          onClick={() => setCollapsed(prev => !prev)}
        >
          {collapsed ? (
            <IconChevronRight stroke={2} size={24} />
          ) : (
            <IconChevronLeft stroke={2} size={24} />
          )}
        </div>
      </nav>
      {opened && <AddNewModal opened={opened} onClose={close} toggle={toggle} setSidebarOpen={setSidebarOpen}/>}
    </>
  )
}

export default Navbar
