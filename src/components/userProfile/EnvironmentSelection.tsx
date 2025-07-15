import { ActionIcon, Group, Stack, Text } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import classes from './userProfile.module.css'
import type { Environment } from '@/types/headerType'

type EnvironmentSelectionProps = {
  currentEnvironment: Environment
  showEnvDropdown: boolean
  setShowEnvDropdown: (show: boolean) => void
  setShowProjectsDropdown: (show: boolean) => void
}

function EnvironmentSelection({
  currentEnvironment,
  showEnvDropdown,
  setShowEnvDropdown,
  setShowProjectsDropdown,
}: EnvironmentSelectionProps) {
  return (
    <Stack gap={0}>
      <Group justify="space-between">
        <Text classNames={{ root: classes.projectText }}>
          Project Environment
        </Text>
        <ActionIcon
          variant="light"
          radius="xl"
          color="var(--clr-black)"
          onClick={() => {
            setShowEnvDropdown(!showEnvDropdown)
            setShowProjectsDropdown(false)
          }}
        >
          <IconChevronRight size={24} />
        </ActionIcon>
      </Group>
      <Text classNames={{ root: classes.projectValue }}>
        {currentEnvironment}
      </Text>
    </Stack>
  )
}

export default EnvironmentSelection
