import { useEffect, useState } from 'react'
import { Avatar, Group, Popover, Text } from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import UserProfile from '../userProfile/UserProfile'
import type { Environment, Project } from '@/types/headerType'
import { useGetProjects } from '@/hooks/queries/useHeaderQueries'
import { useDisclosure } from '@mantine/hooks'

function ProjectPopover() {
  const [opened, { close, open }] = useDisclosure(false)
  // Main state
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [currentEnvironment, setCurrentEnvironment] =
    useState<Environment | null>(null)

  const { data: projectsData, isSuccess, isLoading } = useGetProjects()

  // Helper function to update project state and localStorage consistently
  const updateProjectState = (project: Project, environment: Environment) => {
    // Update state
    setCurrentProject(project)
    setCurrentEnvironment(environment)

    // Update localStorage
    localStorage.setItem('project_id', String(project.id))
    localStorage.setItem('project_name', project.name)
    localStorage.setItem('project_env', String(environment))
  }

  // Handler for project changes
  const handleProjectChange = (
    newProject: Project,
    environment: Environment = currentEnvironment || 'development',
  ) => {
    updateProjectState(newProject, environment)
  }

  // Handler for environment changes
  const handleEnvironmentChange = (newEnvironment: string) => {
    if (currentProject) {
      updateProjectState(currentProject, newEnvironment)
    }
  }

  // Initialize from localStorage and update when data is available
  useEffect(() => {
    // This helps with handling refresh cases - if we have data in localStorage
    // we can display it while the API call is in progress
    const projectName = localStorage.getItem('project_name')
    const projectId = localStorage.getItem('project_id')
    const projectEnv = localStorage.getItem('project_env') || 'development'

    if (projectName && projectId) {
      setCurrentProject({
        id: Number(projectId),
        name: projectName,
        // Add other required properties with placeholder values
        created_at: '',
        created_by: 0,
        deleted_at: null,
        description: '',
        environment: projectEnv,
        members: null,
        organization_id: 0,
        project_id: Number(projectId),
        updated_at: '',
        updated_by: 0,
        workspace_id: '',
      })
      setCurrentEnvironment(projectEnv)
    }
  }, [])

  // Update current project when data is loaded
  useEffect(() => {
    if (isSuccess && projectsData?.project?.length > 0) {
      const projects = projectsData.project

      // Get stored project ID or use the first project
      const savedProjectId = localStorage.getItem('project_id')
      const savedEnvironment = localStorage.getItem('project_env')

      // Find selected project or default to first
      let selectedProject
      if (savedProjectId) {
        selectedProject = projects.find(
          (p: any) => p.id.toString() === savedProjectId,
        )
      }

      if (!selectedProject) {
        selectedProject = projects[0]
      }

      // Set current project and environment
      updateProjectState(
        selectedProject,
        savedEnvironment || selectedProject.environment || 'development',
      )
    }
  }, [isSuccess, projectsData])

  // Display text while loading or based on current project
  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

  const displayText = isLoading
    ? 'Loading...'
    : `${currentProject?.name || 'No Project'}/${capitalize(
        currentEnvironment || 'development',
      )}`

  return (
    <Popover
      offset={{ mainAxis: 10, crossAxis: 5 }}
      opened={opened}
      onDismiss={close}
    >
      <Popover.Target>
        <Group
          gap="xs"
          style={{ cursor: 'pointer' }}
          onClick={opened ? close : open}
        >
          <Avatar name={displayText} color="initials" size="md" />
          <Text fz="var(--size-base)" fw={500} className="hidden md:block">
            {displayText}
          </Text>
          <IconChevronDown size={20} />
        </Group>
      </Popover.Target>

      <Popover.Dropdown>
        <UserProfile
          close={close}
          currentProject={currentProject}
          projects={projectsData?.project || []}
          currentEnvironment={currentEnvironment || 'development'}
          onProjectChange={handleProjectChange}
          onEnvironmentChange={handleEnvironmentChange}
        />
      </Popover.Dropdown>
    </Popover>
  )
}

export default ProjectPopover
