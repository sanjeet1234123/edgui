import {
  Button,
  Box,
  Center,
  Stack,
  ThemeIcon,
  Text,
  Grid,
} from '@mantine/core'
import { IconFolderPlus } from '@tabler/icons-react'
import type { ProjectResponse } from '@/types/projectsType'
import { useDisclosure } from '@mantine/hooks'
import AddProjectsModal from './AddProjectsModal'
import ProjectsCard from './ProjectsCard'

type ProjectBodyProps = {
  data: ProjectResponse
}

function ProjectsBody({ data }: ProjectBodyProps) {
  const [opened, { open, close }] = useDisclosure(false)

  if (!data || data?.project?.length === 0) {
    return (
      <>
        <Center className="flex-grow">
          <Stack align="center" gap="xl">
            <ThemeIcon size={80} radius={100} variant="light">
              <IconFolderPlus size={40} />
            </ThemeIcon>
            <Box ta="center">
              <Text size="xl" fw={500}>
                No projects found
              </Text>
              <Text c="dimmed" mt="sm">
                You haven't created any projects yet. Create your first project
                to get started.
              </Text>
            </Box>
            <Button size="lg" mt="md" onClick={open}>
              Create Your First Project
            </Button>
          </Stack>
        </Center>
        {opened && <AddProjectsModal opened={opened} close={close} />}
      </>
    )
  }

  return (
    <Grid gutter="lg">
      {data?.project?.map((project) => (
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={project.id}>
          <ProjectsCard project={project} />
        </Grid.Col>
      ))}
    </Grid>
  )
}

export default ProjectsBody
