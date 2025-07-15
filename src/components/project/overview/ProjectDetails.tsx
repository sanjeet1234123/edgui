import { Card, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core'
import classes from './Overview.module.css'
import { IconClock } from '@tabler/icons-react'
import { formatProjectDate } from '@/utils/commonFunction'
import { useParams } from '@tanstack/react-router'
import { useGetProjectQuery } from '@/hooks/queries/useProjectQueries'

function ProjectDetails() {
  const { projectId } = useParams({ from: '/_app/project/$projectId' })

  const { data, isLoading } = useGetProjectQuery(projectId)

  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
      <Card withBorder radius="md" h="100%">
        <Stack>
          <Stack gap={4}>
            <Title order={3} className={classes.cardTitle}>
              Project Details
            </Title>
            <Text className={classes.cardDescription}>
              Basic information about your project
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text className={classes.cardLabel}>Name</Text>
            <Text className={classes.cardInput}>
              {data?.project?.name || 'No name provided'}
            </Text>
          </Stack>
          <Stack gap={4}>
            <Text className={classes.cardLabel}>Description</Text>
            <Text className={classes.cardInput}>
              {data?.project?.description || 'No description provided'}
            </Text>
          </Stack>
          <Group gap={8}>
            <IconClock
              className={classes.cardLabel}
              size={18}
              color="#737478"
            />
            <Text className={classes.cardLabel}>
              {formatProjectDate(data?.project?.created_at)}
            </Text>
          </Group>
        </Stack>
      </Card>
    </>
  )
}

export default ProjectDetails
