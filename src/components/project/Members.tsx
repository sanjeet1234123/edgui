import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import {
  IconChevronDown,
  IconDots,
  IconSearch,
  IconUsersPlus,
} from '@tabler/icons-react'
import classes from './project.module.css'
import { getRolePriority } from '@/utils/commonFunction'
import { useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useGetProjectMembersQuery } from '@/hooks/queries/useProjectQueries'
import { useRoleStore } from '@/store/roleStore'
import InviteProjectMembers from './InviteProjectMembers'

function Members() {
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  const { checkRoles } = useRoleStore()
  useEffect(() => {
    checkRoles()
  }, [])

  const { isAdmin, isOwner } = useRoleStore()

  const [opened, { open, close }] = useDisclosure(false)
  const { projectId } = useParams({ from: '/_app/project/$projectId' })

  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const itemsPerPage = 5 // Number of members to display per page

  const { data, isLoading } = useGetProjectMembersQuery(projectId)

  // Function to extract unique environments from a member's environment_access
  const getEnvironments = (member: any) => {
    if (!member.environment_access) return []

    return [
      ...new Set(
        member.environment_access.map(
          (access: any) =>
            // Capitalize first letter of environment name
            access.environment.charAt(0).toUpperCase() +
            access.environment.slice(1),
        ),
      ),
    ]
  }

  // Filter members based on search query and role filter
  const filteredMembers = data
    ? data.filter((member: any) => {
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
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const Row = ({ member }: { member: any }) => {
    const environments = getEnvironments(member)

    return (
      <Table.Tr key={member.id}>
        <Table.Td>
          <Group className={classes.memberData}>
            <Avatar />
            <Stack gap={0}>
              <Text className={classes.memberName}>{member.name}</Text>
              <Text classNames={{ root: classes.membersDescription }}>
                {member.email}
              </Text>
            </Stack>
          </Group>
        </Table.Td>
        <Table.Td style={{ minWidth: '120px' }}>
          <Badge
            size="lg"
            color="var(--mantine-color-black)"
            variant={member.role === 'owner' ? 'filled' : 'outline'}
            classNames={{
              root:
                member.role === 'owner'
                  ? classes.memberBadgeOwner
                  : member.role === 'admin'
                    ? classes.memberBadgeAdmin
                    : classes.memberBadge,
            }}
          >
            {member.role}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group>
            {environments.map((env, index) => (
              <Badge
                key={index}
                size="lg"
                color="var(--mantine-color-black)"
                variant="outline"
                classNames={{ root: classes.memberBadgeEnv }}
              >
                {env as string}
              </Badge>
            ))}
          </Group>
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
        <Group justify="space-between">
          <Title order={2} fz="var(--size-2xl)" c="var(--clr-black)">
            Project Members
          </Title>
          {is768 ? (
            <Tooltip label="Invite Member">
              <ActionIcon
                size="lg"
                onClick={open}
                disabled={isAdmin || isOwner}
              >
                <IconUsersPlus size={18} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Button
              size={is1024 ? 'md' : 'lg'}
              leftSection={<IconUsersPlus size={20} />}
              onClick={open}
              disabled={isAdmin || isOwner}
            >
              Invite Member
            </Button>
          )}
        </Group>

        <Card withBorder radius="md">
          <Stack>
            <Stack gap={0}>
              <Title fz="var(--size-2xl)" c="var(--clr-user-details-card-title)">
                Members
              </Title>
              <Text classNames={{ root: classes.membersDescription }}>
                Manage members and their access to this project
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
                onChange={(value: string | null) =>
                  handleRoleFilterChange(value || 'all')
                }
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
                    <Table.Th>Environment Access</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {!isLoading && paginatedMembers.length > 0 ? (
                    paginatedMembers.map((member) => (
                      <Row key={member.id} member={member} />
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={4} align="center">
                        {isLoading ? (
                          <Loader />
                        ) : (
                          <Text size="lg" fw={500}>
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
      {opened && <InviteProjectMembers opened={opened} close={close} />}
    </>
  )
}

export default Members
