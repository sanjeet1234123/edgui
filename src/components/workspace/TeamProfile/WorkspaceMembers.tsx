import { Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import InviteWorkspaceMembers from '../InviteWorkspaceMembers'
import RenderMembers from './RenderMembers'
import classes from './teamProfile.module.css'
import { useRoleStore } from '@/store/roleStore'

function WorkspaceMembers() {
  const [opened, { open, close }] = useDisclosure(false)

  const { isUser } = useRoleStore()

  return (
    <>
      <Card withBorder radius="md" h="100%">
        <Stack h="100%">
          <Group justify="space-between">
            <Stack gap={4}>
              <Title order={3} className={classes.cardTitle}>
                Workspace Members
              </Title>
              <Text className={classes.cardDescription}>
                People with access to this workspace
              </Text>
            </Stack>

            <Button
              size="md"
              variant="outline"
              className={classes.outlineButton}
              onClick={open}
              disabled={isUser}
            >
              Invite
            </Button>
          </Group>

          <RenderMembers />
        </Stack>
      </Card>
      {opened && <InviteWorkspaceMembers opened={opened} close={close} />}
    </>
  )
}

export default WorkspaceMembers
