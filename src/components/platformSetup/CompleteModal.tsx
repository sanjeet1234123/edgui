import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Image, Modal, Space, Stack, Text } from '@mantine/core'
import { PATHS } from '@/constants/paths'
import completeModal from '@/assets/images/completeModal.svg'

function CompleteModal({ opened }: { opened: boolean }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (opened) {
      const timer = setTimeout(() => {
        navigate({ to: PATHS.MARKETPLACE })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [opened, navigate])

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      centered
      size="lg"
      radius="lg"
      padding="xl"
      withCloseButton={false}
    >
      <Stack justify="center" align="center">
        <Image w={'200px'} fit="contain" src={completeModal} />
        <Text ta="center" c="#181D27" fw={600} fz={18}>
          NexaStack AI Platform Onboarding successful
        </Text>
        <Text ta="center" c="#535862" fw={400} fz={14}>
          You have been successfully onboarded. You're all set to start
          deploying, managing resources, and exploring powerful cloud
          capabilities.
        </Text>
        <Space h="xl" />
      </Stack>
    </Modal>
  )
}

export default CompleteModal
