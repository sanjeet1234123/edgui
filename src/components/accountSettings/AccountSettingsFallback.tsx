import {
  Stack,
  Tabs,
  Skeleton,
  Group,
  Card,
  ScrollArea,
  Flex,
} from '@mantine/core'
import { IconSettings, IconUser, IconUsers } from '@tabler/icons-react'
import { useMediaQuery } from '@mantine/hooks'

function AccountSettingsFallback() {
  const is1024px = useMediaQuery('(max-width: 1024px)')

  return (
    <Stack>
      {/* UserProfileHeader Skeleton */}
      <Skeleton height={100}mb="md" />
      <Tabs
        variant="pills"
        orientation={is1024px ? 'horizontal' : 'vertical'}
        defaultValue="user-details"
      >
        <Tabs.List>
          <Tabs.Tab value="user-details" leftSection={<IconUser size={22} />}>
            User Details
          </Tabs.Tab>
          <Tabs.Tab value="workspace" leftSection={<IconSettings size={22} />}>
            Workspace
          </Tabs.Tab>
          <Tabs.Tab value="projects" leftSection={<IconUsers size={22} />}>
            My projects
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel
          value="user-details"
          ps={is1024px ? 0 : '2rem'}
          pt={is1024px ? '1rem' : 0}
        >
          <UserDetailsSkeleton />
        </Tabs.Panel>
        <Tabs.Panel
          value="workspace"
          ps={is1024px ? 0 : '2rem'}
          pt={is1024px ? '1rem' : 0}
        >
          <WorkspaceDetailsSkeleton />
        </Tabs.Panel>
        <Tabs.Panel
          value="projects"
          ps={is1024px ? 0 : '2rem'}
          pt={is1024px ? '1rem' : 0}
        >
          <ProjectDetailsSkeleton />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}

// User Details Skeleton Component
function UserDetailsSkeleton() {
  return (
    <Card withBorder radius="md" h="100%">
      <Stack h="100%">
        {/* User Details Title */}
        <Skeleton height={24} width={120} mb="md" />

        {/* User Details */}
        <Stack gap="sm">
          <Group gap={4}>
            <Skeleton height={18} width={60} />
            <Skeleton height={18} width={150} />
          </Group>

          <Group gap={4}>
            <Skeleton height={18} width={60} />
            <Skeleton height={18} width={200} />
          </Group>

          <Group gap={4}>
            <Skeleton height={18} width={60} />
            <Skeleton height={24} width={80} radius="xl" />
          </Group>
        </Stack>
      </Stack>
    </Card>
  )
}

// Workspace Details Skeleton Component
function WorkspaceDetailsSkeleton() {
  return (
    <Card withBorder radius="md" h="100%">
      <Stack h="100%">
        {/* Workspace Details Title */}
        <Stack gap={4}>
          <Skeleton height={24} width={180} />
          <Skeleton height={16} width={250} />
        </Stack>

        {/* Workspace Name */}
        <Stack gap={4}>
          <Skeleton height={16} width={60} />
          <Skeleton height={18} width="90%" />
        </Stack>

        {/* Workspace URL */}
        <Group justify="space-between">
          <Stack gap={4}>
            <Skeleton height={16} width={120} />
            <Skeleton height={18} width={220} />
          </Stack>
          <Skeleton height={24} width={24} radius="sm" />
        </Group>
      </Stack>
    </Card>
  )
}

// Project Details Skeleton Component
function ProjectDetailsSkeleton() {
  return (
    <Card withBorder radius="md" h="100%">
      <Stack h="100%">
        {/* Project Details Title */}
        <Stack gap={4}>
          <Skeleton height={24} width={100} />
          <Skeleton height={16} width={150} />
        </Stack>

        {/* Project List */}
        <ScrollArea h={150}>
          <Stack gap="sm">
            {[1, 2, 3].map(index => (
              <Flex key={index} gap={4} justify="space-between">
                <Group gap={8}>
                  <Skeleton height={30} width={30} radius="md" />
                  <Skeleton height={18} width={120} />
                </Group>
                <Skeleton height={24} width={100} radius="xl" />
              </Flex>
            ))}
          </Stack>
        </ScrollArea>
      </Stack>
    </Card>
  )
}

export default AccountSettingsFallback
