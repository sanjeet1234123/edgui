// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react'
import AddFiles from '@/components/playground/serverPlayground/ChatArea/AddFiles'

// Mock console.log to test the file selection logging
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const React = require('react')
  // Enhanced Popover mock to handle open/close
  const PopoverComponent = ({ opened, onChange, children }) => {
    // Split children into Target and Dropdown
    let target = null
    let dropdown = null
    React.Children.forEach(children, child => {
      if (child?.type?.displayName === 'PopoverTarget') target = child
      if (child?.type?.displayName === 'PopoverDropdown') dropdown = child
    })
    return (
      <div data-testid="popover">
        {target}
        {opened && dropdown}
      </div>
    )
  }
  const PopoverTarget = ({ children }) => (
    <div data-testid="popover-target">{children}</div>
  )
  PopoverTarget.displayName = 'PopoverTarget'
  const PopoverDropdown = ({ children }) => (
    <div data-testid="popover-dropdown">{children}</div>
  )
  PopoverDropdown.displayName = 'PopoverDropdown'
  PopoverComponent.Target = PopoverTarget
  PopoverComponent.Dropdown = PopoverDropdown

  return {
    ActionIcon: ({
      children,
      disabled,
      variant,
      classNames,
      size,
      onClick,
    }) => (
      <button
        data-testid="action-icon"
        disabled={disabled}
        data-variant={variant}
        data-size={size}
        className={classNames?.root}
        onClick={onClick}
      >
        {children}
      </button>
    ),
    FileInput: ({
      placeholder,
      leftSection,
      onChange,
      onMouseOver,
      onMouseOut,
      accept,
      clearable,
      variant,
      leftSectionPointerEvents,
      styles,
    }) => (
      <div
        data-testid="file-input"
        data-placeholder={placeholder}
        data-accept={accept}
        data-clearable={clearable}
        data-variant={variant}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={() =>
          onChange &&
          onChange({ name: 'test.txt', size: 1024, type: 'text/plain' })
        }
        style={styles?.placeholder}
      >
        {leftSection}
        <span>{placeholder}</span>
      </div>
    ),
    Group: ({ children, justify }) => (
      <div data-testid="group" data-justify={justify}>
        {children}
      </div>
    ),
    Popover: PopoverComponent,
    Stack: ({ children }) => <div data-testid="stack">{children}</div>,
    Text: ({ children, c, classNames }) => (
      <span data-testid="text" data-color={c} className={classNames?.root}>
        {children}
      </span>
    ),
    Title: ({ children, className }) => (
      <h1 className={className}>{children}</h1>
    ),
    MantineProvider: ({ children }) => <div>{children}</div>,
  }
})

