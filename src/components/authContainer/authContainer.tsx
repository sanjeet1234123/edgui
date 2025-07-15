import {
  AppShell,
  Group,
  Image,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core'
import classes from './authContainer.module.css'
import AuthenticationImage from '@/assets/images/authentication-image.png'
import NexaStackLogo from '@/assets/logos/nexastack-logo.png'
import NexaStackLogoDark from '@/assets/logos/nexastack-dark-logo.png'

function AuthContainer({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useMantineColorScheme()

  return (
    <AppShell
      classNames={{
        root: classes.authContainer,
        main: classes.authContainerMain,
      }}
    >
      <AppShell.Main>
        <div className={classes.authContainerLeft}>
          <Image
            src={AuthenticationImage}
            alt="logo"
            className={classes.authContainerLogo}
          />
          <Stack justify="center" align="center" w="80%">
            <Title ta="center" c="var(--mantine-color-white)" fw={500}>
              Built for Security and Privacy Private Cloud Compute
            </Title>
            <Text
              ta="center"
              w="90%"
              c="var(--mantine-color-white)"
              fw={400}
              fz="var(--size-sm)"
            >
              Unified Inference Platform for any model, on any cloud. Built for
              Security and Privacy, Private Cloud Compute
            </Text>
          </Stack>
        </div>
        <div className={classes.authContainerRight}>
          <Group>
            <Image
              src={colorScheme === 'dark' ? NexaStackLogoDark : NexaStackLogo}
              className={classes.nexastackLogo}
              alt="Nexastack Logo"
            />
          </Group>
          <Stack justify="center" align="center" h="100%">
            {children}
          </Stack>
        </div>
      </AppShell.Main>
    </AppShell>
  )
}

export default AuthContainer
