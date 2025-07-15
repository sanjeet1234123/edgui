import { ActionIcon, Button, Group, Title, Tooltip } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
import AddProjectsModal from './AddProjectsModal'
import { useRoleStore } from '@/store/roleStore'

type ProjectHeaderProps = {
  pageTitle: string
}

function ProjectsHeader({ pageTitle }: ProjectHeaderProps) {
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  const { isUser } = useRoleStore()

  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Group align="center" justify="space-between">
        <Title className="Title">{pageTitle}</Title>

        {is768 ? (
          <Tooltip label="Create Project" position="top">
            <ActionIcon size="lg" onClick={open} disabled={isUser}>
              <IconPlus size={18} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Button
            size={is1024 ? 'md' : 'lg'}
            onClick={open}
            disabled={isUser}
            leftSection={<IconPlus size={20} />}
          >
            Create Project
          </Button>
        )}
      </Group>
      {opened && <AddProjectsModal opened={opened} close={close} />}
    </>
  )
}

export default ProjectsHeader