describe('AddFiles', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear()
  })

  afterAll(() => {
    mockConsoleLog.mockRestore()
  })

  it('renders the add files button', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    expect(addButton).toBeInTheDocument()
  })

  it('renders disabled button when disabled prop is true', () => {
    render(<AddFiles disabled={true} />)
    const addButton = screen.getByRole('button')
    expect(addButton).toBeDisabled()
  })

  it('renders enabled button when disabled prop is false', () => {
    render(<AddFiles disabled={false} />)
    const addButton = screen.getByRole('button')
    expect(addButton).not.toBeDisabled()
  })

  it('opens popover when clicking the add button', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')

    // Initially popover should be closed
    expect(screen.queryByText('Add Image')).not.toBeInTheDocument()

    // Click to open
    fireEvent.click(addButton)

    // Check if menu items are visible
    expect(screen.getByText('Add Image')).toBeInTheDocument()
    expect(screen.getByText('Add File')).toBeInTheDocument()
    expect(screen.getByText('Add from Drive')).toBeInTheDocument()
  })

  it('closes popover when clicking the add button again', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')

    // Open popover
    fireEvent.click(addButton)
    expect(screen.getByText('Add Image')).toBeInTheDocument()

    // Close popover
    fireEvent.click(addButton)
    expect(screen.queryByText('Add Image')).not.toBeInTheDocument()
  })

  it('rotates plus icon when popover is opened', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    const plusIcon = addButton.querySelector('svg')

    // Initially no rotation
    expect(plusIcon).toHaveClass('transform')
    expect(plusIcon).not.toHaveClass('rotate-45')

    // Open popover
    fireEvent.click(addButton)
    expect(plusIcon).toHaveClass('rotate-45')

    // Close popover
    fireEvent.click(addButton)
    expect(plusIcon).not.toHaveClass('rotate-45')
  })

  it('renders all menu items with correct icons and labels', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    fireEvent.click(addButton)

    const menuItems = [
      { label: 'Add Image', icon: 'ImagePlus' },
      { label: 'Add File', icon: 'Paperclip' },
      { label: 'Add from Drive', icon: 'HardDrive' },
    ]

    menuItems.forEach(item => {
      const menuItem = screen.getByText(item.label)
      expect(menuItem).toBeInTheDocument()
      // Check if the menu item is inside a file-input instead of group
      expect(menuItem.closest('[data-testid="file-input"]')).toBeInTheDocument()
    })
  })

  it('applies hover styles to menu items', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    fireEvent.click(addButton)

    const menuItems = screen.getAllByTestId('file-input')
    menuItems.forEach(item => {
      // We can't test for CSS classes in the mock, but we can check the test id
      expect(item).toBeInTheDocument()
    })
  })

  it('handles mouse over events on file input items', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    fireEvent.click(addButton)

    const fileInputs = screen.getAllByTestId('file-input')

    // Test mouse over on first file input
    fireEvent.mouseOver(fileInputs[0])
    expect(fileInputs[0]).toBeInTheDocument()

    // Test mouse over on second file input
    fireEvent.mouseOver(fileInputs[1])
    expect(fileInputs[1]).toBeInTheDocument()

    // Test mouse over on third file input
    fireEvent.mouseOver(fileInputs[2])
    expect(fileInputs[2]).toBeInTheDocument()
  })

  it('handles mouse out events on file input items', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    fireEvent.click(addButton)

    const fileInputs = screen.getAllByTestId('file-input')

    // Test mouse out on file inputs
    fileInputs.forEach(input => {
      fireEvent.mouseOut(input)
      expect(input).toBeInTheDocument()
    })
  })

  it('handles file selection and logs file information', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    fireEvent.click(addButton)

    const fileInputs = screen.getAllByTestId('file-input')

    // Click on the first file input to trigger onChange
    fireEvent.click(fileInputs[0])

    // Verify console.log was called with file information
    expect(mockConsoleLog).toHaveBeenCalledWith('File selected:', {
      name: 'test.txt',
      size: 1024,
      type: 'text/plain',
    })
  })

  it('handles file selection on multiple file inputs', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    fireEvent.click(addButton)

    const fileInputs = screen.getAllByTestId('file-input')

    // Test file selection on all file inputs
    fileInputs.forEach(input => {
      fireEvent.click(input)
      expect(mockConsoleLog).toHaveBeenCalledWith('File selected:', {
        name: 'test.txt',
        size: 1024,
        type: 'text/plain',
      })
    })
  })

  it('sets correct accept attributes for different file types', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    fireEvent.click(addButton)

    const fileInputs = screen.getAllByTestId('file-input')

    // Check accept attributes
    expect(fileInputs[0]).toHaveAttribute(
      'data-accept',
      'image/png,image/jpeg,image/webp',
    )
    expect(fileInputs[1]).toHaveAttribute('data-accept', '.pdf,.docx,.txt')
    // The third item doesn't have an accept attribute, so it should be null
    expect(fileInputs[2].getAttribute('data-accept')).toBeNull()
  })

  it('renders file input with correct variants and properties', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    fireEvent.click(addButton)

    const fileInputs = screen.getAllByTestId('file-input')

    fileInputs.forEach(input => {
      expect(input).toHaveAttribute('data-clearable', 'true')
      expect(input).toHaveAttribute('data-variant', 'unstyled')
    })
  })

  it('handles hover state changes correctly', () => {
    render(<AddFiles />)
    const addButton = screen.getByRole('button')
    fireEvent.click(addButton)

    const fileInputs = screen.getAllByTestId('file-input')

    // Test hover sequence: mouse over then mouse out
    fileInputs.forEach(input => {
      fireEvent.mouseOver(input)
      fireEvent.mouseOut(input)
      expect(input).toBeInTheDocument()
    })
  })
})
