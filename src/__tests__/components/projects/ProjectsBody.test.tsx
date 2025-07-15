// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectsBody from '../../../components/projects/ProjectsBody'
import { MantineProvider } from '@mantine/core'

jest.mock('@/constants/endpoint', () => 'http://localhost/v1')

// Mock useDisclosure hook and other required Mantine hooks
jest.mock('@mantine/hooks', () => ({
  useDisclosure: jest.fn(() => {
    const [opened, setOpened] = require('react').useState(false)
    return [
      opened,
      {
        open: () => setOpened(true),
        close: () => setOpened(false),
      },
    ]
  }),
  useIsomorphicEffect: jest.fn((effect, deps) => {
    // Mock implementation that acts like useEffect
    const { useEffect } = require('react')
    return useEffect(effect, deps)
  }),
  useMediaQuery: jest.fn(() => false),
  useViewportSize: jest.fn(() => ({ width: 1024, height: 768 })),
  useReducedMotion: jest.fn(() => false),
  useOs: jest.fn(() => 'undetermined'),
  useColorScheme: jest.fn(() => 'light'),
  useLocalStorage: jest.fn(() => [null, jest.fn()]),
  useSessionStorage: jest.fn(() => [null, jest.fn()]),
  useDidUpdate: jest.fn(),
  useTimeout: jest.fn(() => ({ start: jest.fn(), clear: jest.fn() })),
  usePrevious: jest.fn(),
  useUncontrolled: jest.fn(),
  useId: jest.fn(() => 'test-id'),
  useMergedRef: jest.fn(() => jest.fn()),
  useClickOutside: jest.fn(),
  useFocusTrap: jest.fn(),
  useHotkeys: jest.fn(),
  useWindowEvent: jest.fn(),
  usePageLeave: jest.fn(),
  useNetwork: jest.fn(() => ({ online: true })),
  useInterval: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    toggle: jest.fn(),
    active: false,
  })),
}))

// Mock AddProjectsModal and ProjectsCard to add test IDs
jest.mock(
  '../../../components/projects/AddProjectsModal',
  () => (props: any) =>
    props.opened ? (
      <div data-testid="add-projects-modal">Modal is open</div>
    ) : null,
)
jest.mock('../../../components/projects/ProjectsCard', () => (props: any) => (
  <div data-testid="projects-card">{props.project.name}</div>
))

describe('ProjectsBody', () => {
  const emptyData = { project: [] }
  const projectsData = {
    project: [
      {
        id: '1',
        name: 'Project One',
        description: '',
        created_at: '2024-01-01',
        created_by: '',
        deleted_at: null,
        environment: '',
        members: [],
        status: '',
        updated_at: '',
        workspace_id: '',
        organization_id: '',
        project_id: '',
        updated_by: '',
      },
      {
        id: '2',
        name: 'Project Two',
        description: '',
        created_at: '2024-01-02',
        created_by: '',
        deleted_at: null,
        environment: '',
        members: [],
        status: '',
        updated_at: '',
        workspace_id: '',
        organization_id: '',
        project_id: '',
        updated_by: '',
      },
    ],
  }

  it('shows empty state and opens modal on button click', () => {
    render(
      <MantineProvider>
        <ProjectsBody data={emptyData} />
      </MantineProvider>,
    )
    expect(screen.getByText(/no projects found/i)).toBeInTheDocument()
    const btn = screen.getByRole('button', {
      name: /create your first project/i,
    })
    fireEvent.click(btn)
    expect(screen.getByTestId('add-projects-modal')).toBeInTheDocument()
  })

  it('renders project cards when data is present', () => {
    render(
      <MantineProvider>
        <ProjectsBody data={projectsData} />
      </MantineProvider>,
    )
    expect(screen.getAllByTestId('projects-card')).toHaveLength(2)
    expect(screen.getByText('Project One')).toBeInTheDocument()
    expect(screen.getByText('Project Two')).toBeInTheDocument()
  })
})
