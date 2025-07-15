// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProjectDetails from '@/components/accountSettings/ProjectDetails'

// Mock the CSS module
jest.mock('@/components/accountSettings/accountSettings.module.css', () => ({
  cardTitle: 'card-title-class',
  cardDescription: 'card-description-class',
  icon: 'icon-class',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const TableComponent = ({
    children,
    highlightOnHover,
    withTableBorder,
    horizontalSpacing,
    classNames,
  }) => (
    <div
      data-testid="table"
      data-highlight={highlightOnHover}
      data-border={withTableBorder}
      data-spacing={horizontalSpacing}
    >
      {children}
    </div>
  )
  TableComponent.Tr = ({ children }) => (
    <div data-testid="table-row">{children}</div>
  )
  TableComponent.Td = ({ children, colSpan, align }) => (
    <div data-testid="table-cell" data-colspan={colSpan} data-align={align}>
      {children}
    </div>
  )
  TableComponent.Th = ({ children, miw, maw, w }) => (
    <div
      data-testid="table-header"
      data-miw={miw}
      data-maw={maw}
      data-width={w}
    >
      {children}
    </div>
  )
  TableComponent.Thead = ({ children }) => (
    <div data-testid="table-head">{children}</div>
  )
  TableComponent.Tbody = ({ children }) => (
    <div data-testid="table-body">{children}</div>
  )

  return {
    Card: ({ children, radius, w }) => (
      <div data-testid="card" data-radius={radius} data-width={w}>
        {children}
      </div>
    ),
    Stack: ({ children, gap }) => (
      <div data-testid="stack" data-gap={gap}>
        {children}
      </div>
    ),
    Text: ({ children, fz, c, fw, p }) => (
      <span
        data-testid="text"
        data-fz={fz}
        data-color={c}
        data-fw={fw}
        data-p={p}
      >
        {children}
      </span>
    ),
    Title: ({ children, order, className }) => (
      <h1 data-testid="title" data-order={order} className={className}>
        {children}
      </h1>
    ),
    Table: TableComponent,
    Loader: () => <div data-testid="loader">Loading...</div>,
    Pagination: ({ total, value, onChange, size, radius, color }) => (
      <div
        data-testid="pagination"
        data-total={total}
        data-value={value}
        data-size={size}
        data-radius={radius}
        data-color={color}
      >
        <button onClick={() => onChange(2)}>Page 2</button>
      </div>
    ),
    Center: ({ children }) => <div data-testid="center">{children}</div>,
    Group: ({ children, gap }) => (
      <div data-testid="group" data-gap={gap}>
        {children}
      </div>
    ),
    ThemeIcon: ({ children, variant, classNames }) => (
      <div
        data-testid="theme-icon"
        data-variant={variant}
        className={classNames?.root || ''}
      >
        {children}
      </div>
    ),
  }
})

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconClock: () => <div data-testid="clock-icon">Clock Icon</div>,
  IconStack: () => <div data-testid="stack-icon">Stack Icon</div>,
}))

// Mock the formatProjectDate utility
jest.mock('@/utils/commonFunction', () => ({
  formatProjectDate: date => `Formatted: ${date}`,
}))

describe('ProjectDetails', () => {
  const mockProjects = {
    project: [
      {
        id: '1',
        name: 'Project 1',
        description: 'Description 1',
        created_at: '2024-01-01',
      },
      {
        id: '2',
        name: 'Project 2',
        description: 'Description 2',
        created_at: '2024-01-02',
      },
      {
        id: '3',
        name: 'Project 3',
        description: 'Description 3',
        created_at: '2024-01-03',
      },
      {
        id: '4',
        name: 'Project 4',
        description: 'Description 4',
        created_at: '2024-01-04',
      },
      {
        id: '5',
        name: 'Project 5',
        description: 'Description 5',
        created_at: '2024-01-05',
      },
      {
        id: '6',
        name: 'Project 6',
        description: 'Description 6',
        created_at: '2024-01-06',
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with title and description', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    expect(screen.getByText('Project List')).toBeInTheDocument()
    expect(screen.getByText('Your current projects')).toBeInTheDocument()
  })

  it('displays loading state correctly', () => {
    render(<ProjectDetails data={mockProjects} isLoading={true} />)

    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })

  it('displays "No projects found" when there are no projects', () => {
    render(<ProjectDetails data={{ project: [] }} isLoading={false} />)

    expect(screen.getByText('No projects found')).toBeInTheDocument()
  })

  it('renders projects with correct information', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('Formatted: 2024-01-01')).toBeInTheDocument()
  })

  it('implements pagination correctly', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    // Initially shows first 5 projects
    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.getByText('Project 5')).toBeInTheDocument()
    expect(screen.queryByText('Project 6')).not.toBeInTheDocument()

    // Click to go to page 2
    const paginationButton = screen.getByText('Page 2')
    fireEvent.click(paginationButton)

    // Should now show Project 6
    expect(screen.getByText('Project 6')).toBeInTheDocument()
  })

  it('renders table headers correctly', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    const headers = screen.getAllByTestId('table-header')
    expect(headers[0]).toHaveAttribute('data-miw', '400')
    expect(headers[1]).toHaveAttribute('data-miw', '300')
    expect(headers[2]).toHaveAttribute('data-miw', '240')
  })

  it('renders project icons correctly', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    const stackIcons = screen.getAllByTestId('stack-icon')
    expect(stackIcons.length).toBe(5) // First page shows 5 items
  })

  it('renders clock icons with correct formatting', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    const clockIcons = screen.getAllByTestId('clock-icon')
    expect(clockIcons.length).toBe(5) // First page shows 5 items
  })

  it('renders table with correct props', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    const table = screen.getByTestId('table')
    expect(table).toHaveAttribute('data-highlight', 'true')
    expect(table).toHaveAttribute('data-border', 'true')
    expect(table).toHaveAttribute('data-spacing', 'lg')
  })

  it('renders card with correct props', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    const card = screen.getByTestId('card')
    expect(card).toHaveAttribute('data-radius', 'md')
    expect(card).toHaveAttribute('data-width', '100%')
  })

  it('renders pagination with correct props', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    const pagination = screen.getByTestId('pagination')
    expect(pagination).toHaveAttribute('data-size', 'md')
    expect(pagination).toHaveAttribute('data-radius', 'md')
    expect(pagination).toHaveAttribute('data-color', 'var(--clr-secondary)')
  })

  it('renders theme icon with correct props', () => {
    render(<ProjectDetails data={mockProjects} isLoading={false} />)

    const themeIcon = screen.getAllByTestId('theme-icon')[0]
    expect(themeIcon).toHaveAttribute('data-variant', 'default')
    expect(
      themeIcon.className === 'icon-class' || themeIcon.className === 'icon',
    ).toBe(true)
  })
})
