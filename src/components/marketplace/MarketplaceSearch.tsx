import {
  ActionIcon,
  Button,
  Group,
  Popover,
  Radio,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import {
  IconLayoutGridFilled,
  IconMenu2,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import classes from './marketplace.module.css'
import { Funnel } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useModelStore } from '@/store/modelStore'
import { motion, AnimatePresence } from 'motion/react'

function MarketplaceSearch() {
  const {
    viewMode,
    setViewMode: storeSetViewMode,
    setSearchModel,
    setFilters,
    filters: storeFilters,
  } = useModelStore()

  const [selectedFilters, setSelectedFilters] = useState({
    safety: storeFilters?.safety || null,
    hardware: storeFilters?.hardware || null,
  })

  // Memoize the setViewMode function to prevent infinite re-renders
  const handleViewModeChange = useCallback(
    (newViewMode: string) => {
      storeSetViewMode(newViewMode)
    },
    [storeSetViewMode],
  )

  // Memoize the search handler to prevent unnecessary re-renders
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchModel(e.target.value)
    },
    [setSearchModel],
  )

  // Sync local state with store when store changes
  useEffect(() => {
    setSelectedFilters({
      safety: storeFilters?.safety || null,
      hardware: storeFilters?.hardware || null,
    })
  }, [storeFilters])

  const filters = [
    {
      label: 'Safety',
      key: 'safety' as const,
      options: [
        { label: 'Safe', value: 'safe' },
        { label: 'Unsafe', value: 'unsafe' },
        { label: 'Use with Caution', value: 'use with caution' },
      ],
    },
    {
      label: 'Hardware',
      key: 'hardware' as const,
      options: [
        { label: 'CPU', value: 'cpu' },
        { label: 'GPU', value: 'gpu' },
      ],
    },
  ]

  const handleFilterChange = useCallback(
    (filterKey: 'safety' | 'hardware', value: string) => {
      setSelectedFilters(prevFilters => {
        const newFilters = {
          ...prevFilters,
          [filterKey]: value,
        }
        setFilters(newFilters)
        return newFilters
      })
    },
    [setFilters],
  )

  return (
    <Group>
      {/* Search field */}
      <TextInput
        className="max-sm:w-full sm:flex-1"
        leftSection={<IconSearch size={18} />}
        placeholder="Search by name or description"
        onChange={handleSearchChange}
      />
      {/* Segmented control */}
      <SegmentedControl
        classNames={{
          root: classes.segmentedControlRoot,
        }}
        value={viewMode}
        onChange={handleViewModeChange}
        size="sm"
        radius="sm"
        transitionTimingFunction="ease"
        data={[
          {
            value: 'grid',
            label: <IconLayoutGridFilled />,
          },
          {
            value: 'table',
            label: <IconMenu2 />,
          },
        ]}
      />

      {/* Applied Filters */}
      <AnimatePresence mode="popLayout">
        {Object.entries(selectedFilters)
          .filter(([, value]) => value !== null) // Only show active filters
          .map(([key, value]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <Button
                rightSection={
                  <ActionIcon
                    variant="transparent"
                    ml="-8px"
                    onClick={() =>
                      handleFilterChange(key as 'safety' | 'hardware', '')
                    }
                  >
                    <IconX size={18} color="var(--clr-black)" />
                  </ActionIcon>
                }
                variant="outline"
                classNames={{
                  root: classes.filterTagsRoot,
                  label: classes.filterTagsLabel,
                }}
              >
                {value}
              </Button>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Filters */}
      <Popover position="bottom" offset={{ mainAxis: 10, crossAxis: -122 }}>
        <Popover.Target>
          <Button
            variant="outline"
            classNames={{
              root: classes.filtersButtonRoot,
              label: classes.filtersButtonLabel,
              section: classes.filtersButtonSection,
            }}
            leftSection={<Funnel size={16} />}
          >
            Filters
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="lg">
            {filters.map((filter, i) => (
              <Stack key={i}>
                <Text fw={600}>{filter.label}</Text>
                <Radio.Group
                  value={selectedFilters[filter.key] || ''}
                  onChange={value => handleFilterChange(filter.key, value)}
                >
                  <Group>
                    {filter.options.map((option, j) => (
                      <Radio
                        key={j}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Group>
                </Radio.Group>
              </Stack>
            ))}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Group>
  )
}

export default MarketplaceSearch
