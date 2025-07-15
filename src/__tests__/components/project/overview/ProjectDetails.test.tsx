// @ts-nocheck
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MantineProvider } from '@mantine/core'
import ProjectDetails from '@/components/project/overview/ProjectDetails'

// Mock the necessary dependencies
jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ projectId: '123' }),
}))

// Mock the formatProjectDate function from commonFunction
jest.mock('@/utils/commonFunction', () => ({
  formatProjectDate: jest.fn().mockImplementation(date => {
    if (!date) return 'date unknown'
    return 'created 2 days ago'
  }),
}))

// Mock the CSS module
jest.mock('@/components/project/overview/Overview.module.css', () => ({
  cardTitle: 'cardTitle',
  cardDescription: 'cardDescription',
  cardLabel: 'cardLabel',
  cardInput: 'cardInput',
}))

// Mock the Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconClock: () => <div data-testid="clock-icon">Clock Icon</div>,
}))

// Mock the project query hook
jest.mock('@/hooks/queries/useProjectQueries', () => ({
  useGetProjectQuery: jest.fn(),
}))

import { useGetProjectQuery } from '@/hooks/queries/useProjectQueries'

describe('ProjectDetails', () => {
  const renderComponent = (mockData = {}, isLoading = false) => {
    useGetProjectQuery.mockReturnValue({
      data: mockData,
      isLoading,
    })

    return render(
      <MantineProvider>
        <ProjectDetails />
      </MantineProvider>,
    )
  }

  it('renders loading overlay when data is loading', () => {
    renderComponent({}, true)

    const loadingOverlay = document.querySelector(
      '.mantine-LoadingOverlay-root',
    )
    expect(loadingOverlay).toBeInTheDocument()
  })

  it('renders the component with correct title and description', () => {
    renderComponent({})

    expect(screen.getByText('Project Details')).toBeInTheDocument()
    expect(
      screen.getByText('Basic information about your project'),
    ).toBeInTheDocument()
  })

  it('renders project data when available', () => {
    const mockData = {
      project: {
        name: 'Test Project',
        description: 'This is a test project description',
        created_at: '2023-01-01T12:00:00Z',
      },
    }

    renderComponent(mockData)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(
      screen.getByText('This is a test project description'),
    ).toBeInTheDocument()
    expect(screen.getByText('created 2 days ago')).toBeInTheDocument()
  })

  it('handles missing project data gracefully', () => {
    renderComponent({ project: null })

    expect(screen.getByText('No name provided')).toBeInTheDocument()
    expect(screen.getByText('No description provided')).toBeInTheDocument()
    expect(screen.getByText('date unknown')).toBeInTheDocument()
  })

  it('handles missing project name and description gracefully', () => {
    const mockData = {
      project: {
        created_at: '2023-01-01T12:00:00Z',
      },
    }

    renderComponent(mockData)

    expect(screen.getByText('No name provided')).toBeInTheDocument()
    expect(screen.getByText('No description provided')).toBeInTheDocument()
    expect(screen.getByText('created 2 days ago')).toBeInTheDocument()
  })

  it('renders the clock icon for creation date', () => {
    renderComponent({
      project: {
        name: 'Test Project',
        created_at: '2023-01-01T12:00:00Z',
      },
    })

    expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
  })

  it('applies correct CSS classes to elements', () => {
    renderComponent({
      project: {
        name: 'Test Project',
        description: 'Test description',
        created_at: '2023-01-01T12:00:00Z',
      },
    })

    const title = screen.getByText('Project Details')
    expect(title.className).toContain('cardTitle')

    const description = screen.getByText('Basic information about your project')
    expect(description.className).toContain('cardDescription')

    const nameLabel = screen.getByText('Name')
    expect(nameLabel.className).toContain('cardLabel')

    const descriptionLabel = screen.getByText('Description')
    expect(descriptionLabel.className).toContain('cardLabel')

    const projectName = screen.getByText('Test Project')
    expect(projectName.className).toContain('cardInput')

    const projectDescription = screen.getByText('Test description')
    expect(projectDescription.className).toContain('cardInput')
  })
})
