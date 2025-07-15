import { useState } from 'react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import {
  Card,
  Group,
  Stack,
  Text,
  Title,
  Table,
  TextInput,
  Select,
  Button,
  Loader,
  Pagination,
  Center,
  Avatar,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import {
  IconChevronDown,
  IconDots,
  IconSearch,
  IconUsersPlus,
} from '@tabler/icons-react'
import { useRoleStore } from '@/store/roleStore'
import classes from './workspace.module.css'
import InviteWorkspaceMembers from './InviteWorkspaceMembers'
import { getRolePriority, timeAgo } from '@/utils/commonFunction'
import { useGetWorkspaceMembersQuery } from '@/hooks/queries/useWorkspaceQueries'

function Members() {
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  const { isUser } = useRoleStore()
  const [opened, { open, close }] = useDisclosure(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const itemsPerPage = 5 // Number of members to display per page

  const { data, isLoading } = useGetWorkspaceMembersQuery()

  // Filter members based on search query and role filter
  const filteredMembers =
    data && data?.members
      ? data.members.filter((member: any) => {
          const matchesSearch =
            searchQuery === '' ||
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())

          const matchesRole =
            roleFilter === 'all' ||
            member.role.toLowerCase() === roleFilter.toLowerCase()

          return matchesSearch && matchesRole
        })
      : []

  // Sort members by role priority: owner -> admin -> user
  const sortedMembers = [...filteredMembers].sort(
    (a, b) => getRolePriority(a.role) - getRolePriority(b.role),
  )

  // Calculate pagination
  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage)
  const paginatedMembers = sortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle search input change
  const handleSearchChange = (event: any) => {
    setSearchQuery(event.currentTarget.value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  // Handle role filter change
  const handleRoleFilterChange = (value: any) => {
    setRoleFilter(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const Row = ({ member }: any) => {
    return (
      <Table.Tr key={member.id}>
        <Table.Td>
          <Group className={classes.memberData}>
            <Avatar />
            <Stack gap={0}>
              {member.name && (
                <Text className={classes.memberName}>{member.name}</Text>
              )}
              {member.email && (
                <Text className={classes.memberDescription}>
                  {member.email}
                </Text>
              )}
            </Stack>
          </Group>
        </Table.Td>
        <Table.Td style={{ minWidth: '120px' }}>
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
        </Table.Td>
        <Table.Td style={{ minWidth: '240px' }}>
          {timeAgo(member.joined)}
        </Table.Td>
        <Table.Td>
          <ActionIcon
            variant="transparent"
            size="lg"
            color="var(--mantine-color-black)"
            disabled={true}
          >
            <IconDots size={24} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    )
  }

  return (
    <>
      <Stack gap="xl">
        <Group justify="space-between" align='center'>
          <Title order={2} fz="var(--size-2xl)">
            Workspace Members
          </Title>
          {is768 ? (
            <Tooltip label="Invite Member">
              <ActionIcon size="lg" onClick={open} disabled={isUser}>
                <IconUsersPlus size={18} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Button
              size={is1024 ? 'md' : 'lg'}
              leftSection={<IconUsersPlus size={20} />}
              onClick={open}
              disabled={isUser}
            >
              Invite Member
            </Button>
          )}
        </Group>

        <Card withBorder radius="md">
          <Stack>
            <Stack gap={0}>
              <Title fz="var(--size-2xl)" c="var(--clr-workspace-card-title)">
                Members
              </Title>
              <Text classNames={{ root: classes.membersDescription }}>
                Manage members and their access to this workspace
              </Text>
            </Stack>
            <Group align="center" justify="space-between">
              <TextInput
                radius="md"
                leftSection={<IconSearch size={24} />}
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                styles={{ root: { flex: 1 } }}
              />
              <Select
                w={{ base: '100%', xs: is768 ? '160px' : 'auto' }}
                radius="md"
                data={[
                  { label: 'All Roles', value: 'all' },
                  { label: 'Owner', value: 'owner' },
                  { label: 'Admin', value: 'admin' },
                  { label: 'User', value: 'user' },
                ]}
                value={roleFilter}
                onChange={handleRoleFilterChange}
                allowDeselect={false}
                rightSection={<IconChevronDown size={20} />}
              />
            </Group>
            <div className="overflow-x-auto">
              <Table
                highlightOnHover
                withTableBorder
                horizontalSpacing="lg"
                classNames={classes}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Member</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Joined At</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {!isLoading && paginatedMembers.length > 0 ? (
                    paginatedMembers.map((member: any) => (
                      <Row key={member.id} member={member} />
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={4} align="center">
                        {isLoading ? (
                          <Loader />
                        ) : (
                          <Text fw={500} p="xs">
                            No members found
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Center mt="md">
                <Pagination
                  total={totalPages}
                  value={currentPage}
                  onChange={handlePageChange}
                  size="md"
                  radius="md"
                  color="var(--clr-secondary)"
                />
              </Center>
            )}
          </Stack>
        </Card>
      </Stack>
      {opened && <InviteWorkspaceMembers opened={opened} close={close} />}
    </>
  )
}

export default Members
