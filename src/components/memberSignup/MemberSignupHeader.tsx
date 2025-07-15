import { Group, Stack, Text, Title } from '@mantine/core'

interface MemberSignupHeaderProps {
  signupSuccess?: boolean
}

function MemberSignupHeader({ signupSuccess }: MemberSignupHeaderProps) {
  const title = `Signup to ${sessionStorage.getItem('member_workspace')} workspace`

  return (
    <Group>
      <Stack>
        <Title fz="var(--size-2xl)" c="var(--clr-black)">
          {title}
        </Title>
        {signupSuccess && (
          <Text c="var(--mantine-color-green-7)" fz="var(--size-sm)">
            Invitation sent successfully! Please check your email.
          </Text>
        )}
      </Stack>
    </Group>
  )
}

export default MemberSignupHeader
