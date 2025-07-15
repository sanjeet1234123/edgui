// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Overview from '../../../../components/project/overview/Overview'

// Mock the router hook
jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ projectId: 'test-project-id' }),
}))

// Mock the subcomponents to isolate testing for Overview
jest.mock('../../../../components/project/overview/ProjectDetails', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="project-details">Project Details Component</div>
  ),
}))

jest.mock('../../../../components/project/overview/TeamMembers', () => ({
  __esModule: true,
  default: () => <div data-testid="team-members">Team Members Component</div>,
}))

jest.mock('../../../../components/project/overview/Environments', () => ({
  __esModule: true,
  default: () => <div data-testid="environments">Environments Component</div>,
}))

jest.mock('../../../../components/project/overview/RecentActivity', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="recent-activity">Recent Activity Component</div>
  ),
}))

// Mock the Mantine Grid component
jest.mock('@mantine/core', () => ({
  __esModule: true,
  Grid: ({ children, gutter }) => (
    <div data-testid="grid" data-gutter={gutter}>
      {children}
    </div>
  ),
  GridCol: ({ children, span }) => (
    <div data-testid="grid-col" data-span={JSON.stringify(span)}>
      {children}
    </div>
  ),
}))

// Patch Grid.Col to point to GridCol for the test
import * as MantineCore from '@mantine/core'
MantineCore.Grid.Col = MantineCore.GridCol

describe('Overview Component', () => {
  it('renders the component with all its sections', () => {
    render(<Overview />)

    // Check if the Grid component is rendered
    expect(screen.getByTestId('grid')).toBeInTheDocument()

    // Check if all Grid.Col components are rendered
    const gridCols = screen.getAllByTestId('grid-col')
    expect(gridCols).toHaveLength(4)

    // Check if all four sections are rendered
    expect(screen.getByTestId('project-details')).toBeInTheDocument()
    expect(screen.getByTestId('team-members')).toBeInTheDocument()
    expect(screen.getByTestId('environments')).toBeInTheDocument()
    expect(screen.getByTestId('recent-activity')).toBeInTheDocument()
  })

  it('renders all sections with correct Grid.Col spans', () => {
    render(<Overview />)

    // Get all Grid.Col components
    const gridCols = screen.getAllByTestId('grid-col')

    // Check that all Grid.Cols have correct span props
    gridCols.forEach(col => {
      const spanProp = JSON.parse(col.getAttribute('data-span'))
      expect(spanProp).toEqual({ base: 12, md: 6 })
    })
  })

  it('renders the correct content in each section', () => {
    render(<Overview />)

    // Check if the correct content is rendered in each section
    expect(screen.getByText('Project Details Component')).toBeInTheDocument()
    expect(screen.getByText('Team Members Component')).toBeInTheDocument()
    expect(screen.getByText('Environments Component')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity Component')).toBeInTheDocument()
  })

  it('renders the sections in the correct order', () => {
    render(<Overview />)

    // Get all Grid.Col components
    const gridCols = screen.getAllByTestId('grid-col')

    // Check order of sections
    expect(gridCols[0].textContent).toBe('Project Details Component')
    expect(gridCols[1].textContent).toBe('Team Members Component')
    expect(gridCols[2].textContent).toBe('Environments Component')
    expect(gridCols[3].textContent).toBe('Recent Activity Component')
  })

  it('passes the correct gutter prop to Grid', () => {
    render(<Overview />)

    // Check if the Grid component has the correct gutter prop
    const grid = screen.getByTestId('grid')
    expect(grid.getAttribute('data-gutter')).toBe('xl')
  })
})
