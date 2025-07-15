import { Group, Title } from '@mantine/core'

function MemberLoginHeader() {
  const title = `Login to ${sessionStorage.getItem('member_workspace')} workspace`

  return (
    <Group>
      <Title fz="var(--size-2xl)" c="var(--clr-black)">
        {title}
      </Title>
    </Group>
  )
}

export default MemberLoginHeader
