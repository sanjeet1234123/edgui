import { Title, Group } from '@mantine/core'

export default function AccountSettingsHeader({
  pageTitle,
}: {
  pageTitle: string
}) {
  return (
    <Group justify="space-between">
      <Group align="center" gap="1rem">
        <Title className="Title">{pageTitle}</Title>
      </Group>
    </Group>
  )
}
