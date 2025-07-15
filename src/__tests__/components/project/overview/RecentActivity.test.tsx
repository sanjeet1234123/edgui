// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import RecentActivity from '@/components/project/overview/RecentActivity'

// Mock the react-router hook
jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn().mockReturnValue({ projectId: 'test-project-id' }),
}))

// Mock the project queries hook
jest.mock('@/hooks/queries/useProjectQueries', () => ({
  useGetProjectActivitiesQuery: jest.fn(),
}))

// Mock CSS modules
jest.mock('@/components/project/overview/Overview.module.css', () => ({
  activity: 'activity-class',
  activityItem: 'activity-item-class',
  activityDescription: 'activity-description-class',
  activityTime: 'activity-time-class',
  cardTitle: 'card-title-class',
  cardDescription: 'card-description-class',
}))

describe('RecentActivity', () => {
  // Setup QueryClient for testing
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  // Helper function for rendering the component
  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <RecentActivity />
        </MantineProvider>
      </QueryClientProvider>,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with title and description', () => {
    // Mock empty data
    require('@/hooks/queries/useProjectQueries').useGetProjectActivitiesQuery.mockReturnValue(
      {
        data: { data: [] },
      },
    )

    renderComponent()

    // Check that the title and description are rendered
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(
      screen.getByText('Latest actions in this project'),
    ).toBeInTheDocument()
  })

  it('shows "No recent activity" message when data is empty', () => {
    // Mock empty data
    require('@/hooks/queries/useProjectQueries').useGetProjectActivitiesQuery.mockReturnValue(
      {
        data: { data: [] },
      },
    )

    renderComponent()

    // Check for no activity message
    expect(screen.getByText('No recent activity')).toBeInTheDocument()
  })

  it('renders activity items correctly without pagination when <= 3 items', () => {
    // Mock data with 3 items
    const mockActivities = [
      {
        activity_name: 'Activity 1',
        reason: 'Reason 1',
        name: 'User 1',
      },
      {
        activity_name: 'Activity 2',
        reason: 'Reason 2',
        name: 'User 2',
      },
      {
        activity_name: 'Activity 3',
        reason: 'Reason 3',
        name: 'User 3',
      },
    ]

    require('@/hooks/queries/useProjectQueries').useGetProjectActivitiesQuery.mockReturnValue(
      {
        data: { data: mockActivities },
      },
    )

    renderComponent()

    // Check that all activities are rendered
    expect(screen.getByText('Activity 1')).toBeInTheDocument()
    expect(screen.getByText('Reason 1')).toBeInTheDocument()
    expect(screen.getByText('created by User 1')).toBeInTheDocument()

    expect(screen.getByText('Activity 2')).toBeInTheDocument()
    expect(screen.getByText('Reason 2')).toBeInTheDocument()
    expect(screen.getByText('created by User 2')).toBeInTheDocument()

    expect(screen.getByText('Activity 3')).toBeInTheDocument()
    expect(screen.getByText('Reason 3')).toBeInTheDocument()
    expect(screen.getByText('created by User 3')).toBeInTheDocument()

    // Pagination should not be displayed
    expect(screen.queryByText('Showing 1 – 3 of 3')).not.toBeInTheDocument()
  })

  it('renders pagination correctly when > 3 items', () => {
    // Mock data with 5 items
    const mockActivities = [
      { activity_name: 'Activity 1', reason: 'Reason 1', name: 'User 1' },
      { activity_name: 'Activity 2', reason: 'Reason 2', name: 'User 2' },
      { activity_name: 'Activity 3', reason: 'Reason 3', name: 'User 3' },
      { activity_name: 'Activity 4', reason: 'Reason 4', name: 'User 4' },
      { activity_name: 'Activity 5', reason: 'Reason 5', name: 'User 5' },
    ]

    require('@/hooks/queries/useProjectQueries').useGetProjectActivitiesQuery.mockReturnValue(
      {
        data: { data: mockActivities },
      },
    )

    renderComponent()

    // First page should show the first 3 items
    expect(screen.getByText('Activity 1')).toBeInTheDocument()
    expect(screen.getByText('Activity 2')).toBeInTheDocument()
    expect(screen.getByText('Activity 3')).toBeInTheDocument()

    // Activity 4 and 5 should not be visible on first page
    expect(screen.queryByText('Activity 4')).not.toBeInTheDocument()
    expect(screen.queryByText('Activity 5')).not.toBeInTheDocument()

    // Pagination info should be displayed
    expect(screen.getByText('Showing 1 – 3 of 5')).toBeInTheDocument()
  })

  it('navigates to the next page when clicking pagination button', () => {
    // Mock data with 5 items
    const mockActivities = [
      { activity_name: 'Activity 1', reason: 'Reason 1', name: 'User 1' },
      { activity_name: 'Activity 2', reason: 'Reason 2', name: 'User 2' },
      { activity_name: 'Activity 3', reason: 'Reason 3', name: 'User 3' },
      { activity_name: 'Activity 4', reason: 'Reason 4', name: 'User 4' },
      { activity_name: 'Activity 5', reason: 'Reason 5', name: 'User 5' },
    ]

    require('@/hooks/queries/useProjectQueries').useGetProjectActivitiesQuery.mockReturnValue(
      {
        data: { data: mockActivities },
      },
    )

    renderComponent()

    // Find the next button (it's the only non-disabled button in the pagination)
    const buttons = document.querySelectorAll('button:not([disabled])')
    const nextButton = Array.from(buttons).find(
      button => button.closest('.mantine-Pagination-root') !== null,
    )

    // Click the next button
    fireEvent.click(nextButton)

    // After clicking next, Activity 4 and 5 should be visible
    expect(screen.getByText('Activity 4')).toBeInTheDocument()
    expect(screen.getByText('Activity 5')).toBeInTheDocument()

    // Activity 1, 2, and 3 should not be visible on second page
    expect(screen.queryByText('Activity 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Activity 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Activity 3')).not.toBeInTheDocument()

    // Pagination info should be updated
    expect(screen.getByText('Showing 4 – 5 of 5')).toBeInTheDocument()
  })

  it('handles missing activity data gracefully', () => {
    // Mock data with missing fields
    const mockActivities = [
      {
        // Missing activity_name
        reason: 'Reason without name',
        name: 'User 1',
      },
      {
        activity_name: 'Activity with no reason',
        // Missing reason
        name: 'User 2',
      },
      {
        activity_name: 'Activity with no user',
        reason: 'Reason without user',
        // Missing name
      },
    ]

    require('@/hooks/queries/useProjectQueries').useGetProjectActivitiesQuery.mockReturnValue(
      {
        data: { data: mockActivities },
      },
    )

    renderComponent()

    // Check that default values are used for missing fields
    expect(screen.getByText('No activity name')).toBeInTheDocument()
    expect(screen.getByText('Reason without name')).toBeInTheDocument()

    expect(screen.getByText('Activity with no reason')).toBeInTheDocument()
    expect(screen.getByText('No reason')).toBeInTheDocument()

    expect(screen.getByText('Activity with no user')).toBeInTheDocument()
    expect(screen.getByText('created by Unknown')).toBeInTheDocument()
  })
})
