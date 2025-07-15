import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import { IconServer } from '@tabler/icons-react'
import { BrushCleaning } from 'lucide-react'
import ServerPlaygroundServerCard from './ServerPlaygroundServerCard'
import type { Server } from '@/types/serversType'
import { useGetServersInfiniteQuery } from '@/hooks/queries/useServersQueries'
import { useGetServerQuery } from '@/hooks/queries/useServerQueries'
import { useSelectedServersStore } from '@/store/selectedServersStore'

interface ServerPlaygroundListsProps {
  server: string
}

function ServerPlaygroundLists({ server }: ServerPlaygroundListsProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useGetServersInfiniteQuery(12, '')
  const { data: serverData } = useGetServerQuery(server)
  const { selectedServers } = useSelectedServersStore()
  const toggleServer = useSelectedServersStore(state => state.toggleServer)
  const isServerSelected = useSelectedServersStore(
    state => state.isServerSelected,
  )
  const clearSelectedServers = useSelectedServersStore(
    state => state.clearSelectedServers,
  )
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [hasScrolledToTarget, setHasScrolledToTarget] = useState(false)

  useEffect(() => {
    if (serverData?.data?.[0] && !isServerSelected(serverData.data[0].id)) {
      toggleServer(serverData.data[0])
    }
  }, [serverData, toggleServer, isServerSelected])

  useEffect(() => {
    if (serverData?.data?.[0] && data?.pages) {
      // Find the page and index of the server in the loaded data
      let foundServer = false
      for (const page of data.pages) {
        const serverIndex = page.data.findIndex(
          (s: Server) => s.id === serverData.data[0].id,
        )
        if (serverIndex !== -1) {
          foundServer = true
          break
        }
      }

      // If server is not in loaded data, fetch more pages until we find it
      if (!foundServer && hasNextPage) {
        fetchNextPage()
      }
    }
  }, [serverData, data, hasNextPage, fetchNextPage])

  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage()
          }
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 1.0,
        },
      )
      observer.current.observe(node)
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  )

  const renderServerList = () => {
    if (status === 'pending') {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <Skeleton key={index} height={60} mb="md" radius="md" />
        ))
    }

    if (status === 'error') {
      return <Text c="red">Error loading servers</Text>
    }

    return data.pages.map((page, i) => (
      <Stack key={i}>
        {page.data.map((serverItem: Server, index: number) => {
          const isLastElement =
            i === data.pages.length - 1 && index === page.data.length - 1
          const isTargetServer = serverData?.data?.[0]?.id === serverItem.id
          return (
            <ServerPlaygroundServerCard
              key={serverItem.id}
              server={serverItem}
              lastElementRef={isLastElement ? lastElementRef : undefined}
              ref={
                isTargetServer && !hasScrolledToTarget
                  ? (node: HTMLDivElement | null) => {
                      if (node && scrollAreaRef.current) {
                        node.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        })
                        setHasScrolledToTarget(true)
                      }
                    }
                  : undefined
              }
            />
          )
        })}
      </Stack>
    ))
  }

  return (
    <Card mr="xl" p="md">
      <Stack h="100%" gap="md">
        <Group justify="space-between">
          <Group>
            <IconServer size={24} stroke={1.5} />
            <Text fz="var(--size-xl)" fw={500}>
              Servers List
            </Text>
            <Badge variant="default">{selectedServers.length}</Badge>
          </Group>

          <Tooltip label="Clear all servers" position="top">
            <ActionIcon variant="transparent" onClick={clearSelectedServers}>
              <BrushCleaning size={24} strokeWidth={1.5}  color="var(--clr-clear-servers-brush-icon)"/>
            </ActionIcon>
          </Tooltip>
        </Group>

        <Box style={{ flex: 1, minHeight: 0 }}>
          <ScrollArea h="100%" type="always" viewportRef={scrollAreaRef}>
            {renderServerList()}
            {isFetchingNextPage && (
              <Stack mt="md">
                <Skeleton height={60} radius="md" />
                <Skeleton height={60} radius="md" />
              </Stack>
            )}
          </ScrollArea>
        </Box>
      </Stack>
    </Card>
  )
}

export default ServerPlaygroundLists
