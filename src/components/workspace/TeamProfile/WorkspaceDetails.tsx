import {
  ActionIcon,
  Card,
  CopyButton,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import classes from './teamProfile.module.css'

function WorkspaceDetails() {
  const workspaceId = localStorage.getItem('workspace_id')

  return (
    <Card withBorder radius="md" h="100%">
      <Stack h="100%">
        {/* Workspace Details Title */}
        <Stack gap={4}>
          <Title order={3} className={classes.cardTitle}>
            Workspace Details
          </Title>
          <Text className={classes.cardDescription}>
            Basic information about your workspace
          </Text>
        </Stack>

        {/* Workspace Name */}
        <Stack gap={4}>
          <Text className={classes.cardLabel}>Name</Text>
          <Text className={classes.cardInput}>
            {workspaceId || 'No name provided'}
          </Text>
        </Stack>

        {/* Workspace URL */}
        <Group justify="space-between">
          <Stack gap={4}>
            <Text className={classes.cardLabel}>Workspace URL</Text>
            <Text className={classes.cardInput}>
              {workspaceId}.nexastack.neuralcompany.work
            </Text>
          </Stack>
          <CopyButton
            value={`${workspaceId}.nexastack.neuralcompany.work`}
            timeout={2000}
          >
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? 'Copied' : 'Copy'}
                withArrow
                position="right"
              >
                <ActionIcon
                  color={copied ? 'var(--clr-secondary)' : 'gray'}
                  variant="subtle"
                  onClick={copy}
                >
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Stack>
    </Card>
  )
}

export default WorkspaceDetails
