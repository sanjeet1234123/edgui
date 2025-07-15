import { Avatar, Group, Stack, Text } from '@mantine/core'

function UserInfo() {
  // Extract user info
  const name = localStorage.getItem('name') || 'N/A'
  const email = localStorage.getItem('email') || 'N/A'
  const workspaceId = localStorage.getItem('workspace_id') || 'N/A'

  return (
    <Group align="flex-start">
      <Avatar name={name} color="initials" size="lg" radius="xl" />
      <Stack gap={4}>
        <Text fz="var(--size-lg)" fw={500} c="var(--clr-black)">
          {name}
        </Text>
        <Text fz="var(--size-base)" fw={400} c="var(--clr-user-profile-email)">
          {email}
        </Text>
        <Text
          fz="var(--size-sm)"
          fw={400}
          c="var(--clr-user-profile-workspace)"
        >
          Workspace - {workspaceId}
        </Text>
      </Stack>
    </Group>
  )
}

export default UserInfo
