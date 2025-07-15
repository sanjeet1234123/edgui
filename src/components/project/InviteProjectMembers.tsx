import {
  Modal,
  Stack,
  Button,
  Group,
  Select,
  Text,
  Radio,
  Checkbox,
  Alert,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import classes from './project.module.css'
import { IconChevronDown, IconAlertCircle } from '@tabler/icons-react'
import { useGetRolesQuery } from '@/hooks/queries/useRolesQueries'
import { useGetWorkspaceMembersQuery } from '@/hooks/queries/useWorkspaceQueries'
import { useGetProjectMembersQuery } from '@/hooks/queries/useProjectQueries'
import { useInviteProjectMemberMutation } from '@/hooks/mutations/useProjectMutations'
import { z } from 'zod'
import { zodResolver } from 'mantine-form-zod-resolver'
import type { projectMember } from '@/types/projectType'

type InviteProjectMembersProps = {
  opened: boolean
  close: () => void
}

// Define environment type
type Environment = 'development' | 'staging' | 'production'
type EnvironmentPermission = 'read' | 'all'

// Define type for role
interface Role {
  id: number
  name: string
  domain: string
}

// Define type for member
interface Member {
  email: string
  role: string
}

// Define the form values type
interface FormValues {
  email: string
  role: string
  environments: {
    development: EnvironmentPermission | null
    staging: EnvironmentPermission | null
    production: EnvironmentPermission | null
  }
}

// Define the Zod schema for form validation
const inviteSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  role: z.string().min(1, 'Role is required'),
  environments: z.object({
    development: z.union([z.literal('read'), z.literal('all'), z.null()]),
    staging: z.union([z.literal('read'), z.literal('all'), z.null()]),
    production: z.union([z.literal('read'), z.literal('all'), z.null()]),
  }),
})

