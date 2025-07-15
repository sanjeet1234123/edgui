import { useEffect, useState } from 'react'
import { Grid, Group, Pagination, Stack, Text, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import ServersCard from './ServersCard'
import type { Server, ServerResponse } from '@/types/serversType'

type ServersSectionProps = {
  servers: ServerResponse
  onPageChange?: (page: number) => void
  onSearch?: (search: string) => void
  searchValue?: string
}

function ServersSection({
  servers,
  onPageChange,
  onSearch,
  searchValue = '',
}: ServersSectionProps) {
  const [activePage, setActivePage] = useState(servers.page)
  const [searchTerm, setSearchTerm] = useState(searchValue)
  const totalPages = Math.ceil(servers.total / servers.limit)

  useEffect(() => {
    setActivePage(servers.page)
  }, [servers.page])

  useEffect(() => {
    setSearchTerm(searchValue)
  }, [searchValue])

  const handlePageChange = (page: number) => {
    setActivePage(page)
    if (onPageChange) {
      onPageChange(page)
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value
    setSearchTerm(value)

    // Trigger search immediately when the field is emptied
    if (value === '' && onSearch) {
      onSearch('')
    }
  }

  const handleSearchSubmit = () => {
    if (onSearch) {
      onSearch(searchTerm)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  return (
    <Stack justify="space-between" className="flex-grow">
      <Stack>
        <TextInput
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onBlur={handleSearchSubmit}
          classNames={{
            wrapper: 'custom-wrapper',
            root: 'custom-root',
            input: 'custom-input',
          }}
          rightSection={
            <IconSearch
              size={16}
              onClick={handleSearchSubmit}
              style={{ cursor: 'pointer' }}
            />
          }
        />

        <Grid gutter={{ base: 16, md: 24 }}>
          {servers.data && servers.data.length > 0 ? (
            servers.data.map((server: Server) => (
              <Grid.Col
                span={{ base: 12, md: 6, lg: 4, xl: 3 }}
                key={server.id}
              >
                <ServersCard server={server} />
              </Grid.Col>
            ))
          ) : (
            <Grid.Col span={12}>
              <Text ta="center">No servers found</Text>
            </Grid.Col>
          )}
        </Grid>
      </Stack>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            value={activePage}
            onChange={handlePageChange}
            total={totalPages}
            siblings={1}
            boundaries={2}
          />
        </Group>
      )}
    </Stack>
  )
}

export default ServersSection
