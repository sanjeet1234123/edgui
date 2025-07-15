import { Button, Group } from '@mantine/core'
import { IconLogout } from '@tabler/icons-react'
import { useLogoutMutation } from '@/hooks/mutations/useAuthMutations'

function Logout() {
  const { mutate: logoutMutation } = useLogoutMutation()

  const handleLogout = () => {
    logoutMutation()
  }

  return (
    <Group align="center">
      <Button
        color="var(--clr-black)"
        size="compact-lg"
        fz="var(--size-lg)"
        variant="transparent"
        rightSection={<IconLogout size={24} />}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Group>
  )
}

export default Logout
