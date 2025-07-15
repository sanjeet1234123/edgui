import { useNavigate } from '@tanstack/react-router'
import { ActionIcon, Group, Popover, Stack, Text, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChevronLeft, IconDots } from '@tabler/icons-react'
import classes from './project.module.css'
import { PATHS } from '@/constants/paths'
import { useRoleStore } from '@/store/roleStore'
import { useDeleteProjectMutation } from '@/hooks/mutations/useProjectMutations'

type ProjectHeaderProps = {
  title: string
  projectId: string
}

function ProjectHeader({ title, projectId }: ProjectHeaderProps) {
  const is768 = useMediaQuery('(max-width: 768px)')
  const navigate = useNavigate()

  const { isUser } = useRoleStore()

  const { mutate: deleteProject } = useDeleteProjectMutation()

  const handleDeleteProject = () => {
    deleteProject(projectId, {
      onSuccess: () => {
        navigate({ to: PATHS.PROJECTS })
      },
    })
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Group align="center" gap="1rem">
          <IconChevronLeft
            onClick={() => navigate({ to: PATHS.PROJECTS })}
            size={24}
          />
          <Title order={2} fz="var(--size-2xl)" c="var(--clr-black)">
            {title}
          </Title>
        </Group>
        <Popover radius="md" styles={{ dropdown: { padding: '0.5rem' } }}>
          <Popover.Target>
            <ActionIcon
              size={is768 ? 'lg' : 'xl'}
              variant="white"
              color="var(--mantine-color-black)"
              classNames={{ root: classes.actionIcon }}
              disabled={isUser}
            >
              <IconDots size={is768 ? 18 : 24} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack justify="flex-start" gap="0">
              <Text
                c="var(--mantine-color-red-6)"
                classNames={{ root: classes.popoverText }}
                onClick={handleDeleteProject}
              >
                Delete
              </Text>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Stack>
  )
}

export default ProjectHeader
