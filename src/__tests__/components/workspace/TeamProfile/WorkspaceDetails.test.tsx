// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import React from 'react'
import WorkspaceDetails from '@/components/workspace/TeamProfile/WorkspaceDetails'

// Mock CSS modules
jest.mock('@/components/workspace/TeamProfile/teamProfile.module.css', () => ({
  cardTitle: 'cardTitle-class',
  cardDescription: 'cardDescription-class',
  cardLabel: 'cardLabel-class',
  cardInput: 'cardInput-class',
}))

// Create mock functions for CopyButton
const mockCopy = jest.fn()
let mockCopied = false

// Mock Mantine's CopyButton behavior
jest.mock('@mantine/core', () => {
  const originalModule = jest.requireActual('@mantine/core')
  return {
    ...originalModule,
    CopyButton: ({ value, timeout, children }) => {
      return (
        <div data-testid="copy-button">
          {children({ copied: mockCopied, copy: mockCopy })}
        </div>
      )
    },
    Tooltip: ({ label, children, ...props }) => (
      <div data-testid={`tooltip-${label}`} data-label={label}>
        {children}
      </div>
    ),
  }
})

describe('WorkspaceDetails', () => {
  // Save original localStorage
  const originalLocalStorage = global.localStorage

  beforeEach(() => {
    // Reset mocks
    mockCopied = false
    mockCopy.mockClear()
  })

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    })
  })

  it('renders the workspace details card with correct title', () => {
    // Setup mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('test-workspace'),
      },
      writable: true,
    })

    render(
      <MantineProvider>
        <WorkspaceDetails />
      </MantineProvider>,
    )

    // Check that the card title is rendered
    expect(screen.getByText('Workspace Details')).toBeInTheDocument()
    expect(
      screen.getByText('Basic information about your workspace'),
    ).toBeInTheDocument()
  })

  it('displays the workspace name from localStorage', () => {
    // Setup mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('test-workspace'),
      },
      writable: true,
    })

    render(
      <MantineProvider>
        <WorkspaceDetails />
      </MantineProvider>,
    )

    // Check that localStorage was called to get the workspace_id
    expect(window.localStorage.getItem).toHaveBeenCalledWith('workspace_id')

    // Check that the workspace name is displayed
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('test-workspace')).toBeInTheDocument()
  })

  it('displays fallback text when workspace_id is not available', () => {
    // Setup mock localStorage with null return value
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
      },
      writable: true,
    })

    render(
      <MantineProvider>
        <WorkspaceDetails />
      </MantineProvider>,
    )

    // Check that the fallback text is displayed
    expect(screen.getByText('No name provided')).toBeInTheDocument()
  })

  it('displays the workspace URL correctly', () => {
    // Setup mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('test-workspace'),
      },
      writable: true,
    })

    render(
      <MantineProvider>
        <WorkspaceDetails />
      </MantineProvider>,
    )

    // Check that the workspace URL label is displayed
    expect(screen.getByText('Workspace URL')).toBeInTheDocument()

    // Since the workspace_id is mocked to return 'test-workspace'
    const urlText = screen.getAllByText(
      /test-workspace\.nexastack\.neuralcompany\.work/i,
    )
    expect(urlText.length).toBeGreaterThan(0)
  })

  it('renders a copy button for the workspace URL', () => {
    // Setup mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('test-workspace'),
      },
      writable: true,
    })

    render(
      <MantineProvider>
        <WorkspaceDetails />
      </MantineProvider>,
    )

    // Check that the copy button is rendered
    expect(screen.getByTestId('copy-button')).toBeInTheDocument()

    // Check tooltip is present with correct label
    const tooltip = screen.getByTestId('tooltip-Copy')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveAttribute('data-label', 'Copy')
  })

  it('shows different icons based on copied state', () => {
    // Setup mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('test-workspace'),
      },
      writable: true,
    })

    // First render with default state (not copied)
    const { rerender } = render(
      <MantineProvider>
        <WorkspaceDetails />
      </MantineProvider>,
    )

    // Check copy icon is present when not copied
    expect(screen.getByTestId('copy-button')).toBeInTheDocument()
    expect(document.querySelector('svg.tabler-icon-copy')).toBeInTheDocument()

    // Update mock to show copied state
    mockCopied = true

    // Re-render the component with the updated mock
    rerender(
      <MantineProvider>
        <WorkspaceDetails />
      </MantineProvider>,
    )

    // After copying, the check icon should be shown
    expect(document.querySelector('svg.tabler-icon-check')).toBeInTheDocument()
  })
})
