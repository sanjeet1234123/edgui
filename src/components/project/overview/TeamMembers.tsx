import {
  Card,
  Stack,
  Title,
  Text,
  Group,
  Button,
  Badge,
  Avatar,
  Center,
  Pagination,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { useState } from 'react'

import classes from './Overview.module.css'
import { useRoleStore } from '@/store/roleStore'
import { useGetProjectMembersQuery } from '@/hooks/queries/useProjectQueries'
import { getRolePriority } from '@/utils/commonFunction'
import { useParams } from '@tanstack/react-router'
import InviteProjectMembers from '../InviteProjectMembers'

function TeamMembers() {
  const { projectId } = useParams({ from: '/_app/project/$projectId' })

  const [page, setPage] = useState(1)
  const itemsPerPage = 3

  const { isUser } = useRoleStore()

  const [opened, { open, close }] = useDisclosure(false)

  const { data } = useGetProjectMembersQuery(projectId)

  const renderContent = () => {
    if (!data || data.length === 0) {
      return (
        <Center h="100%">
          <Text>No members found</Text>
        </Center>
      )
    }

    // Sort members by role priority: owner -> admin -> user
    const sortedMembers = [...data].sort(
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
        <Stack style={{ flexGrow: 1 }}>
          {paginatedData.map((member, i) => (
            <Group justify="space-between" key={i}>
              <Group gap="md">
                <Avatar />
                <Stack gap={0}>
                  <Text className={classes.memberName}>
                    {member?.name || 'No name'}
                  </Text>
                  <Text className={classes.memberEmail}>
                    {member?.email || 'No email'}
                  </Text>
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

  return (
    <>
      <Card withBorder radius="md" h="100%">
        <Stack h="100%">
          <Group justify="space-between">
            <Stack gap={4}>
              <Title order={3} classNames={{ root: classes.cardTitle }}>
                Team Members
              </Title>
              <Text classNames={{ root: classes.cardDescription }}>
                People with access to this project
              </Text>
            </Stack>
            <Button
              size="md"
              classNames={{ root: classes.outlineButton }}
              onClick={open}
              disabled={isUser}
            >
              Invite
            </Button>
          </Group>
          {renderContent()}
        </Stack>
      </Card>
      {opened && <InviteProjectMembers opened={opened} close={close} />}
    </>
  )
}

export default TeamMembers
