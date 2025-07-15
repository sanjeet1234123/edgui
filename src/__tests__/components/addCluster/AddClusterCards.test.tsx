// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import AddClusterCards from '@/components/addCluster/AddClusterCards'

// Mock the useDisclosure hook to return a static tuple
jest.mock('@mantine/hooks', () => ({
  useDisclosure: jest.fn(() => [true, { open: jest.fn(), close: jest.fn() }]),
}))

// Mock the icons (each with its own test id)
jest.mock('@/assets/logos/add-cluster-machine.svg?react', () => ({
  __esModule: true,
  default: () => <div data-testid="machine-icon">Machine Icon</div>,
}))
jest.mock('@/assets/logos/add-cluster-cloud.svg?react', () => ({
  __esModule: true,
  default: () => <div data-testid="cloud-icon">Cloud Icon</div>,
}))
jest.mock('@/assets/logos/Nexastack-GrayOut.svg?react', () => ({
  __esModule: true,
  default: () => <div data-testid="nexastack-icon">Nexastack Icon</div>,
}))
// Also mock without ?react for safety
jest.mock('@/assets/logos/add-cluster-machine.svg', () => ({
  __esModule: true,
  default: () => <div data-testid="machine-icon">Machine Icon</div>,
}))
jest.mock('@/assets/logos/add-cluster-cloud.svg', () => ({
  __esModule: true,
  default: () => <div data-testid="cloud-icon">Cloud Icon</div>,
}))
jest.mock('@/assets/logos/Nexastack-GrayOut.svg', () => ({
  __esModule: true,
  default: () => <div data-testid="nexastack-icon">Nexastack Icon</div>,
}))

