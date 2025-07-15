import { Button, Group, Text } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { Rocket } from 'lucide-react'
import { PATHS } from '@/constants/paths'
import { useModelStore } from '@/store/modelStore'

function ModalPlaygroundHeader() {
  const navigate = useNavigate()

  const { currentModel } = useModelStore()

  const handleDeploy = () => {
    navigate({
      to: PATHS.DEPLOYMENT,
      search: {
        model: currentModel?.model_name.toString(),
      },
    })
  }

  return (
    <Group justify="space-between">
      <Text className="Title">Model Playground</Text>

      <Button
        size="lg"
        leftSection={<Rocket size={20} />}
        onClick={handleDeploy}
      >
        Deploy on Production
      </Button>
    </Group>
  )
}

export default ModalPlaygroundHeader
