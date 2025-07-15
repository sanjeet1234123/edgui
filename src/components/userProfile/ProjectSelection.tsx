import { ActionIcon, Group, Stack, Text } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import classes from './userProfile.module.css'
import type { Project } from '@/types/headerType'

type ProjectSelectionProps = {
  currentProject: Project | null
  showProjectsDropdown: boolean
  setShowProjectsDropdown: (show: boolean) => void
  setShowEnvDropdown: (show: boolean) => void
}

function ProjectSelection({
  currentProject,
  showProjectsDropdown,
  setShowProjectsDropdown,
  setShowEnvDropdown,
}: ProjectSelectionProps) {
  return (
    <Stack gap={0}>
      <Group justify="space-between">
        <Text classNames={{ root: classes.projectText }}>
          Project - {currentProject?.name || 'None'}
        </Text>
        <ActionIcon
          variant="light"
          radius="xl"
          color="var(--clr-black)"
          onClick={() => {
            setShowProjectsDropdown(!showProjectsDropdown)
            setShowEnvDropdown(false)
          }}
        >
          <IconChevronRight size={24} />
        </ActionIcon>
      </Group>
      <Text classNames={{ root: classes.projectValue }}>
        Project ID: {currentProject?.id || 'N/A'}
      </Text>
    </Stack>
  )
}

export default ProjectSelection
