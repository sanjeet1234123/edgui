import { useState } from 'react'
import {
  Avatar,
  Badge,
  Center,
  Group,
  Pagination,
  Stack,
  Text,
} from '@mantine/core'
import classes from './teamProfile.module.css'
import { useGetWorkspaceMembersQuery } from '@/hooks/queries/useWorkspaceQueries'
import { getRolePriority } from '@/utils/commonFunction'

const RenderMembers = () => {
  const [page, setPage] = useState(1)
  const itemsPerPage = 3

  const { data } = useGetWorkspaceMembersQuery()

  if (!data || !data.members || data.members.length === 0) {
    return (
      <Center h="100%">
        <Text c="var(--mantine-color-black)">No members found</Text>
      </Center>
    )
  }

  // Sort members by role priority: owner -> admin -> user
  const sortedMembers = [...data.members].sort(
    (a, b) => getRolePriority(a.role) - getRolePriority(b.role),
  )

  // Calculate pagination
  const totalItems = sortedMembers.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedData = sortedMembers.slice(startIndex, endIndex) || []

  // Only show pagination if there are more than items per page
  const shouldShowPagination = totalItems > itemsPerPage
  const message = `Showing ${itemsPerPage * (page - 1) + 1} – ${Math.min(
    totalItems,
    itemsPerPage * page,
  )} of ${totalItems}`

  return (
    <>
      <Stack gap="md" className="flex-grow">
        {paginatedData.map((member: any, i: any) => (
          <Group justify="space-between" key={i}>
            <Group gap="md">
              <Avatar />
              <Stack gap={0}>
                {member.name && (
                  <Text className={classes.memberName}>{member.name}</Text>
                )}
                {member.email && (
                  <Text className={classes.memberEmail}>{member.email}</Text>
                )}
              </Stack>
            </Group>
            <Badge
              size="lg"
              color="var(--mantine-color-black)"
              variant={
                member.role.toLowerCase() === 'owner' ? 'filled' : 'outline'
              }
              classNames={{
                root:
                  member.role.toLowerCase() === 'owner'
                    ? classes.badgeOwner
                    : member.role.toLowerCase() === 'admin'
                      ? classes.badgeAdmin
                      : classes.badge,
              }}
            >
              {member.role}
            </Badge>
          </Group>
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

export default RenderMembers
