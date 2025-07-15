// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectSelection from '@/components/userProfile/ProjectSelection'
import type { Project } from '@/types/headerType'

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

describe('ProjectSelection', () => {
  const mockProject: Project = { id: 1, name: 'Test Project' }
  const mockSetShowProjectsDropdown = jest.fn()
  const mockSetShowEnvDropdown = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with current project information', () => {
    render(
      <ProjectSelection
        currentProject={mockProject}
        showProjectsDropdown={false}
        setShowProjectsDropdown={mockSetShowProjectsDropdown}
        setShowEnvDropdown={mockSetShowEnvDropdown}
      />
    )
    
    // Check if project name is displayed correctly
    expect(screen.getByText(/Project - Test Project/)).toBeTruthy()
    
    // Check if project ID is displayed correctly
    expect(screen.getByText(/Project ID: 1/)).toBeTruthy()
    
    // Check if the action icon is rendered
    expect(screen.getByTestId('action-icon')).toBeTruthy()
  })

  it('handles null project gracefully', () => {
    render(
      <ProjectSelection
        currentProject={null}
        showProjectsDropdown={false}
        setShowProjectsDropdown={mockSetShowProjectsDropdown}
        setShowEnvDropdown={mockSetShowEnvDropdown}
      />
    )
    
    // Check if project name displays "None" when project is null
    expect(screen.getByText(/Project - None/)).toBeTruthy()
    
    // Check if project ID displays "N/A" when project is null
    expect(screen.getByText(/Project ID: N\/A/)).toBeTruthy()
  })

  it('toggles projects dropdown and closes environment dropdown when clicked', () => {
    render(
      <ProjectSelection
        currentProject={mockProject}
        showProjectsDropdown={false}
        setShowProjectsDropdown={mockSetShowProjectsDropdown}
        setShowEnvDropdown={mockSetShowEnvDropdown}
      />
    )
    
    // Click the action icon to toggle dropdown
    fireEvent.click(screen.getByTestId('action-icon'))
    
    // Check if the setShowProjectsDropdown was called with the correct value
    expect(mockSetShowProjectsDropdown).toHaveBeenCalledWith(true)
    
    // Check if setShowEnvDropdown was called to close environment dropdown
    expect(mockSetShowEnvDropdown).toHaveBeenCalledWith(false)
  })

  it('closes projects dropdown when it was already open', () => {
    render(
      <ProjectSelection
        currentProject={mockProject}
        showProjectsDropdown={true}
        setShowProjectsDropdown={mockSetShowProjectsDropdown}
        setShowEnvDropdown={mockSetShowEnvDropdown}
      />
    )
    
    // Click the action icon to toggle dropdown
    fireEvent.click(screen.getByTestId('action-icon'))
    
    // Check if the setShowProjectsDropdown was called with the correct value
    expect(mockSetShowProjectsDropdown).toHaveBeenCalledWith(false)
    
    // Check if setShowEnvDropdown was still called
    expect(mockSetShowEnvDropdown).toHaveBeenCalledWith(false)
  })
}) 