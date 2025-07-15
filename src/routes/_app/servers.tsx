import { Stack } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  prefetchServers,
  useGetServersQuery,
} from '@/hooks/queries/useServersQueries'
import { ComponentError } from '@/components/ui'
import {
  ServersFallback,
  ServersHeader,
  ServersSection,
} from '@/components/servers'

export const Route = createFileRoute('/_app/servers')({
  loader: ({ context }) => {
    const { queryClient } = context
    queryClient.prefetchQuery(prefetchServers(1, 12))
    return { pageTitle: 'MCP Marketplace' }
  },
  component: RouteComponent,
  pendingComponent: () => <ServersFallback />,
  errorComponent: (error) => <ComponentError error={error} />,
})

function RouteComponent() {
  const { pageTitle } = Route.useLoaderData()
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data: servers } = useGetServersQuery(page, limit, debouncedSearch)

  useEffect(() => {
    // Reset to page 1 when search changes
    if (search !== debouncedSearch) {
      setPage(1)
    }

    // Simple debounce for search
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 100)

    return () => clearTimeout(timer)
  }, [search, debouncedSearch])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
  }

  return (
    <Stack className="flex-grow">
      <ServersHeader pageTitle={pageTitle} />
      <ServersSection
        servers={servers}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchValue={search}
      />
    </Stack>
  )
}
