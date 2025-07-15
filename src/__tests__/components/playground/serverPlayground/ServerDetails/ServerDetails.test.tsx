// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import ServerDetails from '@/components/playground/serverPlayground/ServerDetails/ServerDetails'
import { useSelectedServersStore } from '@/store/selectedServersStore'
import { McpIcons } from '@/assets/mcp-icons'

// Mock the store
jest.mock('@/store/selectedServersStore', () => ({
  useSelectedServersStore: jest.fn(),
}))

// Mock window.open
const mockOpen = jest.fn()
window.open = mockOpen

const renderWithProvider = ui => render(<MantineProvider>{ui}</MantineProvider>)

describe('ServerDetails', () => {
  const mockServer = {
    name: 'Test Server',
    description:
      'This is a test server description that is quite long and should be truncated after two lines',
    last_updated: '2024-03-20T10:00:00Z',
    characteristics: {
      repository: 'https://github.com/test/repo',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useSelectedServersStore.mockReturnValue({
      selectedServers: [mockServer],
    })
  })

  it('renders server name and description correctly', () => {
    renderWithProvider(<ServerDetails server={mockServer} />)

    expect(screen.getByText('Test Server')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This is a test server description that is quite long and should be truncated after two lines',
      ),
    ).toBeInTheDocument()
  })

  it('renders default icon when no matching icon is found', () => {
    renderWithProvider(<ServerDetails server={mockServer} />)

    const iconElement = document.querySelector('svg')
    expect(iconElement).toBeInTheDocument()
  })

  it('renders matching icon when server name matches an icon key', () => {
    const serverWithMatchingIcon = {
      ...mockServer,
      name: 'user', // This should match one of the McpIcons keys
    }

    renderWithProvider(<ServerDetails server={serverWithMatchingIcon} />)

    const iconElement = document.querySelector('svg')
    expect(iconElement).toBeInTheDocument()
  })

  it('opens repository link in new tab when GitHub icon is clicked', () => {
    renderWithProvider(<ServerDetails server={mockServer} />)

    const githubButton = screen.getByRole('button')
    fireEvent.click(githubButton)

    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/test/repo',
      '_blank',
    )
  })

  it('displays formatted creation date', () => {
    renderWithProvider(<ServerDetails server={mockServer} />)

    expect(screen.getByText(/Created/)).toBeInTheDocument()
  })

  it('handles missing repository URL gracefully', () => {
    const serverWithoutRepo = {
      ...mockServer,
      characteristics: {
        repository: '',
      },
    }
    useSelectedServersStore.mockReturnValue({
      selectedServers: [serverWithoutRepo],
    })
    renderWithProvider(<ServerDetails server={serverWithoutRepo} />)
    const githubButton = screen.getByRole('button')
    fireEvent.click(githubButton)
    expect(mockOpen).toHaveBeenCalledWith('', '_blank')
  })

  it('handles missing last_updated date gracefully', () => {
    const serverWithoutDate = {
      ...mockServer,
      last_updated: '',
    }

    useSelectedServersStore.mockReturnValue({
      selectedServers: [serverWithoutDate],
    })

    renderWithProvider(<ServerDetails server={serverWithoutDate} />)

    expect(screen.getByText(/Created/)).toBeInTheDocument()
  })
})
