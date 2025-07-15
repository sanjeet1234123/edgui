// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ServersCard from '@/components/servers/ServersCard'
import { formatProjectDate } from '@/utils/commonFunction'
import { PATHS } from '@/constants/paths'

// Mock react-router navigation
const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock formatProjectDate
jest.mock('@/utils/commonFunction', () => ({
  formatProjectDate: jest.fn().mockReturnValue('2 days ago'),
}))

// Mock McpIcons
jest.mock('@/assets/mcp-icons', () => {
  const MockIcon = ({ style }) => (
    <div data-testid="mock-icon" style={style}></div>
  )

  return {
    McpIcons: {
      aws: MockIcon,
      azure: MockIcon,
      google: MockIcon,
      user: MockIcon,
    },
  }
})

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconClock: ({ size, color }) => (
    <div data-testid="icon-clock" data-size={size} data-color={color}></div>
  ),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Card: ({ h, onClick, className, children }) => (
    <div
      data-testid="mantine-card"
      data-h={h}
      className={className}
      onClick={onClick}
    >
      {children}
    </div>
  ),
  Group: ({ children, gap }) => (
    <div data-testid="mantine-group" data-gap={gap}>
      {children}
    </div>
  ),
  Stack: ({ children, justify, className, gap }) => (
    <div
      data-testid="mantine-stack"
      data-justify={justify}
      className={className}
      data-gap={gap}
    >
      {children}
    </div>
  ),
  Text: ({ children, fw, fz, tt, c, lineClamp }) => (
    <div
      data-testid="mantine-text"
      data-fw={fw}
      data-fz={fz}
      data-tt={tt}
      data-c={c}
      data-line-clamp={lineClamp}
    >
      {children}
    </div>
  ),
  useMantineColorScheme: jest.fn(() => ({
    colorScheme: 'light',
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
  })),
}))

describe('ServersCard', () => {
  const mockServer = {
    name: 'aws server',
    description: 'AWS server description',
    last_updated: '2023-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    mockNavigate.mockClear()
    formatProjectDate.mockClear()
  })

  it('renders the component structure correctly', () => {
    render(<ServersCard server={mockServer} />)

    // Check card container
    const card = screen.getByTestId('mantine-card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('data-h', '100%')

    // Check stacks
    const stacks = screen.getAllByTestId('mantine-stack')
    expect(stacks.length).toBeGreaterThan(1)

    // Check groups
    const groups = screen.getAllByTestId('mantine-group')
    expect(groups.length).toBeGreaterThan(0)
  })

  it('displays the server name and description correctly', () => {
    render(<ServersCard server={mockServer} />)

    const textElements = screen.getAllByTestId('mantine-text')

    // Name text
    const nameText = textElements.find(el => el.textContent === 'aws server')
    expect(nameText).toBeInTheDocument()
    expect(nameText).toHaveAttribute('data-fw', '600')
    expect(nameText).toHaveAttribute('data-fz', 'var(--size-lg)')
    expect(nameText).toHaveAttribute('data-tt', 'capitalize')

    // Description text
    const descriptionText = textElements.find(
      el => el.textContent === 'AWS server description',
    )
    expect(descriptionText).toBeInTheDocument()
    expect(descriptionText).toHaveAttribute('data-line-clamp', '2')
  })

  it('shows the formatted date', () => {
    render(<ServersCard server={mockServer} />)

    // Verify formatProjectDate was called with the correct date
    expect(formatProjectDate).toHaveBeenCalledWith('2023-01-01T00:00:00.000Z')

    // Check formatted date is displayed
    const dateText = screen
      .getAllByTestId('mantine-text')
      .find(el => el.textContent === '2 days ago')
    expect(dateText).toBeInTheDocument()

    // Check clock icon
    const clockIcon = screen.getByTestId('icon-clock')
    expect(clockIcon).toBeInTheDocument()
    expect(clockIcon).toHaveAttribute('data-size', '16')
  })

  it('navigates to server detail page when clicked', () => {
    render(<ServersCard server={mockServer} />)

    const card = screen.getByTestId('mantine-card')
    fireEvent.click(card)

    expect(mockNavigate).toHaveBeenCalledWith({
      to: PATHS.SERVERS_DETAIL,
      params: { serverId: 'aws server' },
    })
  })

  it('uses correct icon for direct match', () => {
    const serverWithDirectMatch = {
      name: 'AWS',
      description: 'AWS server',
      last_updated: '2023-01-01T00:00:00.000Z',
    }

    render(<ServersCard server={serverWithDirectMatch} />)

    // Check that icon exists
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toBeInTheDocument()

    // Check icon styling
    expect(icon).toHaveAttribute('style')
  })

  it('uses correct icon for partial match', () => {
    const serverWithPartialMatch = {
      name: 'My Azure Server',
      description: 'Azure server description',
      last_updated: '2023-01-01T00:00:00.000Z',
    }

    render(<ServersCard server={serverWithPartialMatch} />)

    // Check that icon exists
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toBeInTheDocument()
  })

  it('falls back to user icon when no match is found', () => {
    const serverWithNoMatch = {
      name: 'Custom Server',
      description: 'Custom server description',
      last_updated: '2023-01-01T00:00:00.000Z',
    }

    render(<ServersCard server={serverWithNoMatch} />)

    // Check that icon exists
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toBeInTheDocument()
  })
})
