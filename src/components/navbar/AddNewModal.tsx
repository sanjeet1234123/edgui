import { useNavigate } from '@tanstack/react-router'
import { Group, Modal, Paper, Stack, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconFilePlus, IconFolderUp, IconPlus } from '@tabler/icons-react'
import classes from './AddNewModal.module.css'
import { PATHS } from '@/constants/paths'

interface AddNewModalProps {
  opened: boolean
  onClose: () => void
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggle: () => void
}

const data = [
  {
    title: 'Add New Cluster',
    description:
      'Set the infrastructure configurations as per your requirements and get started with Nexastack',
    icon: IconFilePlus,
    path: PATHS.ADD_CLUSTER,
  },
  {
    title: 'Upload New Model',
    description:
      "Upload your model to the cluster and quickly get started with Nexastack's powerful deployment platform.",
    icon: IconPlus,
    path: PATHS.MARKETPLACE,
  },
]

function AddNewModal({
  opened,
  onClose,
  toggle,
  setSidebarOpen,
}: AddNewModalProps) {
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')
  const navigate = useNavigate()

  const handleClick = (path: string) => {
    onClose()
    toggle()
    setSidebarOpen(prev => !prev)
    // Only add the upload param for the marketplace path
    if (path === PATHS.MARKETPLACE) {
      navigate({ to: path, search: { upload: 'true' } })
    } else {
      navigate({ to: path })
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={is768 ? '100vw' : 'xl'}
      title={
        <Stack gap={4}>
          <Group>
            <IconFolderUp size={32} />
            <Text fw={600} fz="var(--size-xl)">
              Onboard Cluster
            </Text>
          </Group>
          <Text c="var(--mantine-color-gray-6)" fz="var(--size-sm)">
            Please configure and add your cluster
          </Text>
        </Stack>
      }
    >
      <div className="flex flex-col gap-4 md:flex-row">
        {data.map((item, index) => (
          <Paper
            key={index}
            className={classes.card}
            onClick={() => handleClick(item.path)}
          >
            <Stack align="center" justify="center">
              <item.icon
                size={is1024 ? 60 : 80}
                stroke={1}
                className={classes.icon}
              />
              <Text className={classes.cardTitle}>{item.title}</Text>
            </Stack>
            <Text className={classes.cardDescription}>{item.description}</Text>
          </Paper>
        ))}
      </div>
    </Modal>
  )
}

export default AddNewModal
