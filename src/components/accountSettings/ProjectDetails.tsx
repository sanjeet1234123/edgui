import {
  Card,
  Stack,
  Text,
  Title,
  Table,
  Loader,
  Pagination,
  Center,
  Group,
  ThemeIcon,
} from '@mantine/core'
import classes from './accountSettings.module.css'
import { useState } from 'react'
import { formatProjectDate } from '@/utils/commonFunction'
import type { Project, ProjectResponse } from '@/types/projectsType'
import { IconClock, IconStack } from '@tabler/icons-react'

type ProjectDetailsProps = {
  data: ProjectResponse
  isLoading: boolean
}

export default function ProjectDetails({
  data,
  isLoading,
}: ProjectDetailsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // Number of projects to display per page

  // Calculate pagination
  const totalPages = Math.ceil(data?.project.length / itemsPerPage)
  const paginatedProjects = data?.project.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const Row = ({ project }: { project: Project }) => {
    return (
      <Table.Tr key={project.id}>
        <Table.Td>
          <Group gap="xs">
            <ThemeIcon variant="default" classNames={{ root: classes.icon }}>
              <IconStack size={22} stroke={1.5} />
            </ThemeIcon>
            <Text>{project.name}</Text>
          </Group>
        </Table.Td>
        <Table.Td>{project.description?project.description:'No Description'}</Table.Td>
        <Table.Td>
          <Group gap="xs">
            <IconClock size={16} color="var(--clr-project-createdat)" />
            <Text fz="var(--size-sm)" c="var(--clr-project-createdat)">
              {formatProjectDate(project.created_at)}
            </Text>
          </Group>
        </Table.Td>
      </Table.Tr>
    )
  }

  return (
    <Card radius="md" w="100%">
      <Stack gap="lg">
        <Stack gap={0}>
          <Title order={3} className={classes.cardTitle}>
            Project List
          </Title>
          <Text className={classes.cardDescription}>Your current projects</Text>
        </Stack>
        <div className="overflow-x-auto">
          <Table
            highlightOnHover
            withTableBorder
            horizontalSpacing="lg"
            classNames={classes}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th miw={400} maw={400}>
                  Project
                </Table.Th>
                <Table.Th miw={300} w="100%">
                  Description
                </Table.Th>
                <Table.Th miw={240}>Created At</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {!isLoading && paginatedProjects.length > 0 ? (
                paginatedProjects.map((project: Project) => (
                  <Row key={project.id} project={project} />
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={3} align="center">
                    {isLoading ? (
                      <Loader data-testid="loader" />
                    ) : (
                      <Text fw={500} p="xs">
                        No projects found
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
  )
}
