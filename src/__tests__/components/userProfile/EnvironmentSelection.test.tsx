// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import EnvironmentSelection from '@/components/userProfile/EnvironmentSelection'
import type { Environment } from '@/types/headerType'

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  ActionIcon: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button data-testid="action-icon" onClick={onClick}>
      {children}
    </button>
  ),
  Text: ({ children, classNames }: { children: React.ReactNode; classNames?: any }) => (
    <div data-testid="text">{children}</div>
  ),
  Stack: ({ children, gap }: { children: React.ReactNode; gap: number | string }) => (
    <div data-testid="stack">{children}</div>
  ),
  Group: ({ children, justify }: { children: React.ReactNode; justify: string }) => (
    <div data-testid="group">{children}</div>
  ),
}))

// Mock the Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconChevronRight: ({ size }: { size: number }) => (
    <div data-testid="icon-chevron-right" style={{ width: size, height: size }}>
      Chevron Right Icon
    </div>
  ),
}))

// Mock CSS module
jest.mock('@/components/userProfile/userProfile.module.css', () => ({
  projectText: 'mock-project-text',
  projectValue: 'mock-project-value',
}))

describe('EnvironmentSelection', () => {
  const mockCurrentEnvironment: Environment = 'development'
  const mockSetShowEnvDropdown = jest.fn()
  const mockSetShowProjectsDropdown = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with the current environment', () => {
    render(
      <EnvironmentSelection
        currentEnvironment={mockCurrentEnvironment}
        showEnvDropdown={false}
        setShowEnvDropdown={mockSetShowEnvDropdown}
        setShowProjectsDropdown={mockSetShowProjectsDropdown}
      />
    )
    
    // Check if the component renders the title correctly
    expect(screen.getByText('Project Environment')).toBeTruthy()
    
    // Check if the component displays the current environment
    expect(screen.getByText('development')).toBeTruthy()
    
    // Check if the action icon (button) is rendered
    expect(screen.getByTestId('action-icon')).toBeTruthy()
  })

  it('toggles environment dropdown and closes projects dropdown when clicked', () => {
    render(
      <EnvironmentSelection
        currentEnvironment={mockCurrentEnvironment}
        showEnvDropdown={false}
        setShowEnvDropdown={mockSetShowEnvDropdown}
        setShowProjectsDropdown={mockSetShowProjectsDropdown}
      />
    )
    
    // Click the action icon to toggle dropdown
    fireEvent.click(screen.getByTestId('action-icon'))
    
    // Check if the setShowEnvDropdown was called with the correct value
    expect(mockSetShowEnvDropdown).toHaveBeenCalledWith(true)
    
    // Check if setShowProjectsDropdown was called to close projects dropdown
    expect(mockSetShowProjectsDropdown).toHaveBeenCalledWith(false)
  })

  it('closes environment dropdown when it was already open', () => {
    render(
      <EnvironmentSelection
        currentEnvironment={mockCurrentEnvironment}
        showEnvDropdown={true}
        setShowEnvDropdown={mockSetShowEnvDropdown}
        setShowProjectsDropdown={mockSetShowProjectsDropdown}
      />
    )
    
    // Click the action icon to toggle dropdown
    fireEvent.click(screen.getByTestId('action-icon'))
    
    // Check if the setShowEnvDropdown was called with the correct value
    expect(mockSetShowEnvDropdown).toHaveBeenCalledWith(false)
    
    // Check if setShowProjectsDropdown was still called
    expect(mockSetShowProjectsDropdown).toHaveBeenCalledWith(false)
  })
}) 