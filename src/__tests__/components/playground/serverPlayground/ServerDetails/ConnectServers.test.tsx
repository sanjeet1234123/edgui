// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConnectServers from '@/components/playground/serverPlayground/ServerDetails/ConnectServers'

// Mock the serverDetails.module.css
jest.mock(
  '@/components/playground/serverPlayground/ServerDetails/serverDetails.module.css',
  () => ({
    Heading: 'heading-class',
  }),
)

// Mock CodeMirror
jest.mock('@uiw/react-codemirror', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }) => (
    <textarea
      data-testid="codemirror"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange?.(e.target.value)}
    />
  ),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, type, leftSection }) => (
    <button data-testid="submit-button" type={type}>
      {leftSection}
      {children}
    </button>
  ),
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  Group: ({ children, gap }) => <div data-gap={gap}>{children}</div>,
  Stack: ({ children, 'data-testid': dataTestId }) => (
    <div data-testid={dataTestId || 'stack'}>{children}</div>
  ),
  Text: ({ children, className }) => (
    <span className={className}>{children}</span>
  ),
  TextInput: ({ label, placeholder, required, ...props }) => (
    <input
      data-testid={`input-${label}`}
      placeholder={placeholder}
      required={required}
      {...props}
    />
  ),
  useMantineColorScheme: () => ({ colorScheme: 'light' }), // <-- Mocked hook
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  SquarePlus: () => <div data-testid="square-plus-icon">SquarePlus Icon</div>,
  PlugZap: () => <div data-testid="plug-zap-icon">PlugZap Icon</div>,
  FilePen: () => <div data-testid="file-pen-icon">FilePen Icon</div>,
}))

describe('ConnectServers', () => {
  it('renders the component with correct title and icon', () => {
    render(
      <ConnectServers
        serverConfig={{ env: { API_KEY: 'API Key', SECRET_KEY: 'Secret Key' } }}
        serverName="test-server"
        configValue="{}"
        onConfigChange={jest.fn()}
      />,
    )
    expect(screen.getByText('Edit Configuration')).toBeInTheDocument()
    expect(screen.getByTestId('connect-servers')).toBeInTheDocument()
    expect(screen.getByTestId('file-pen-icon')).toBeInTheDocument()
  })

  it('renders the code editor', () => {
    render(
      <ConnectServers
        serverConfig={{ env: { API_KEY: 'API Key' } }}
        serverName="test-server"
        configValue='{"API_KEY":"123"}'
        onConfigChange={jest.fn()}
      />,
    )
    expect(screen.getByTestId('codemirror')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(
        'Please enter the server configuration in JSON format',
      ),
    ).toBeInTheDocument()
  })

  it('calls onConfigChange when code editor changes', () => {
    const mockOnConfigChange = jest.fn()
    render(
      <ConnectServers
        serverConfig={{ env: { API_KEY: 'API Key' } }}
        serverName="test-server"
        configValue="{}"
        onConfigChange={mockOnConfigChange}
      />,
    )
    const codeMirror = screen.getByTestId('codemirror')
    fireEvent.change(codeMirror, { target: { value: '{"API_KEY":"new-key"}' } })
    expect(mockOnConfigChange).toHaveBeenCalledWith(
      'test-server',
      '{"API_KEY":"new-key"}',
    )
  })
})
