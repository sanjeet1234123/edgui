import {
  Button,
  Group,
  Alert,
  Modal,
  Select,
  Stack,
  TextInput,
} from '@mantine/core'
import classes from './workspace.module.css'
import { IconAlertCircle, IconChevronDown } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { useInviteWorkspaceMembersMutation } from '@/hooks/mutations/useWorkspaceMutations'
import { useGetRolesQuery } from '@/hooks/queries/useRolesQueries'
import type { InviteFormValues } from '@/types/workspaceType'

interface InviteWorkspaceMembersProps {
  opened: boolean
  close: () => void
}

interface Role {
  id: number
  name: string
  domain: string
}

// Define the form schema using Zod
const inviteSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  role: z.string().min(1, 'Role is required'),
})

function InviteWorkspaceMembers({
  opened,
  close,
}: InviteWorkspaceMembersProps) {
  const {
    mutate: invite,
    isPending,
    isError,
  } = useInviteWorkspaceMembersMutation()
  const { data, isLoading } = useGetRolesQuery()

  const form = useForm<InviteFormValues>({
    initialValues: {
      email: '',
      role: '',
    },
    validate: zodResolver(inviteSchema),
  })

  const handleSubmit = (values: InviteFormValues) => {
    // Get role ID and name from the selected role
    const selectedRole = data?.roles.find(
      (role: Role) => role.id.toString() === values.role,
    )

    const submissionData = [
      {
        email: values.email,
        role: selectedRole?.name || '',
        duplicate: false,
      },
    ]

    // Call the mutation with the submission data
    invite(submissionData)
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

  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={close}
      title="Invite Members"
      data-testid="invite-workspace-members"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="xl">
          {isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Invitation Failed"
              color="var(--mantine-color-error)"
              variant="light"
            >
              There was a problem sending the invitation. Please try again.
            </Alert>
          )}

          {/* Email Address and Role */}
          <Stack>
            <TextInput
              label="Email Address"
              placeholder="Enter email address"
              classNames={classes}
              {...form.getInputProps('email')}
            />
            <Select
              label="Role"
              placeholder="Select role"
              data={roles}
              rightSection={<IconChevronDown size={20} />}
              allowDeselect={false}
              classNames={classes}
              {...form.getInputProps('role')}
              styles={{
                option: {
                  textTransform: 'capitalize',
                },
              }}
            />
          </Stack>

          {/* Cancel and Add Member Button */}
          <Group justify="flex-end">
            <Button
              size="md"
              variant="outline"
              onClick={close}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button size="md" type="submit" loading={isPending}>
              {isPending ? 'Sending...' : 'Add Member'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default InviteWorkspaceMembers
