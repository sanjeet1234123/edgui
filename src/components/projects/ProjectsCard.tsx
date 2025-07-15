import { useNavigate } from '@tanstack/react-router'
import { Card, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconStack } from '@tabler/icons-react'
import classes from './projects.module.css'
import type { Project } from '@/types/projectsType'
import { PATHS } from '@/constants/paths'
import { formatProjectDate } from '@/utils/commonFunction'

interface ProjectCardProps {
  project: Project
}

function ProjectsCard({ project }: ProjectCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate({
      to: PATHS.PROJECT_DETAIL,
      params: { projectId: project.id.toString() },
    })
  }

  return (
    <Card classNames={{ root: classes.card }} onClick={handleClick}>
      <Stack justify="space-between" h="100%">
        <Stack>
          <ThemeIcon variant="default" classNames={{ root: classes.icon }}>
            <IconStack size={40} stroke={1.5} />
          </ThemeIcon>
          <Text className={classes.name}>{project.name}</Text>
          <Text className={classes.description} lineClamp={2}>
            {project.description || 'No description provided'}
          </Text>
        </Stack>
        <Text className={classes.status}>
          {formatProjectDate(project.created_at)}
        </Text>
      </Stack>
    </Card>
  )
}

export default ProjectsCard
