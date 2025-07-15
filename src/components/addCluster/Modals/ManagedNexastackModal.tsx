import { useNavigate } from '@tanstack/react-router'
import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useModalsStack,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { IconCheck, IconCloudCheck, IconStack } from '@tabler/icons-react'
import type { ManagedNexastackClusterConfiguration } from '@/types/addClusterType'
import { PATHS } from '@/constants/paths'
import { useManagedClusterMutation } from '@/hooks/mutations/useAddClusterMutations'

type ManagedNexastackModalProps = {
  opened: boolean
  close: () => void
}

const managedNexastackClusterConfigurationSchema = z.object({
  clusterName: z.string().min(1, 'Cluster name is required'),
})

function ManagedNexastackModal({ opened, close }: ManagedNexastackModalProps) {
  const navigate = useNavigate()
  const { mutate: managedClusterMutation, isPending } =
    useManagedClusterMutation()

  // Modals stack for cluster configuration and success
  const stack = useModalsStack(['cluster-config', 'success'])

  // Form for cluster configuration
  const form = useForm<ManagedNexastackClusterConfiguration>({
    initialValues: {
      clusterName: '',
    },
    validate: zodResolver(managedNexastackClusterConfigurationSchema),
  })

  // Handle cluster configuration complete
  const handleSubmit = () => {
    managedClusterMutation(
      {
        cluster_name: form.values.clusterName,
        ingress: '.lab.neuralcompany.team',
      },
      {
        onSuccess: () => {
          stack.open('success')
        },
      },
    )
  }

  // Close all modals and navigate to clusters page
  const handleFinish = () => {
    stack.closeAll()
    close()

    navigate({ to: PATHS.CLUSTERS })
  }

  return (
    <Modal.Stack>
      {/* First Modal: Cluster Configuration */}
      <Modal
        {...stack.register('cluster-config')}
        size="xl"
        opened={opened}
        onClose={close}
        title={
          <Group>
            <ThemeIcon
              variant="outline"
              color="gray"
              size="xl"
              radius="md"
              styles={{ root: { borderColor: 'var(--mantine-color-gray-3)' } }}
            >
              <IconStack size={32} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text fz="var(--size-xl)" fw={600}>
                Managed Kubernetes (By Nexastack)
              </Text>
              <Text fz="var(--size-sm)" fw={400} c="dimmed">
                Please configure and add your Cluster to NexaStack
              </Text>
            </Stack>
          </Group>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            {/* Cluster Configuration */}
            <Stack align="center" gap={0}>
              <Title order={3} fz="var(--size-2xl)" fw={600}>
                Cluster Configuration
              </Title>
              <Text fz="var(--size-sm)" fw={400} c="dimmed">
                Please provide the following details for your cluster
              </Text>
            </Stack>

            {/* Cluster Configuration Form */}
            <TextInput
              label="Cluster Name"
              placeholder="Enter cluster name"
              {...form.getInputProps('clusterName')}
            />

            {/* Button Group */}
            <Group justify="flex-end">
              <Button
                size="md"
                variant="outline"
                color="var(--mantine-color-gray-7)"
                onClick={close}
              >
                Cancel
              </Button>
              <Button
                size="md"
                type="submit"
                disabled={!form.isValid()}
                loading={isPending}
              >
                Proceed Next
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal
        {...stack.register('success')}
        onClose={close}
        size="xl"
        title={
          <Group>
            <ThemeIcon
              variant="outline"
              color="green"
              size="xl"
              radius="md"
              styles={{ root: { borderColor: 'var(--mantine-color-green-3)' } }}
            >
              <IconCloudCheck size={32} color="var(--mantine-color-green-6)" />
            </ThemeIcon>
            <Stack gap={0}>
              <Text fz="var(--size-xl)" fw={600}>
                Onboarding Successful
              </Text>
              <Text fz="var(--size-sm)" fw={400} c="dimmed">
                Your Managed Kubernetes cluster has been added successfully
              </Text>
            </Stack>
          </Group>
        }
      >
        <Stack gap="xl" align="center">
          <ThemeIcon color="green" size={80} radius="xl">
            <IconCheck size={50} />
          </ThemeIcon>

          <Text ta="center" fz="var(--size-lg)" fw={500}>
            Your Managed Kubernetes cluster has been successfully onboarded.
            You're all set to start deploying, managing resources, and exploring
            powerful cloud capabilities.
          </Text>

          <Button size="md" onClick={handleFinish}>
            Go to Clusters
          </Button>
        </Stack>
      </Modal>
    </Modal.Stack>
  )
}

export default ManagedNexastackModal
