import {
  Card,
  Text,
  Stack,
  Group,
  Title,
  Select,
  ActionIcon,
  Tooltip,
  Badge,
  Pagination,
  Avatar,
  Center,
} from '@mantine/core'
import {
  IconFilter,
  IconChevronDown,
  IconRefresh,
  IconClock,
} from '@tabler/icons-react'
import classes from './project.module.css'

import { timeAgo } from '@/utils/commonFunction'
import { useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import { useGetProjectActivitiesQuery } from '@/hooks/queries/useProjectQueries'
import { useParams } from '@tanstack/react-router'

function Activity() {
  const [page, setPage] = useState(1)
  const itemsPerPage = 5
  const [filterValue, setFilterValue] = useState('all')

  const is500 = useMediaQuery('(max-width: 500px)')

  const { projectId } = useParams({ from: '/_app/project/$projectId' })

  //   Fetching Project Activities Data
  const { data, refetch } = useGetProjectActivitiesQuery(projectId)

  // Reset pagination when filter changes
  const handleFilterChange = (value: string) => {
    setFilterValue(value)
    setPage(1)
  }

  // Handle refresh button click
  const handleRefresh = () => {
    refetch()
  }

  const renderActivity = () => {
    // Apply filters before pagination
    let filteredData = data?.data || []

    if (filterValue !== 'all') {
      // Check if filter is status-based (pass, fail) or environment-based
      if (filterValue === 'pass' || filterValue === 'fail') {
        filteredData = filteredData.filter(
          (item: any) => item?.status === filterValue,
        )
      } else if (
        ['production', 'staging', 'development'].includes(filterValue)
      ) {
        filteredData = filteredData.filter(
          (item: any) => item?.environment?.toLowerCase() === filterValue,
        )
      }
    }

    if (filteredData.length === 0)
      return (
        <Center h="100%">
          <Text>No activity matches the selected filter</Text>
        </Center>
      )

    // Calculate pagination
    const totalItems = filteredData.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const paginatedData = filteredData.slice(startIndex, endIndex)

    // Only show pagination if there are more than 5 items
    const shouldShowPagination = totalItems > itemsPerPage
    const message = `Showing ${startIndex + 1} – ${endIndex} of ${totalItems}`

    return (
      <>
        <Stack>
          {paginatedData.map((activity: any) => (
            <Group
              key={activity.id}
              justify="space-between"
              className={classes.activity}
            >
              <Stack gap={4} h="100%">
                <Text classNames={{ root: classes.activityName }}>
                  {activity.activity_name || 'No activity name'}
                </Text>
                <Text classNames={{ root: classes.activityReason }}>
                  {activity.reason || 'No reason'}
                </Text>
                <Group>
                  <Group gap={6}>
                    <Avatar size="1.75rem" radius="xl" />
                    <Text>{activity.name || 'Unknown'}</Text>
                  </Group>
                  <Badge classNames={{ root: classes.activityBadge }}>
                    {activity.environment || 'No environment'}
                  </Badge>
                  <Badge
                    classNames={{
                      root:
                        activity.status === 'pass'
                          ? classes.activityBadgePass
                          : activity.status === 'fail'
                            ? classes.activityBadgeFail
                            : classes.activityBadgePending,
                    }}
                  >
                    {activity.status || 'No status'}
                  </Badge>
                </Group>
              </Stack>
              <Group gap="xs">
                <IconClock size={20} color="var(--mantine-color-gray-6)" />
                <Text fw={500} c="var(--mantine-color-gray-6)">
                  {timeAgo(activity.timestamp)}
                </Text>
              </Group>
            </Group>
          ))}
        </Stack>
        {shouldShowPagination && (
          <Group justify="flex-end" mt="md">
            <Text size="sm">{message}</Text>
            <Pagination
              size="lg"
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
    <>
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={2} fz="var(--size-2xl)" c="var(--clr-black)">
            Activity Log
          </Title>
          <Group
            justify={is500 ? 'space-between' : 'flex-end'}
            w={is500 ? '100%' : 'auto'}
          >
            <Select
              classNames={{ wrapper: classes.activityFilterSelect }}
              size="md"
              placeholder="Filter by"
              data={[
                {
                  label: 'All Activities',
                  value: 'all',
                },
                {
                  label: 'Pass',
                  value: 'pass',
                },
                {
                  label: 'Fail',
                  value: 'fail',
                },
                {
                  label: 'Production',
                  value: 'production',
                },
                {
                  label: 'Staging',
                  value: 'staging',
                },
                {
                  label: 'Development',
                  value: 'development',
                },
              ]}
              value={filterValue}
              onChange={(value: string | null) =>
                handleFilterChange(value || 'all')
              }
              allowDeselect={false}
              leftSection={<IconFilter size={20} />}
              rightSection={<IconChevronDown size={20} />}
              radius="md"
            />
            <Tooltip label="Refresh" position="top">
              <ActionIcon
                size="lg"
                color="var(--clr-primary)"
                onClick={handleRefresh}
              >
                <IconRefresh size={24} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <Card withBorder radius="md" p="md">
          <Stack h="100%">
            <Stack gap={0}>
              <Title fz="var(--size-2xl)" c="var(--clr-user-details-card-title)">
                Recent Activity
              </Title>
              <Text classNames={{ root: classes.activityDescription }}>
                Track all changes and actions in your project
              </Text>
            </Stack>
            {renderActivity()}
          </Stack>
        </Card>
      </Stack>
    </>
  )
}

export default Activity
