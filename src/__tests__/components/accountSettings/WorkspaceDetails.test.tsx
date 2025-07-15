// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import WorkspaceDetails from '@/components/accountSettings/WorkspaceDetails'

// Mock the CSS module
jest.mock('@/components/accountSettings/accountSettings.module.css', () => ({
  cardTitle: 'cardTitle-class',
  cardDescription: 'cardDescription-class',
  cardLabel: 'cardLabel-class',
  cardInput: 'cardInput-class',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Title: ({ children, order, className }) => (
    <h1 data-order={order} className={className}>
      {children}
    </h1>
  ),
  Stack: ({ children, gap, h }) => (
    <div data-testid="stack" data-gap={gap} data-height={h}>
      {children}
    </div>
  ),
  Card: ({ children, radius, w }) => (
    <div data-testid="card" data-radius={radius} data-width={w}>
      {children}
    </div>
  ),
  Text: ({ children, className }) => (
    <span className={className}>{children}</span>
  ),
  Group: ({ children, justify }) => (
    <div data-justify={justify}>{children}</div>
  ),
  ActionIcon: ({ children, color, variant, onClick }) => (
    <button
      data-color={color}
      data-variant={variant}
      onClick={onClick}
      data-testid="action-icon"
    >
      {children}
    </button>
  ),
  Tooltip: ({ children, label, withArrow, position }) => (
    <div data-label={label} data-arrow={withArrow} data-position={position}>
      {children}
    </div>
  ),
  CopyButton: ({ children, value, timeout }) => (
    <div data-value={value} data-timeout={timeout}>
      {children({ copied: false, copy: jest.fn() })}
    </div>
  ),
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconCheck: () => <div data-testid="check-icon">Check Icon</div>,
  IconCopy: () => <div data-testid="copy-icon">Copy Icon</div>,
}))

describe('WorkspaceDetails', () => {
  const mockWorkspaceId = 'test-workspace-123'

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Set up the workspace ID
    localStorage.setItem('workspace_id', mockWorkspaceId)
  })

  it('renders the workspace details card with correct title and description', () => {
    render(<WorkspaceDetails />)

    expect(screen.getByText('Workspace Details')).toBeInTheDocument()
    expect(
      screen.getByText('Basic information about your workspace'),
    ).toBeInTheDocument()
  })

  it('displays the workspace name from localStorage', () => {
    render(<WorkspaceDetails />)

    expect(screen.getByText(mockWorkspaceId)).toBeInTheDocument()
  })

  it('displays the workspace URL correctly', () => {
    render(<WorkspaceDetails />)

    const expectedUrl = `${mockWorkspaceId}.nexastack.neuralcompany.work`
    expect(screen.getByText(expectedUrl)).toBeInTheDocument()
  })

  it('shows "No name provided" when workspace ID is not in localStorage', () => {
    localStorage.clear()
    render(<WorkspaceDetails />)

    expect(screen.getByText('No name provided')).toBeInTheDocument()
  })

  it('renders the copy button with correct tooltip', () => {
    render(<WorkspaceDetails />)

    const copyButton = screen.getByTestId('action-icon')
    expect(copyButton).toBeInTheDocument()
    expect(copyButton).toHaveAttribute('data-variant', 'subtle')
  })

  it('renders the copy icon initially', () => {
    render(<WorkspaceDetails />)

    expect(screen.getByTestId('copy-icon')).toBeInTheDocument()
  })

  it('has correct card styling', () => {
    render(<WorkspaceDetails />)

    const card = screen.getByTestId('card')
    expect(card).toHaveAttribute('data-radius', 'md')
    expect(card).toHaveAttribute('data-width', '100%')
  })

  it('has correct stack layout', () => {
    render(<WorkspaceDetails />)

    const mainStack = screen.getAllByTestId('stack')[0]
    expect(mainStack).toHaveAttribute('data-height', '100%')
  })
})
