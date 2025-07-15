// @ts-nocheck
/**
 * @jest-environment jsdom
 */

// Mock localStorage before importing the component
const localStorageMock = {
  getItem: jest.fn().mockReturnValue('123'),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AWSModal from '@/components/addCluster/Modals/AWSModal'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockImplementation(query => {
    if (query === '(max-width: 1440px)') return false
    if (query === '(max-width: 1024px)') return false
    return false
  }),
}))

// Mock the add cluster store
jest.mock('@/store/addClusterStore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    accountId: '123456789',
  })),
}))

// Mock the register cluster mutation
jest.mock('@/hooks/mutations/useAddClusterMutations', () => ({
  useRegisterClusterMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}))

// Mock the child components
jest.mock(
  '@/components/addCluster/Modals/AWSModal/SelectTrustedEntity',
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="select-trusted-entity">Select Trusted Entity</div>
    ),
  }),
)

jest.mock('@/components/addCluster/Modals/AWSModal/AssignPermissions', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ ref }) => {
    if (ref) {
      ref.current = {
        validateForm: jest.fn().mockReturnValue(true),
        submitForm: jest.fn().mockResolvedValue(true),
      }
    }
    return <div data-testid="assign-permissions">Assign Permissions</div>
  }),
}))

jest.mock('@/components/addCluster/Modals/AWSModal/SelectInstances', () => ({
  __esModule: true,
  default: ({ selectedVMS, setSelectedVMS }) => (
    <div data-testid="select-instances">
      <button onClick={() => setSelectedVMS('test-instance')}>
        Select Instance
      </button>
      <div>Selected: {selectedVMS}</div>
    </div>
  ),
}))

jest.mock('@/components/addCluster/Modals/AWSModal/ConfigureAccount', () => ({
  __esModule: true,
  default: () => <div data-testid="configure-account">Configure Account</div>,
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const StepperComponent = ({ children, active, onStepClick }) => (
    <div data-testid="stepper" data-active={active}>
      {children}
    </div>
  )
  StepperComponent.Step = ({ children, label }) => (
    <div data-testid="stepper-step" data-label={label}>
      {children}
    </div>
  )
  StepperComponent.Completed = ({ children }) => (
    <div data-testid="stepper-completed">{children}</div>
  )

  return {
    Button: ({ children, onClick, loading }) => (
      <button onClick={onClick} data-loading={loading}>
        {children}
      </button>
    ),
    Group: ({ children, justify }) => (
      <div data-justify={justify}>{children}</div>
    ),
    Modal: ({ children, opened, onClose, title }) => (
      <div data-testid="modal" data-opened={opened}>
        <div data-testid="modal-title">{title}</div>
        <button onClick={onClose}>Close</button>
        {opened && children}
      </div>
    ),
    Stack: ({ children, gap }) => <div data-gap={gap}>{children}</div>,
    Stepper: StepperComponent,
    Text: ({ children, fz, fw, c }) => (
      <span data-fz={fz} data-fw={fw} data-c={c}>
        {children}
      </span>
    ),
    ThemeIcon: ({ children, variant, color, size, radius, styles }) => (
      <div
        data-testid="theme-icon"
        data-variant={variant}
        data-color={color}
        data-size={size}
        data-radius={radius}
      >
        {children}
      </div>
    ),
  }
})

// Mock the IconStack component
jest.mock('@tabler/icons-react', () => ({
  IconStack: () => <div data-testid="icon-stack">Icon Stack</div>,
}))

describe('AWSModal', () => {
  const mockClose = jest.fn()
  const mockRegisterCluster = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    require('@/hooks/mutations/useAddClusterMutations').useRegisterClusterMutation.mockReturnValue(
      {
        mutate: mockRegisterCluster,
        isPending: false,
      },
    )
  })

  it('renders the modal with correct title and initial step', () => {
    render(<AWSModal opened={true} close={mockClose} />)

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('AWS Account Onboarding')).toBeInTheDocument()
    expect(screen.getByTestId('select-trusted-entity')).toBeInTheDocument()
  })

  it('closes the modal when close button is clicked', () => {
    render(<AWSModal opened={true} close={mockClose} />)

    fireEvent.click(screen.getByText('Close'))
    expect(mockClose).toHaveBeenCalled()
  })

  it('navigates through steps correctly', async () => {
    render(<AWSModal opened={true} close={mockClose} />)

    // Click next to move to Assign Permissions step
    fireEvent.click(screen.getByText('Proceed Next'))
    expect(screen.getByTestId('assign-permissions')).toBeInTheDocument()

    // Click next to move to Select Instances step
    fireEvent.click(screen.getByText('Proceed Next'))
    expect(screen.getByTestId('select-instances')).toBeInTheDocument()

    // Select an instance
    fireEvent.click(screen.getByText('Select Instance'))

    // Click next to move to Configure Account step
    fireEvent.click(screen.getByText('Proceed Next'))
    expect(screen.getByTestId('configure-account')).toBeInTheDocument()
  })

  it('handles back navigation correctly', () => {
    render(<AWSModal opened={true} close={mockClose} />)

    // Move to second step
    fireEvent.click(screen.getByText('Proceed Next'))

    // Click back
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByTestId('select-trusted-entity')).toBeInTheDocument()
  })

  it('handles loading state during cluster registration', () => {
    require('@/hooks/mutations/useAddClusterMutations').useRegisterClusterMutation.mockReturnValue(
      {
        mutate: mockRegisterCluster,
        isPending: true,
      },
    )

    render(<AWSModal opened={true} close={mockClose} />)

    // Navigate to Select Instances step
    fireEvent.click(screen.getByText('Proceed Next'))
    fireEvent.click(screen.getByText('Proceed Next'))

    // Select an instance
    fireEvent.click(screen.getByText('Select Instance'))

    // Proceed to next step
    fireEvent.click(screen.getByText('Proceed Next'))

    expect(screen.getByText('Proceed Next')).toHaveAttribute(
      'data-loading',
      'true',
    )
  })

  it('does not proceed if no instance is selected', () => {
    render(<AWSModal opened={true} close={mockClose} />)

    // Navigate to Select Instances step
    fireEvent.click(screen.getByText('Proceed Next'))
    fireEvent.click(screen.getByText('Proceed Next'))

    // Try to proceed without selecting an instance
    fireEvent.click(screen.getByText('Proceed Next'))

    expect(screen.getByTestId('select-instances')).toBeInTheDocument()
    expect(mockRegisterCluster).not.toHaveBeenCalled()
  })

  it('handles validation in Assign Permissions step', async () => {
    // Mock validation failure
    const mockAssignPermissionsRef = {
      validateForm: jest.fn().mockReturnValue(false),
      submitForm: jest.fn(),
    }

    jest.mock(
      '@/components/addCluster/Modals/AWSModal/AssignPermissions',
      () => ({
        __esModule: true,
        default: jest.fn().mockImplementation(({ ref }) => {
          if (ref) {
            ref.current = mockAssignPermissionsRef
          }
          return <div data-testid="assign-permissions">Assign Permissions</div>
        }),
      }),
    )

    render(<AWSModal opened={true} close={mockClose} />)

    // Move to Assign Permissions step
    fireEvent.click(screen.getByText('Proceed Next'))

    // Try to proceed with invalid form
    fireEvent.click(screen.getByText('Proceed Next'))

    expect(screen.getByTestId('assign-permissions')).toBeInTheDocument()
  })
})
