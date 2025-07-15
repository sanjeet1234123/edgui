import { useState } from 'react'
import { Divider, Stack, Text } from '@mantine/core'
import UserInfo from './UserInfo'
import ProjectSelection from './ProjectSelection'
import EnvironmentSelection from './EnvironmentSelection'
import SettingsOptions from './SettingsOptions'
import Logout from './Logout'
import classes from './userProfile.module.css'
import type { Environment, Project } from '@/types/headerType'
import { useUpdateTokenMutation } from '@/hooks/mutations/useHeaderMutations'

type UserProfileProps = {
  currentProject: Project | null
  projects: Array<Project>
  currentEnvironment: Environment
  onProjectChange: (project: Project, environment: Environment) => void
  onEnvironmentChange: (environment: Environment) => void
  close: () => void
}

const UserProfile = ({
  currentProject,
  projects,
  currentEnvironment,
  onProjectChange,
  onEnvironmentChange,
  close,
}: UserProfileProps) => {
  // UI state
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false)
  const [showEnvDropdown, setShowEnvDropdown] = useState(false)

  // Available environments
  const environments: Array<Environment> = [
    'development',
    'staging',
    'production',
  ]

  // Use the separated mutation hook
  const { mutate: updateTokenMutation } = useUpdateTokenMutation()

  const handleProjectSwitch = (projectId: number) => {
    // Format the payload to match what the mutation expects
    updateTokenMutation(
      {
        project_id: projectId,
        environment: currentEnvironment,
      },
      {
        onSuccess: (response) => {
          if (response.token) {
            // Save token
            localStorage.setItem('token', response.token)
            localStorage.setItem('tokenExpiry', response.expire)

            // Find and set the selected project
            const selectedProject = projects?.find(
              (project) => project.id === projectId,
            )

            if (selectedProject) {
              onProjectChange(selectedProject, currentEnvironment)
              setShowProjectsDropdown(false)
            }
          }
        },
      },
    )
  }

  const handleEnvironmentSwitch = (environment: Environment) => {
    // Format the payload to match what the mutation expects
    if (currentProject) {
      updateTokenMutation(
        {
          project_id: currentProject.id,
          environment,
        },
        {
          onSuccess: (response) => {
            if (response.token) {
              // Save token
              localStorage.setItem('token', response.token)
              localStorage.setItem('tokenExpiry', response.expire)
              onEnvironmentChange(environment)
              setShowEnvDropdown(false)
            }
          },
        },
      )
    }
  }

  return (
    <Stack style={{ position: 'relative' }} p="xs">
      <UserInfo />

      <Divider />

      <ProjectSelection
        currentProject={currentProject}
        showProjectsDropdown={showProjectsDropdown}
        setShowProjectsDropdown={setShowProjectsDropdown}
        setShowEnvDropdown={setShowEnvDropdown}
      />

      <EnvironmentSelection
        currentEnvironment={currentEnvironment}
        showEnvDropdown={showEnvDropdown}
        setShowEnvDropdown={setShowEnvDropdown}
        setShowProjectsDropdown={setShowProjectsDropdown}
      />

      <Divider />

      <SettingsOptions close={close}/>

      <Divider />

      <Logout />

      {/* Projects Dropdown */}
      {showProjectsDropdown && (
        <Stack gap={0} classNames={{ root: classes.dropdownStack }}>
          {projects && projects.length > 0 ? (
            projects.map((item) => (
              <Stack
                key={item.id}
                gap={0}
                classNames={{
                  root:
                    currentProject?.id === item.id
                      ? classes.dropdownItemActive
                      : classes.dropdownItem,
                }}
                onClick={() => handleProjectSwitch(item.id)}
              >
                <Text
                  c="#3B3F5C"
                  fz="var(--size-lg)"
                  fw={currentProject?.id === item.id ? 600 : 500}
                >
                  Project: {item.name}
                </Text>
                <Text
                  c="var(--mantine-color-gray-6)"
                  fz="var(--size-sm)"
                  fw={400}
                >
                  Project ID: {item.id}
                </Text>
              </Stack>
            ))
          ) : (
            <Text
              ta="center"
              c="#3B3F5C"
              fz="var(--size-lg)"
              fw={500}
              p="16px 24px"
            >
              No projects found
            </Text>
          )}
        </Stack>
      )}

      {/* Environments Dropdown */}
      {showEnvDropdown && (
        <Stack gap={0} classNames={{ root: classes.dropdownStack }}>
          {environments.map((env) => (
            <Stack
              key={env}
              gap={0}
              classNames={{
                root:
                  currentEnvironment === env
                    ? classes.dropdownItemActive
                    : classes.dropdownItem,
              }}
              onClick={() => handleEnvironmentSwitch(env)}
            >
              <Text
                c="#3B3F5C"
                fz="var(--size-lg)"
                fw={currentEnvironment === env ? 600 : 500}
              >
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </Text>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

export default UserProfile
