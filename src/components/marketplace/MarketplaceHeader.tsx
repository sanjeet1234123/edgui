import { useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { IconUpload } from '@tabler/icons-react'
import UploadModel from './UploadModel'

type MarketplaceHeaderProps = {
  pageTitle: string
}

function MarketplaceHeader({ pageTitle }: MarketplaceHeaderProps) {
  const is1024 = useMediaQuery('(max-width: 1024px)')
  const is768 = useMediaQuery('(max-width: 768px)')

  const routeApi = getRouteApi('/_app/marketplace')
  const { upload } = routeApi.useSearch()

  const [opened, { open, close }] = useDisclosure(false)

  useEffect(() => {
    if (upload === 'true') {
      open()
    }
  }, [upload])

  const handleUploadModel = () => {
    open()
  }

  return (
    <>
      <Group justify="space-between">
        <Text className="Title">{pageTitle}</Text>
        <Group>
          {is768 ? (
            <Tooltip label="Upload Model" position="top">
              <ActionIcon size="lg" onClick={handleUploadModel}>
                <IconUpload size={18} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Button
              size={is1024 ? 'md' : 'lg'}
              leftSection={<IconUpload size={20} />}
              onClick={handleUploadModel}
            >
              Upload Model
            </Button>
          )}
        </Group>
      </Group>
      {opened && <UploadModel opened={opened} onClose={close} />}
    </>
  )
}

export default MarketplaceHeader