function InviteProjectMembers({ opened, close }: InviteProjectMembersProps) {
  const { projectId } = useParams({ from: '/_app/project/$projectId' })
  const workspaceId = localStorage.getItem('workspace_id')
  // Track which environments are selected
  const [selectedEnvironments, setSelectedEnvironments] = useState<
    Record<Environment, boolean>
  >({
    development: false,
    staging: false,
    production: false,
  })

  // Track error state for environment selection
  const [environmentError, setEnvironmentError] = useState(false)

  // Add state to track if the selected role is an admin role
  const [isAdminRole, setIsAdminRole] = useState(false)

  // Add state to track if the selected role is a user role
  const [isUserRole, setIsUserRole] = useState(false)

  // Get roles
  const { data, isLoading } = useGetRolesQuery()

  // Get workspace members
  const { data: workspaceMembers } = useGetWorkspaceMembersQuery()

  // Get project members
  const { data: projectMembers } = useGetProjectMembersQuery(projectId)

  // Add the mutation hook
  const inviteProjectMember = useInviteProjectMemberMutation()

  const form = useForm<FormValues>({
    initialValues: {
      email: '',
      role: '',
      environments: {
        development: null,
        staging: null,
        production: null,
      },
    },
    validate: zodResolver(inviteSchema) as any,
  })

  const handleEnvironmentChange = (env: Environment, checked: boolean) => {
    // Update the selected environments state
    const updatedEnvironments = { ...selectedEnvironments, [env]: checked }
    setSelectedEnvironments(updatedEnvironments)

    // Clear the permission if the environment is deselected
    if (!checked) {
      form.setFieldValue(`environments.${env}`, null)
    } else {
      // Set default permission to "read" when environment is selected
      form.setFieldValue(`environments.${env}`, 'read')
    }

    // Clear the error if at least one environment is selected
    if (Object.values(updatedEnvironments).some((value) => value)) {
      setEnvironmentError(false)
    }
  }

  const handleSubmit = (values: FormValues) => {
    // For admin roles, automatically use all environments with all permissions
    if (isAdminRole || !isUserRole) {
      // Format environment data for admin/non-user roles - all environments with all permissions
      const allEnvironmentsWithFullAccess = [
        'development',
        'staging',
        'production',
      ].map((env) => ({
        environment: env,
        permissions: ['read', 'write'], // all permissions
      }))

      // Get role ID and name from the selected role
      const selectedRole = data?.roles.find(
        (role: Role) => role.id.toString() === values.role,
      )

      const submissionData = {
        email: values.email,
        role: selectedRole?.name || '',
        role_id: parseInt(values.role),
        project_id: projectId,
        environment_access: allEnvironmentsWithFullAccess,
        workspace: workspaceId,
      }

      // Call the mutation with the submission data
      inviteProjectMember.mutate(submissionData)
      return
    }

    // For user roles, check if at least one environment is selected
    if (!Object.values(selectedEnvironments).some((value) => value)) {
      setEnvironmentError(true)
      return
    }

    // Format the environment data for submission (for user roles)
    const environmentAccess = Object.entries(values.environments)
      .filter(
        ([env, permission]) =>
          selectedEnvironments[env as Environment] && permission,
      )
      .map(([env, permission]) => ({
        environment: env,
        permissions: permission === 'all' ? ['read', 'write'] : ['read'],
      }))

    // Get role ID and name from the selected role
    const selectedRole = data?.roles.find(
      (role: Role) => role.id.toString() === values.role,
    )

    const submissionData = {
      email: values.email,
      role: selectedRole?.name || '',
      role_id: parseInt(values.role),
      project_id: projectId,
      environment_access: environmentAccess,
      workspace: workspaceId,
    }

    // Call the mutation with the submission data
    inviteProjectMember.mutate(submissionData)
  }

  // Detect admin role when the role selection changes
  const handleRoleChange = (roleId: string) => {
    if (!data || !data.roles) return

    const selectedRole = data.roles.find(
      (role: Role) => role.id.toString() === roleId,
    )
    // Check if the selected role is an admin role (assuming admin roles contain "admin" in their name)
    const isAdmin = selectedRole?.name?.toLowerCase().includes('admin')
    setIsAdminRole(isAdmin)

    // Check if the selected role is a user role (assuming user roles contain "user" in their name)
    const isUser =
      selectedRole?.name?.toLowerCase().includes('user') ||
      selectedRole?.name?.toLowerCase() === 'user'
    setIsUserRole(isUser)

    // Update the form with the selected role
    form.setFieldValue('role', roleId)
  }

  // Filter the roles to only include project roles where domain is project
  const roles =
    isLoading || !data?.roles
      ? []
      : data.roles
          .filter((role: Role) => role.domain === 'project')
          .map((role: Role) => ({
            label: role.name?.charAt(0).toUpperCase() + role.name.slice(1),
            value: role.id.toString(),
          }))

  const emailAddresses =
    workspaceMembers &&
    workspaceMembers.members &&
    workspaceMembers.members
      .filter((member: Member) => {
        // Filter out members who are already in the project
        // Only check if projectMembers exists and has members
        const isAlreadyInProject =
          projectMembers?.length > 0
            ? projectMembers.some(
                (projectMember: projectMember) =>
                  projectMember.email === member.email,
              )
            : false
        // Only include members who are not in the project and not owners
        return !isAlreadyInProject && member.role.toLowerCase() !== 'owner'
      })
      .map((member: Member) => ({
        label: member.email,
        value: member.email,
      }))

  const environments = [
    {
      label: 'Development',
      value: 'development' as Environment,
    },
    {
      label: 'Staging',
      value: 'staging' as Environment,
    },
    {
      label: 'Production',
      value: 'production' as Environment,
    },
  ]

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="lg"
      title="Invite Members"
      styles={{
        title: {
          fontSize: 'var(--size-2xl)',
          fontWeight: '600',
        },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="xl">
          {inviteProjectMember.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Invitation Failed"
              color="red"
              variant="light"
            >
              {inviteProjectMember.error?.message ||
                'An error occurred while sending the invitation.'}
            </Alert>
          )}

          {/* Invite Member Form */}
          <Stack>
            <Select
              size="md"
              label="Email Address"
              placeholder="Search email address"
              rightSection={<IconChevronDown size={20} />}
              searchable
              nothingFoundMessage="No members found"
              data={emailAddresses}
              classNames={classes}
              {...form.getInputProps('email')}
            />

            <Select
              size="md"
              label="Role"
              placeholder="Select role"
              data={roles}
              rightSection={<IconChevronDown size={20} />}
              allowDeselect={false}
              classNames={classes}
              onChange={(value) => handleRoleChange(value as string)}
              value={form.values.role}
              error={form.errors.role}
              styles={{
                option: {
                  textTransform: 'capitalize',
                },
              }}
            />

            {/* Only show Environment Access when role is specifically "user" */}
            {isUserRole && (
              <Stack gap="xs">
                <Text classNames={{ root: classes.label }}>
                  Environment Access
                </Text>

                {environmentError && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Environment Required"
                    color="red"
                    variant="light"
                  >
                    Please select at least one environment
                  </Alert>
                )}

                {environments.map((item) => (
                  <Stack key={item.value} gap="xs">
                    <Checkbox
                      fw={600}
                      color="var(--clr-secondary)"
                      label={item.label}
                      checked={selectedEnvironments[item.value]}
                      onChange={(event) =>
                        handleEnvironmentChange(
                          item.value,
                          event.currentTarget.checked,
                        )
                      }
                    />

                    {selectedEnvironments[item.value] && (
                      <Radio.Group
                        pl="xl"
                        value={form.values.environments[item.value]}
                        onChange={(value) =>
                          form.setFieldValue(
                            `environments.${item.value}`,
                            value as EnvironmentPermission,
                          )
                        }
                      >
                        <Group gap="xl">
                          <Radio
                            color="var(--clr-secondary)"
                            value="read"
                            label="Read Only"
                          />
                          <Radio
                            color="var(--clr-secondary)"
                            value="all"
                            label="All Permissions"
                          />
                        </Group>
                      </Radio.Group>
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>

          {/* Invite Member Buttons */}
          <Group justify="flex-end">
            <Button
              size="md"
              variant="outline"
              onClick={close}
              disabled={inviteProjectMember.isPending}
            >
              Cancel
            </Button>
            <Button
              size="md"
              type="submit"
              loading={inviteProjectMember.isPending}
            >
              {inviteProjectMember.isPending ? 'Sending...' : 'Add Member'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default InviteProjectMembers
