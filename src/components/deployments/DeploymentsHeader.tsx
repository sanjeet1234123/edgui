import { useNavigate } from '@tanstack/react-router'
import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconBuildingStore } from '@tabler/icons-react'
import { PATHS } from '@/constants/paths'

type DeploymentsHeaderProps = {
  pageTitle: string
}

function DeploymentsHeader({ pageTitle }: DeploymentsHeaderProps) {
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate({ to: PATHS.MARKETPLACE })
  }

  return (
    <Group justify="space-between">
      <Text className="Title">{pageTitle}</Text>

      {is1024 ? (
        <Tooltip label="Model Marketplace" position="top">
          <ActionIcon size={is768 ? 'md' : 'lg'} onClick={handleNavigate}>
            <IconBuildingStore size={18} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Button
          size="lg"
          leftSection={<IconBuildingStore size={20} />}
          onClick={handleNavigate}
        >
          Model Marketplace
        </Button>
      )}
    </Group>
  )
}

export default DeploymentsHeader
