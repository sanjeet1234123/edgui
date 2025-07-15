import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useDeleteDeploymentMutation } from '@/hooks/mutations/useDeploymentsMutations'

type DeleteDeploymentModalProps = {
  opened: boolean
  onClose: () => void
  id: number
}

const DeleteDeploymentModal = ({
  opened,
  onClose,
  id,
}: DeleteDeploymentModalProps) => {
  const i768 = useMediaQuery('(max-width: 768px)')
  const { mutate: deleteDeployment, isPending } = useDeleteDeploymentMutation()

  const handleDelete = () => {
    deleteDeployment(id, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <Modal
      size={i768 ? 'md' : 'lg'}
      opened={opened}
      onClose={onClose}
      padding={i768 ? 'md' : 'xl'}
      title={
        <Text
          c="var(--mantine-color-black)"
          fw={600}
          fz={i768 ? 'var(--size-xl)' : 'var(--size-2xl)'}
          ta="center"
        >
          Delete Model
        </Text>
      }
      styles={{ title: { width: '100%' } }}
    >
      <Stack gap="xl" justify="center">
        <Text
          c="var(--mantine-color-black)"
          fw={500}
          fz={i768 ? 'var(--size-md)' : 'var(--size-xl)'}
          ta="center"
        >
          Are you sure you want to delete this model?
        </Text>
        <Group justify="center">
          <Button
            size={i768 ? 'md' : 'lg'}
            variant="subtle"
            color="var(--mantine-color-black)"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size={i768 ? 'md' : 'lg'}
            color="var(--mantine-color-error)"
            onClick={handleDelete}
            loading={isPending}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default DeleteDeploymentModal
