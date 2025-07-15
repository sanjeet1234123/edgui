import { Group, Title } from '@mantine/core'

function MemberRegistrationHeader() {
  const title = `Register to ${sessionStorage.getItem('member_workspace')} workspace`

  return (
    <Group>
      <Title fz="var(--size-2xl)" c="var(--clr-black)">
        {title}
      </Title>
    </Group>
  )
}

export default MemberRegistrationHeader
