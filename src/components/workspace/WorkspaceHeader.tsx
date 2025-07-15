import { ActionIcon, Group, Popover, Stack, Text, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconDots } from '@tabler/icons-react'
import classes from './workspace.module.css'
import { useRoleStore } from '@/store/roleStore'

type WorkspaceHeaderProps = {
  pageTitle: string
}

function WorkspaceHeader({ pageTitle }: WorkspaceHeaderProps) {
  const is768 = useMediaQuery('(max-width: 768px)')

  const { isAdmin, isOwner, isUser } = useRoleStore()

  return (
    <Group justify="space-between">
      <Group align="center" gap="1rem">
        <Title className="Title">{pageTitle}</Title>
      </Group>

      {(isAdmin || isOwner) && (
        <Popover
          radius="md"
          styles={{ dropdown: { padding: '0.5rem' } }}
          position="bottom-end"
        >
          <Popover.Target>
            <ActionIcon
              size={is768 ? 'lg' : 'xl'}
              variant="subtle"
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
              >
                Delete
              </Text>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      )}
    </Group>
  )
}

export default WorkspaceHeader
