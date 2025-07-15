import { Group, Text } from '@mantine/core'

type ServersHeaderProps = {
  pageTitle: string
}

function ServersHeader({ pageTitle }: ServersHeaderProps) {
  return (
    <Group>
      <Text className="Title">{pageTitle}</Text>
    </Group>
  )
}

export default ServersHeader
