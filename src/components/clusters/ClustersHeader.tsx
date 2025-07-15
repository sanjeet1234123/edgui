import { useNavigate } from '@tanstack/react-router'
import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
import { PATHS } from '@/constants/paths'

type ClustersHeaderProps = {
  pageTitle: string
}

function ClustersHeader({ pageTitle }: ClustersHeaderProps) {
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate({ to: PATHS.ADD_CLUSTER })
  }

  return (
    <Group justify="space-between">
      <Text className="Title">{pageTitle}</Text>

      {is1024 ? (
        <Tooltip label="Add New Cluster" position="top">
          <ActionIcon size={is768 ? 'md' : 'lg'} onClick={handleNavigate}>
            <IconPlus size={18} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Button
          size="lg"
          leftSection={<IconPlus size={20} />}
          onClick={handleNavigate}
        >
          Add New Cluster
        </Button>
      )}
    </Group>
  )
}

export default ClustersHeader
