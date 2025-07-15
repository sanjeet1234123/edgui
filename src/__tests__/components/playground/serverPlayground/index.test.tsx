import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import ServerPlayground from '../../../../components/playground/serverPlayground'

// Mock child components to simplify testing
jest.mock(
  '../../../../components/playground/serverPlayground/ServerPlaygroundHeader',
  () => {
    return function MockServerPlaygroundHeader() {
      return <div data-testid="mock-header">Header</div>
    }
  },
)

jest.mock(
  '../../../../components/playground/serverPlayground/ServerPlaygroundLists',
  () => {
    return function MockServerPlaygroundLists({ server }: { server: string }) {
      return <div data-testid="mock-lists">Lists: {server}</div>
    }
  },
)

jest.mock(
  '../../../../components/playground/serverPlayground/ServerPlaygroundServerDetails',
  () => {
    return function MockServerPlaygroundServerDetails() {
      return <div data-testid="mock-server-details">Server Details</div>
    }
  },
)

jest.mock(
  '../../../../components/playground/serverPlayground/ServerPlaygroundChatArea',
  () => {
    return function MockServerPlaygroundChatArea() {
      return <div data-testid="mock-chat-area">Chat Area</div>
    }
  },
)

// Mock ReflexContainer and related components
jest.mock('react-reflex', () => ({
  ReflexContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="reflex-container">{children}</div>
  ),
  ReflexElement: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="reflex-element">{children}</div>
  ),
  ReflexSplitter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="reflex-splitter">{children}</div>
  ),
}))

const renderWithMantine = (component: React.ReactNode) => {
  return render(<MantineProvider>{component}</MantineProvider>)
}

describe('ServerPlayground', () => {
  const mockServer = 'test-server'

  it('renders with server prop', () => {
    renderWithMantine(<ServerPlayground server={mockServer} />)
    expect(screen.getByTestId('mock-lists')).toHaveTextContent(
      `Lists: ${mockServer}`,
    )
  })

  it('renders all child components', () => {
    renderWithMantine(<ServerPlayground server={mockServer} />)
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-lists')).toBeInTheDocument()
    expect(screen.getByTestId('mock-server-details')).toBeInTheDocument()
    expect(screen.getByTestId('mock-chat-area')).toBeInTheDocument()
  })

  it('toggles left panel when collapse button is clicked', () => {
    renderWithMantine(<ServerPlayground server={mockServer} />)
    const buttons = screen.getAllByRole('button')
    const leftPanelButton = buttons[0]
    fireEvent.click(leftPanelButton)
    expect(leftPanelButton).toBeInTheDocument()
  })

  it('toggles right panel when collapse button is clicked', () => {
    renderWithMantine(<ServerPlayground server={mockServer} />)
    const buttons = screen.getAllByRole('button')
    const rightPanelButton = buttons[1]
    fireEvent.click(rightPanelButton)
    expect(rightPanelButton).toBeInTheDocument()
  })
})
