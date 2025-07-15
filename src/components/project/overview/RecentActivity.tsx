import { useState } from 'react'
import {
  Card,
  Pagination,
  Group,
  Stack,
  Text,
  Title,
  Center,
} from '@mantine/core'
import classes from './Overview.module.css'
import { useGetProjectActivitiesQuery } from '@/hooks/queries/useProjectQueries'
import { useParams } from '@tanstack/react-router'
import type { projectActivity } from '@/types/projectType'

function RecentActivity() {
  const { projectId } = useParams({ from: '/_app/project/$projectId' })
  const { data } = useGetProjectActivitiesQuery(projectId)

  const [page, setPage] = useState(1)
  const itemsPerPage = 3

  const renderActivity = () => {
    if (data?.data?.length === 0)
      return (
        <Center h="100%">
          <Text>No recent activity</Text>
        </Center>
      )

    // Calculate pagination
    const totalItems = data?.data?.length || 0
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const paginatedData = data?.data?.slice(startIndex, endIndex) || []

    // Only show pagination if there are more than 3 items
    const shouldShowPagination = totalItems > 3
    const message = `Showing ${itemsPerPage * (page - 1) + 1} – ${Math.min(
      totalItems,
      itemsPerPage * page,
    )} of ${totalItems}`

    return (
      <>
        <Stack style={{ flexGrow: 1 }}>
          {paginatedData.map((activity: projectActivity, i: number) => (
            <Stack gap={0} key={i} className={classes.activity}>
              <Text className={classes.activityItem}>
                {activity.activity_name || 'No activity name'}
              </Text>
              <Text className={classes.activityDescription}>
                {activity.reason || 'No reason'}
              </Text>
              <Text className={classes.activityTime}>
                created by {activity.name || 'Unknown'}
              </Text>
            </Stack>
          ))}
        </Stack>

        {shouldShowPagination && (
          <Group justify="flex-end">
            <Text size="sm">{message}</Text>
            <Pagination
              size="sm"
              color="var(--clr-secondary)"
              total={totalPages}
              value={page}
              onChange={setPage}
              withPages={false}
            />
          </Group>
        )}
      </>
    )
  }

  return (
    <Card withBorder radius="md" h="100%">
      <Stack h="100%">
        <Stack gap={4}>
          <Title order={3} classNames={{ root: classes.cardTitle }}>
            Recent Activity
          </Title>
          <Text classNames={{ root: classes.cardDescription }}>
            Latest actions in this project
          </Text>
        </Stack>
        {renderActivity()}
      </Stack>
    </Card>
  )
}

export default RecentActivity
