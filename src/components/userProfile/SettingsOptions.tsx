import { useNavigate } from '@tanstack/react-router'
import { Button, Stack } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCode, IconHelp, IconSettings, IconUser } from '@tabler/icons-react'
import { PATHS } from '@/constants/paths'
import { prefetchUserDetails } from '@/hooks/queries/useUserDetailsQueries'
import { useQueryClient } from '@tanstack/react-query'

const AgentSRELink = 'https://agentsre.prod.neuralcompany.team/'

function SettingsOptions({ close }: { close: () => void }) {
  const navigate = useNavigate()
  const is1110 = useMediaQuery('(max-width: 1110px)')
  const queryClient = useQueryClient()

  return (
    <Stack align="flex-start" gap="sm">
      <Button
        color="var(--clr-black)"
        size="compact-lg"
        fz="var(--size-lg)"
        variant="transparent"
        leftSection={<IconSettings size={24} />}
        onClick={() => {
          navigate({ to: PATHS.WORKSPACE }), close()
        }}
      >
        Workspace
      </Button>
      <Button
        color="var(--clr-black)"
        size="compact-lg"
        fz="var(--size-lg)"
        variant="transparent"
        leftSection={<IconUser size={24} />}
        onMouseEnter={() => {
          queryClient.prefetchQuery(prefetchUserDetails())
        }}
        onClick={() => {
          navigate({ to: PATHS.ACCOUNT_SETTINGS }), close()
        }}
      >
        Settings
      </Button>

      {is1110 && (
        <Button
          color="var(--clr-black)"
          size="compact-lg"
          fz="var(--size-lg)"
          variant="transparent"
          leftSection={<IconCode size={24} />}
          onClick={() => {
            window.open(AgentSRELink, '_blank'), close()
          }}
        >
          Agent SRE
        </Button>
      )}

      {is1110 && (
        <Button
          color="var(--clr-black)"
          size="compact-lg"
          fz="var(--size-lg)"
          variant="transparent"
          leftSection={<IconHelp size={24} />}
        >
          Help center
        </Button>
      )}
    </Stack>
  )
}

export default SettingsOptions
