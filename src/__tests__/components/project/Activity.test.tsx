// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Activity from '@/components/project/Activity'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false),
}))

// Mock the project module CSS
jest.mock('@/components/project/project.module.css', () => ({
  activity: 'activity-class',
  activityName: 'activityName-class',
  activityReason: 'activityReason-class',
  activityBadge: 'activityBadge-class',
  activityBadgePass: 'activityBadgePass-class',
  activityBadgeFail: 'activityBadgeFail-class',
  activityBadgePending: 'activityBadgePending-class',
  activityDescription: 'activityDescription-class',
  activityFilterSelect: 'activityFilterSelect-class',
}))

// Mock the time ago function
jest.mock('@/utils/commonFunction', () => ({
  timeAgo: jest.fn().mockReturnValue('2 hours ago'),
}))

// Mock the project queries hook
jest.mock('@/hooks/queries/useProjectQueries', () => ({
  useGetProjectActivitiesQuery: jest.fn(),
}))

// Mock the router
jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn().mockReturnValue({ projectId: 'test-project-id' }),
}))

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconFilter: () => <div data-testid="icon-filter">Filter Icon</div>,
  IconChevronDown: () => (
    <div data-testid="icon-chevron-down">Chevron Down Icon</div>
  ),
  IconRefresh: () => <div data-testid="icon-refresh">Refresh Icon</div>,
  IconClock: () => <div data-testid="icon-clock">Clock Icon</div>,
}))

// Minimal Mantine mocks that preserve component behavior
jest.mock('@mantine/core', () => {
  const React = require('react')
  return {
    Card: ({ children }) => <div data-testid="card">{children}</div>,
    Text: ({ children }) => <span data-testid="text">{children}</span>,
    Stack: ({ children }) => <div data-testid="stack">{children}</div>,
    Group: ({ children }) => <div data-testid="group">{children}</div>,
    Title: ({ children }) => <h2 data-testid="title">{children}</h2>,
    Select: ({ data, value, onChange }) => (
      <select
        value={value}
        onChange={e => onChange?.(e.target.value)}
        data-testid="select"
      >
        {data?.map(item => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    ),
    ActionIcon: ({ children, onClick }) => (
      <button onClick={onClick} data-testid="action-icon">
        {children}
      </button>
    ),
    Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
    Badge: ({ children }) => <span data-testid="badge">{children}</span>,
    Pagination: ({ total, value, onChange }) => (
      <div data-testid="pagination">
        <button
          onClick={() => onChange?.(Math.max(1, value - 1))}
          disabled={value <= 1}
        >
          Prev
        </button>
        <button
          onClick={() => onChange?.(Math.min(total, value + 1))}
          disabled={value >= total}
        >
          Next
        </button>
      </div>
    ),
    Avatar: () => <div data-testid="avatar">Avatar</div>,
    Center: ({ children }) => <div data-testid="center">{children}</div>,
  }
})

describe('Activity', () => {
  const createMockData = activities => ({
    data: activities,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders basic activity information', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([
        {
          id: '1',
          activity_name: 'Test Activity',
          reason: 'Test Reason',
          name: 'Test User',
          environment: 'production',
          status: 'pass',
          timestamp: '2023-06-01T10:00:00Z',
        },
      ]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(screen.getByText('Activity Log')).toBeInTheDocument()
    expect(screen.getByText('Test Activity')).toBeInTheDocument()
  })

  it('handles missing activity_name fallback', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([
        {
          id: '1',
          reason: 'Test Reason',
          name: 'Test User',
          environment: 'production',
          status: 'pass',
          timestamp: '2023-06-01T10:00:00Z',
        },
      ]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(screen.getByText('No activity name')).toBeInTheDocument()
  })

  it('handles missing reason fallback', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([
        {
          id: '1',
          activity_name: 'Test Activity',
          name: 'Test User',
          environment: 'production',
          status: 'pass',
          timestamp: '2023-06-01T10:00:00Z',
        },
      ]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(screen.getByText('No reason')).toBeInTheDocument()
  })

  it('handles missing name fallback', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([
        {
          id: '1',
          activity_name: 'Test Activity',
          reason: 'Test Reason',
          environment: 'production',
          status: 'pass',
          timestamp: '2023-06-01T10:00:00Z',
        },
      ]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('handles missing environment fallback', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([
        {
          id: '1',
          activity_name: 'Test Activity',
          reason: 'Test Reason',
          name: 'Test User',
          status: 'pass',
          timestamp: '2023-06-01T10:00:00Z',
        },
      ]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(screen.getByText('No environment')).toBeInTheDocument()
  })

  it('handles missing status fallback', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([
        {
          id: '1',
          activity_name: 'Test Activity',
          reason: 'Test Reason',
          name: 'Test User',
          environment: 'production',
          timestamp: '2023-06-01T10:00:00Z',
        },
      ]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(screen.getByText('No status')).toBeInTheDocument()
  })

  it('handles null/undefined values triggering fallbacks', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([
        {
          id: '1',
          activity_name: null,
          reason: undefined,
          name: null,
          environment: undefined,
          status: null,
          timestamp: '2023-06-01T10:00:00Z',
        },
      ]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(screen.getByText('No activity name')).toBeInTheDocument()
    expect(screen.getByText('No reason')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('No environment')).toBeInTheDocument()
    expect(screen.getByText('No status')).toBeInTheDocument()
  })

  it('handles empty string values triggering fallbacks', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([
        {
          id: '1',
          activity_name: '',
          reason: '',
          name: '',
          environment: '',
          status: '',
          timestamp: '2023-06-01T10:00:00Z',
        },
      ]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(screen.getByText('No activity name')).toBeInTheDocument()
    expect(screen.getByText('No reason')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('No environment')).toBeInTheDocument()
    expect(screen.getByText('No status')).toBeInTheDocument()
  })

  it('handles empty data array', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(
      screen.getByText('No activity matches the selected filter'),
    ).toBeInTheDocument()
  })

  it('handles undefined data', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: undefined,
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(
      screen.getByText('No activity matches the selected filter'),
    ).toBeInTheDocument()
  })

  it('renders pagination when more than 5 items', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    const activities = Array.from({ length: 6 }, (_, i) => ({
      id: `${i + 1}`,
      activity_name: `Activity ${i + 1}`,
      reason: `Reason ${i + 1}`,
      name: `User ${i + 1}`,
      environment: 'production',
      status: 'pass',
      timestamp: '2023-06-01T10:00:00Z',
    }))

    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData(activities),
      refetch: jest.fn(),
    })

    render(<Activity />)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByText('Showing 1 – 5 of 6')).toBeInTheDocument()
  })

  it('handles filter change', () => {
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([
        {
          id: '1',
          activity_name: 'Test Activity',
          reason: 'Test Reason',
          name: 'Test User',
          environment: 'production',
          status: 'pass',
          timestamp: '2023-06-01T10:00:00Z',
        },
      ]),
      refetch: jest.fn(),
    })

    render(<Activity />)
    const select = screen.getByTestId('select')
    fireEvent.change(select, { target: { value: 'fail' } })
    // The component should re-render with the new filter
  })

  it('handles refresh action', () => {
    const mockRefetch = jest.fn()
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    useGetProjectActivitiesQuery.mockReturnValue({
      data: createMockData([]),
      refetch: mockRefetch,
    })

    render(<Activity />)
    const refreshButton = screen.getByTestId('action-icon')
    fireEvent.click(refreshButton)
    expect(mockRefetch).toHaveBeenCalled()
  })
})
