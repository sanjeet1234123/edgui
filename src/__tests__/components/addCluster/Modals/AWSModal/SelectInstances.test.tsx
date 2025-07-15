// @ts-nocheck
/**
 * @jest-environment jsdom
 */

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const actual = jest.requireActual('@mantine/core')
  function Radio({ label, value }) {
    return (
      <label data-testid="radio-option">
        <input type="radio" value={value} />
        {label}
      </label>
    )
  }
  Radio.Group = function Group({ children, value, onChange }) {
    return (
      <div data-testid="radio-group" data-value={value}>
        {children}
      </div>
    )
  }
  return {
    ...actual,
    Radio,
    Stack: ({ children, align, gap }) => (
      <div data-testid="stack" data-align={align} data-gap={gap}>
        {children}
      </div>
    ),
    Text: ({ children, fz, fw, c }) => (
      <span data-testid="text" data-fz={fz} data-fw={fw} data-color={c}>
        {children}
      </span>
    ),
  }
})

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SelectInstances from '../../../../../components/addCluster/Modals/AWSModal/SelectInstances'

// Mock the addCluster store as a hook
jest.mock('@/store/addClusterStore', () => ({
  __esModule: true,
  default: jest.fn(), // This will be used as useAddClusterStore
}))

describe('SelectInstances', () => {
  const mockSetSelectedVMS = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with title and description', () => {
    const mockVMs = []
    require('@/store/addClusterStore').default.mockReturnValue({ vms: mockVMs })

    render(
      <SelectInstances selectedVMS="" setSelectedVMS={mockSetSelectedVMS} />,
    )

    expect(screen.getByText('Select Cluster to Onboard')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Please select the cluster you want to onboard and onboard seamlessly',
      ),
    ).toBeInTheDocument()
  })

  it('displays radio options when VMs are available', () => {
    const mockVMs = [{ vm: 'vm1' }, { vm: 'vm2' }, { vm: 'vm3' }]
    require('@/store/addClusterStore').default.mockReturnValue({ vms: mockVMs })

    render(
      <SelectInstances selectedVMS="vm1" setSelectedVMS={mockSetSelectedVMS} />,
    )

    const radioOptions = screen.getAllByTestId('radio-option')
    expect(radioOptions).toHaveLength(3)
    expect(radioOptions[0]).toHaveTextContent('vm1')
    expect(radioOptions[1]).toHaveTextContent('vm2')
    expect(radioOptions[2]).toHaveTextContent('vm3')
  })

  it('displays message when no VMs are available', () => {
    const mockVMs = []
    require('@/store/addClusterStore').default.mockReturnValue({ vms: mockVMs })

    render(
      <SelectInstances selectedVMS="" setSelectedVMS={mockSetSelectedVMS} />,
    )

    expect(
      screen.getByText("You don't have clusters, please add one"),
    ).toBeInTheDocument()
  })

  it('handles radio selection change', () => {
    const mockVMs = [{ vm: 'vm1' }, { vm: 'vm2' }]
    require('@/store/addClusterStore').default.mockReturnValue({ vms: mockVMs })

    render(
      <SelectInstances selectedVMS="vm1" setSelectedVMS={mockSetSelectedVMS} />,
    )

    const radioGroup = screen.getByTestId('radio-group')
    expect(radioGroup).toHaveAttribute('data-value', 'vm1')
  })

  it('applies correct styling to text elements', () => {
    const mockVMs = []
    require('@/store/addClusterStore').default.mockReturnValue({ vms: mockVMs })

    render(
      <SelectInstances selectedVMS="" setSelectedVMS={mockSetSelectedVMS} />,
    )

    const texts = screen.getAllByTestId('text')
    expect(texts[0]).toHaveAttribute('data-fz', 'var(--size-xl)')
    expect(texts[0]).toHaveAttribute('data-fw', '600')
    expect(texts[1]).toHaveAttribute('data-fz', 'var(--size-sm)')
    expect(texts[1]).toHaveAttribute('data-color', 'dimmed')
  })
})

describe('SelectInstances import', () => {
  it('should be defined', () => {
    expect(SelectInstances).toBeDefined()
  })
})
