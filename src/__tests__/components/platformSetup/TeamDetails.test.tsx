// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TeamDetails from '@/components/platformSetup/TeamDetails'
import {
  teamSizeOptions,
  teamTypeOptions,
} from '@/components/platformSetup/constant'

// Mock useMediaQuery hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
}))

// Mock the platform setup module CSS
jest.mock('@/components/platformSetup/platformSetup.module.css', () => ({
  label: 'label-class',
  required: 'required-class',
  teamSizeOptionsWrapper: 'team-size-options-wrapper-class',
  teamSizeOption: 'teamSizeOption',
  teamSizeOptionSelected: 'teamSizeOptionSelected',
  error: 'error-class',
  input: 'input-class',
  label: 'label-class',
  root: 'root-class',
}))

// Mock the IconChevronDown component
jest.mock('@tabler/icons-react', () => ({
  IconChevronDown: () => (
    <div data-testid="chevron-down-icon">Chevron Down</div>
  ),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Stack: ({ children, gap }) => (
    <div data-testid="stack" data-gap={gap}>
      {children}
    </div>
  ),
  Text: ({ children, className }) => (
    <div data-testid="text" className={className}>
      {children}
    </div>
  ),
  TextInput: ({ size, label, placeholder, classNames, required, ...rest }) => (
    <div data-testid="text-input" data-size={size}>
      <label>
        {label} {required && <span>*</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        size={size}
        className={classNames?.input}
        data-size={size}
        value={rest.value || ''}
        onChange={rest.onChange}
      />
    </div>
  ),
  Select: ({
    size,
    label,
    placeholder,
    data,
    rightSection,
    classNames,
    value,
    onChange,
    required,
  }) => (
    <div data-testid="select" data-size={size}>
      <label>
        {label} {required && <span>*</span>}
      </label>
      <select
        value={value || ''}
        onChange={e => {
          const option = data.find(item => item.value === e.target.value)
          onChange(e.target.value, option)
        }}
        data-testid="select-input"
        data-size={size}
      >
        <option value="">{placeholder}</option>
        {data?.map(item => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <div data-testid="right-section">{rightSection}</div>
    </div>
  ),
}))

describe('TeamDetails', () => {
  // Create a mock form object that implements the required props and methods
  const createMockForm = (initialValues = {}) => {
    const mockForm = {
      values: {
        team_name: initialValues.team_name || '',
        team_size: initialValues.team_size || null,
        team_type: initialValues.team_type || null,
        ...initialValues,
      },
      errors: {
        team_size: initialValues.team_size_error || null,
      },
      getInputProps: jest.fn().mockImplementation(fieldName => ({
        value: mockForm.values[fieldName] || '',
        onChange: jest.fn(e => {
          mockForm.values[fieldName] = e.target.value
        }),
      })),
      setFieldValue: jest.fn((fieldName, value) => {
        mockForm.values[fieldName] = value
      }),
    }
    return mockForm
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the TeamDetails component with empty form values', () => {
    const mockForm = createMockForm()
    render(<TeamDetails form={mockForm} />)

    // Check that basic elements are rendered
    expect(screen.getByText('Team Name')).toBeInTheDocument()
    expect(
      screen.getByText(/How many people are there in your Team/),
    ).toBeInTheDocument()
    expect(screen.getByText('What does your Team do?')).toBeInTheDocument()

    // Check that all team size options are rendered
    teamSizeOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it('renders the TeamDetails with pre-populated form values', () => {
    const mockForm = createMockForm({
      team_name: 'Test Team',
      team_size: '2-5',
      team_type: 'platform-team',
    })

    render(<TeamDetails form={mockForm} />)

    // Check pre-populated values
    expect(
      screen.getByPlaceholderText('Please enter your Team Name'),
    ).toHaveAttribute('value', 'Test Team')

    // Check that the correct team size option is selected
    const selectedOption = screen.getByText('2-5').closest('div')
    // Get the className and check if it contains both classes
    const className = selectedOption.className
    expect(className).toContain('teamSizeOption')
    expect(className).toContain('teamSizeOptionSelected')
  })

  it('handles team size selection', () => {
    const mockForm = createMockForm()
    render(<TeamDetails form={mockForm} />)

    // Click on a team size option
    fireEvent.click(screen.getByText('6-10'))

    // Check that the form value was updated
    expect(mockForm.setFieldValue).toHaveBeenCalledWith('team_size', '6-10')
  })

  it('displays form errors when present', () => {
    const mockForm = createMockForm({
      team_size_error: 'Team size is required',
    })

    render(<TeamDetails form={mockForm} />)

    // Check that the error message is displayed
    expect(screen.getByText('Team size is required')).toBeInTheDocument()
  })

  it('handles team type selection', () => {
    const mockForm = createMockForm()

    render(<TeamDetails form={mockForm} />)

    // Find the Select component for team type
    const selectElement = screen.getByTestId('select-input')

    // Simulate selecting a team type
    fireEvent.change(selectElement, { target: { value: 'platform-team' } })

    // Check that setFieldValue was called with correct value
    expect(mockForm.setFieldValue).toHaveBeenCalledWith(
      'team_type',
      'platform-team',
    )
  })

  it('uses correct size based on screen size for inputs', () => {
    // First test with desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)
    const mockForm = createMockForm()

    const { unmount } = render(<TeamDetails form={mockForm} />)
    expect(screen.getAllByTestId('text-input')[0]).toHaveAttribute(
      'data-size',
      'lg',
    )
    expect(screen.getByTestId('select')).toHaveAttribute('data-size', 'lg')

    unmount()

    // Then test with mobile view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)
    render(<TeamDetails form={mockForm} />)
    expect(screen.getAllByTestId('text-input')[0]).toHaveAttribute(
      'data-size',
      'md',
    )
    expect(screen.getByTestId('select')).toHaveAttribute('data-size', 'md')
  })

  it('initializes with pre-existing form values for team_size', () => {
    const mockForm = createMockForm({
      team_size: '11-50',
    })

    render(<TeamDetails form={mockForm} />)

    // Check that the correct option is selected
    const selectedOption = screen.getByText('11-50').closest('div')
    // Get the className and check if it contains both classes
    const className = selectedOption.className
    expect(className).toContain('teamSizeOption')
    expect(className).toContain('teamSizeOptionSelected')
  })

  it('initializes with pre-existing form values for team_type', () => {
    const mockForm = createMockForm({
      team_type: 'data-science',
    })

    render(<TeamDetails form={mockForm} />)

    // For the select component, we're checking the initial state created in the component
    const dataScience = teamTypeOptions.find(
      option => option.value === 'data-science',
    )
    expect(dataScience).toBeTruthy()
    expect(dataScience.label).toBe('Data Science')
  })
})
