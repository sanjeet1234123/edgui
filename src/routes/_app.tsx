import { useState } from 'react'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell, Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { motion } from 'motion/react'
import Header from '@/components/header/Header'
import Navbar from '@/components/navbar/Navbar'
import { FullPageError, FullPageLoader } from '@/components/ui'
import { ProtectedRoute } from '@/components/RouteProtection'

// Convert Mantine Navbar to a motion component
const MotionNavbar = motion.create(AppShell.Navbar)

export const Route = createFileRoute('/_app')({
  component: ProtectedRouteWrapper,
  pendingComponent: () => <FullPageLoader />,
  errorComponent: error => <FullPageError error={error} />,
})

function ProtectedRouteWrapper() {
  return (
    <ProtectedRoute>
      <RouteComponent />
    </ProtectedRoute>
  )
}

function RouteComponent() {
  const [collapsed, setCollapsed] = useState<boolean>(true)
  const [opened, { toggle }] = useDisclosure()
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: collapsed ? 80 : 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="xl"
      styles={{
        header: {
          backgroundColor: 'var(--clr-header-bg)',
        },
        navbar: {
          backgroundColor: 'var(--clr-navbar-bg)',
        },
        main: {
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.6s',
          backgroundColor: 'var(--clr-main-bg)',
        },
      }}
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md">
          <Header setCollapsed={setCollapsed} toggle={toggle} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        </Group>
      </AppShell.Header>

      {/* Motion-enabled Navbar with animation */}
      <MotionNavbar
        p="md"
        initial={false}
        animate={{ width: collapsed ? 80 : 300 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
          duration: 0.2,
          mass: 1,
        }}
        style={{
          minWidth: 80,
        }}
      >
        <Navbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          toggle={toggle}
        />
      </MotionNavbar>

      {/* Main content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
