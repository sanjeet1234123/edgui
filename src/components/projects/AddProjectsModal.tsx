import { Modal, TextInput, Button, Group, Stack, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import classes from './projects.module.css'
import { useCreateProjectMutation } from '@/hooks/mutations/useProjectsMutations'
import type { ProjectFormValues } from '@/types/projectsType'

// Define the form schema using Zod
const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .regex(
      /^[A-Za-z0-9\-_. ]+$/,
      'Project name can only contain letters, numbers, hyphens, underscores, periods, and spaces',
    ),
})

type AddProjectsProps = {
  opened: boolean
  close: () => void
}

function AddProjectsModal({ opened, close }: AddProjectsProps) {
  const workspaceID = localStorage.getItem('workspace_id')

  const form = useForm<ProjectFormValues>({
    initialValues: {
      name: '',
      description: '',
    },
    validate: zodResolver(projectSchema),
  })

  // Create a new project
  const { mutate: createProject, isPending } = useCreateProjectMutation()

  const handleSubmit = (values: ProjectFormValues) => {
    if (workspaceID) {
      const payload = {
        name: values.name,
        description: values.description,
        workspace_id: workspaceID,
      }
      createProject(payload, {
        onSuccess: () => {
          close()
        },
      })
    }
  }

  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={close}
      title={
        <Title order={2} fz="var(--size-2xl)" fw={600}>
          Create a new project
        </Title>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="xl">
          {/* Project Name and Description */}
          <Stack>
            <TextInput
              label="Name"
              placeholder="Enter your project name"
              classNames={classes}
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Description"
              placeholder="Describe your project"
              classNames={classes}
              {...form.getInputProps('description')}
            />
          </Stack>

          {/* Cancel and Add Project Button */}
          <Group justify="flex-end">
            <Button size="md" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              size="md"
              type="submit"
              loading={isPending}
              disabled={isPending}
            >
              Add Project
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default AddProjectsModal
