import { AppShell, Group, Image, useMantineColorScheme } from '@mantine/core'
import classes from './containerWithTopBar.module.css'
import NexaStackLogo from '@/assets/logos/nexastack-logo.png'
import NexaStackLogoDark from '@/assets/logos/nexastack-dark-logo.png'

type ContainerWithTopBarProps = {
  children: React.ReactNode
}

function ContainerWithTopBar({ children }: ContainerWithTopBarProps) {
  const { colorScheme } = useMantineColorScheme()

  return (
    <AppShell
      header={{ height: 70 }}
      classNames={{
        root: classes.authContainer,
        main: classes.authContainerMain,
      }}
    >
      {/* Header */}
      <AppShell.Header
        bg={
          colorScheme === 'dark'
            ? 'var(--mantine-color-dark-9)'
            : 'var(--mantine-color-white)'
        }
      >
        <Group h="100%" px="xl">
          <Image
            w="180px"
            src={colorScheme === 'dark' ? NexaStackLogoDark : NexaStackLogo}
            alt="Nexastack Logo"
          />
        </Group>
      </AppShell.Header>

      {/* Main */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}

export default ContainerWithTopBar