// Mock the CSS module
jest.mock('@/components/addCluster/addCluster.module.css', () => ({
  cardStyle: 'card-style',
  selectedCard: 'selected-card',
  imageStyle: 'image-style',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const Grid = ({ children, gutter, mb }) => (
    <div data-testid="mantine-grid" data-gutter={gutter} data-mb={mb}>
      {children}
    </div>
  )
  Grid.Col = ({ children, span }) => (
    <div data-testid="mantine-grid-col" data-span={JSON.stringify(span)}>
      {children}
    </div>
  )
  return {
    Button: ({ children, onClick, size }) => (
      <button data-testid="mantine-button" onClick={onClick} data-size={size}>
        {children}
      </button>
    ),
    Card: ({ children, onClick, classNames }) => (
      <div
        data-testid="mantine-card"
        onClick={onClick}
        className={classNames?.root}
      >
        {children}
      </div>
    ),
    Grid,
    Group: ({ children }) => <div data-testid="mantine-group">{children}</div>,
    Select: ({ label, value, onChange, data, rightSection }) => (
      <div data-testid="mantine-select">
        <label>{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)}>
          {data.map(item => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {rightSection}
      </div>
    ),
    Stack: ({ children, gap }) => (
      <div data-testid="mantine-stack" data-gap={gap}>
        {children}
      </div>
    ),
    Text: ({ children, fw, fz, c, lineClamp }) => (
      <span
        data-testid="mantine-text"
        data-fw={fw}
        data-fz={fz}
        data-c={c}
        data-line-clamp={lineClamp}
      >
        {children}
      </span>
    ),
  }
})

// Mock the modal components
jest.mock('@/components/addCluster/Modals/ManagedNexastackModal', () => ({
  __esModule: true,
  default: ({ opened, close }) =>
    opened ? (
      <div data-testid="managed-nexastack-modal" onClick={close}>
        Managed Nexastack Modal
      </div>
    ) : null,
}))

jest.mock('@/components/addCluster/Modals/OnPremisesModal', () => ({
  __esModule: true,
  default: ({ opened, close }) =>
    opened ? (
      <div data-testid="on-premises-modal" onClick={close}>
        On Premises Modal
      </div>
    ) : null,
}))

jest.mock('@/components/addCluster/Modals/AWSModal', () => ({
  __esModule: true,
  default: ({ opened, close }) =>
    opened ? (
      <div data-testid="aws-modal" onClick={close}>
        AWS Modal
      </div>
    ) : null,
}))

jest.mock('@/components/addCluster/Modals/GCPModal', () => ({
  __esModule: true,
  default: ({ opened, close }) =>
    opened ? (
      <div data-testid="gcp-modal" onClick={close}>
        GCP Modal
      </div>
    ) : null,
}))

jest.mock('@/components/addCluster/Modals/AzureModal', () => ({
  __esModule: true,
  default: ({ opened, close }) =>
    opened ? (
      <div data-testid="azure-modal" onClick={close}>
        Azure Modal
      </div>
    ) : null,
}))

describe('AddClusterCards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all three cluster type cards', () => {
    render(<AddClusterCards />)

    const cards = screen.getAllByTestId('mantine-card')
    expect(cards).toHaveLength(3)

    expect(screen.getByText('On-Premises')).toBeInTheDocument()
    expect(screen.getByText('Cloud')).toBeInTheDocument()
    expect(screen.getByText('Managed by Nexastack')).toBeInTheDocument()
  })

  it('renders correct icons for each card', () => {
    render(<AddClusterCards />)

    // The component renders only nexastack-icon for all cards
    const nexastackIcons = screen.getAllByTestId('nexastack-icon')
    expect(nexastackIcons).toHaveLength(3)
  })

  it('shows cloud provider selection when cloud type is selected', () => {
    render(<AddClusterCards />)

    // Click on the cloud card
    const cards = screen.getAllByTestId('mantine-card')
    fireEvent.click(cards[1]) // Cloud card

    // Check if cloud provider selection is shown
    expect(screen.getByTestId('mantine-select')).toBeInTheDocument()
    expect(
      screen.getByText('Please select the cloud provider'),
    ).toBeInTheDocument()
  })

  it('shows correct cloud provider button based on selection', () => {
    render(<AddClusterCards />)

    // Click on the cloud card
    const cards = screen.getAllByTestId('mantine-card')
    fireEvent.click(cards[1]) // Cloud card

    // Select AWS
    const select = screen.getByTestId('mantine-select').querySelector('select')
    fireEvent.change(select, { target: { value: 'AWS EKS' } })

    expect(screen.getByText('Connect to AWS Account')).toBeInTheDocument()

    // Select GCP
    fireEvent.change(select, { target: { value: 'GCP GKE' } })
    expect(screen.getByText('Connect to GCP Account')).toBeInTheDocument()

    // Select Azure
    fireEvent.change(select, { target: { value: 'AZURE AKS' } })
    expect(screen.getByText('Connect to Azure Account')).toBeInTheDocument()
  })

  it('shows upload kubeconfig button for on-premises type', () => {
    render(<AddClusterCards />)

    // Click on the on-premises card
    const cards = screen.getAllByTestId('mantine-card')
    fireEvent.click(cards[0]) // On-premises card

    expect(screen.getByText('Upload Kubeconfig')).toBeInTheDocument()
  })

  it('shows managed kubernetes button for managed nexastack type', () => {
    render(<AddClusterCards />)

    // Click on the managed nexastack card
    const cards = screen.getAllByTestId('mantine-card')
    fireEvent.click(cards[2]) // Managed Nexastack card

    expect(
      screen.getByText('Managed Kubernetes (By Nexastack)'),
    ).toBeInTheDocument()
  })

  it('applies selected card styling when clicked', () => {
    render(<AddClusterCards />)

    const cards = screen.getAllByTestId('mantine-card')
    fireEvent.click(cards[0]) // Click first card

    // Accept both BEM and camelCase CSS module naming
    expect(cards[0].className).toMatch(/selected-card|selectedCard/)
  })

  it('opens correct modal when clicking cloud provider buttons', () => {
    render(<AddClusterCards />)

    // Click on the cloud card
    const cards = screen.getAllByTestId('mantine-card')
    fireEvent.click(cards[1]) // Cloud card

    // Select AWS and click connect button
    const select = screen.getByTestId('mantine-select').querySelector('select')
    fireEvent.change(select, { target: { value: 'AWS EKS' } })
    fireEvent.click(screen.getByText('Connect to AWS Account'))

    expect(screen.getByTestId('aws-modal')).toBeInTheDocument()
  })

  it('opens on-premises modal when clicking upload kubeconfig button', () => {
    render(<AddClusterCards />)

    // Click on the on-premises card
    const cards = screen.getAllByTestId('mantine-card')
    fireEvent.click(cards[0]) // On-premises card

    // Click upload kubeconfig button
    fireEvent.click(screen.getByText('Upload Kubeconfig'))

    expect(screen.getByTestId('on-premises-modal')).toBeInTheDocument()
  })

  it('opens managed nexastack modal when clicking managed kubernetes button', () => {
    render(<AddClusterCards />)

    // Click on the managed nexastack card
    const cards = screen.getAllByTestId('mantine-card')
    fireEvent.click(cards[2]) // Managed Nexastack card

    // Click managed kubernetes button
    fireEvent.click(screen.getByText('Managed Kubernetes (By Nexastack)'))

    expect(screen.getByTestId('managed-nexastack-modal')).toBeInTheDocument()
  })
})
