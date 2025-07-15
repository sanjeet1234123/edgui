// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatCardHeader from '@/components/playground/modelPlayground/chatCardData/ChatCardHeader'
import { useModelStore } from '@/store/modelStore'
import { useGetModelStatusQuery } from '@/hooks/queries/usePlaygroundQueries'

// Mock the model store
jest.mock('@/store/modelStore', () => ({
  useModelStore: jest.fn(),
}))

// Mock the model status query
jest.mock('@/hooks/queries/usePlaygroundQueries', () => ({
  useGetModelStatusQuery: jest.fn(),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const AccordionComponent = ({ children }) => (
    <div data-testid="accordion">{children}</div>
  )
  AccordionComponent.Item = ({ children, value }) => (
    <div data-testid="accordion-item" data-value={value}>
      {children}
    </div>
  )
  AccordionComponent.Control = ({ children }) => (
    <div data-testid="accordion-control">{children}</div>
  )
  AccordionComponent.Panel = ({ children }) => (
    <div data-testid="accordion-panel">{children}</div>
  )

  const GridComponent = ({ children, gutter }) => (
    <div data-gutter={gutter}>{children}</div>
  )
  GridComponent.Col = ({ children, span }) => (
    <div data-span={JSON.stringify(span)}>{children}</div>
  )

  return {
    Group: ({ children, justify, gap, p }) => (
      <div data-justify={justify} data-gap={gap} data-padding={p}>
        {children}
      </div>
    ),
    Accordion: AccordionComponent,
    Text: ({ children, fw, fz, c }) => (
      <span data-fw={fw} data-fz={fz} data-color={c}>
        {children}
      </span>
    ),
    Chip: ({ children, checked, color, fz, fw }) => (
      <div
        data-testid="status-chip"
        data-checked={checked}
        data-color={color}
        data-fz={fz}
        data-fw={fw}
      >
        {children}
      </div>
    ),
    Grid: GridComponent,
    Stack: ({ children, p, gap }) => (
      <div data-padding={p} data-gap={gap}>
        {children}
      </div>
    ),
  }
})

// Mock icons
jest.mock('@tabler/icons-react', () => ({
  IconCpu2: () => <div data-testid="cpu-icon">CPU Icon</div>,
  IconSitemap: () => <div data-testid="cluster-icon">Cluster Icon</div>,
  IconDatabase: () => <div data-testid="storage-icon">Storage Icon</div>,
}))

jest.mock('lucide-react', () => ({
  MemoryStick: () => <div data-testid="memory-icon">Memory Icon</div>,
}))

describe('ChatCardHeader', () => {
  const mockSetModelStatus = jest.fn()
  const mockModelData = {
    model_name: 'Test Model',
    processor: 'Intel Xeon',
    cores: 4,
    cluster_type: 'Standard',
    nodes: 2,
    ram: '16GB',
    storage: '100GB',
    deployment_name: 'test-deployment',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useModelStore.mockReturnValue({
      currentModel: mockModelData,
      ingressUrl: 'http://test-url',
    })
  })

  it('renders the model name correctly', () => {
    useGetModelStatusQuery.mockReturnValue({ data: { error: false } })
    render(
      <ChatCardHeader setModelStatus={mockSetModelStatus} modelStatus={true} />,
    )
    expect(screen.getByText('Test Model')).toBeInTheDocument()
  })

  it('shows active status when model is active', () => {
    useGetModelStatusQuery.mockReturnValue({ data: { error: false } })
    render(
      <ChatCardHeader setModelStatus={mockSetModelStatus} modelStatus={true} />,
    )
    const statusChip = screen.getByTestId('status-chip')
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(statusChip).toHaveAttribute('data-color', 'green')
  })

  it('shows inactive status when model is inactive', () => {
    useGetModelStatusQuery.mockReturnValue({ data: { error: true } })
    render(
      <ChatCardHeader
        setModelStatus={mockSetModelStatus}
        modelStatus={false}
      />,
    )
    const statusChip = screen.getByTestId('status-chip')
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(statusChip).toHaveAttribute('data-color', 'red')
  })

  it('displays infrastructure requirements correctly', () => {
    useGetModelStatusQuery.mockReturnValue({ data: { error: false } })
    render(
      <ChatCardHeader setModelStatus={mockSetModelStatus} modelStatus={true} />,
    )

    // Check if all infrastructure icons are present
    expect(screen.getByTestId('cpu-icon')).toBeInTheDocument()
    expect(screen.getByTestId('cluster-icon')).toBeInTheDocument()
    expect(screen.getByTestId('memory-icon')).toBeInTheDocument()
    expect(screen.getByTestId('storage-icon')).toBeInTheDocument()

    // Check if infrastructure values are displayed
    expect(screen.getByText('Intel Xeon (4 cores)')).toBeInTheDocument()
    expect(screen.getByText('Standard (2 Nodes)')).toBeInTheDocument()
    expect(screen.getByText('16GB')).toBeInTheDocument()
    expect(screen.getByText('100GB')).toBeInTheDocument()
  })

  it('updates model status when API response changes', async () => {
    const { rerender } = render(
      <ChatCardHeader setModelStatus={mockSetModelStatus} modelStatus={true} />,
    )

    // Initial state with no error
    useGetModelStatusQuery.mockReturnValue({ data: { error: false } })
    await waitFor(() => {
      expect(mockSetModelStatus).toHaveBeenCalledWith(true)
    })

    // Update to error state
    useGetModelStatusQuery.mockReturnValue({ data: { error: true } })
    rerender(
      <ChatCardHeader setModelStatus={mockSetModelStatus} modelStatus={true} />,
    )
    await waitFor(() => {
      expect(mockSetModelStatus).toHaveBeenCalledWith(false)
    })
  })

  it('handles missing model data gracefully', () => {
    useModelStore.mockReturnValue({
      currentModel: null,
      ingressUrl: null,
    })
    useGetModelStatusQuery.mockReturnValue({ data: { error: false } })

    render(
      <ChatCardHeader setModelStatus={mockSetModelStatus} modelStatus={true} />,
    )

    expect(screen.getByText('Model Name')).toBeInTheDocument()
  })

  it('renders accordion with correct structure', () => {
    useGetModelStatusQuery.mockReturnValue({ data: { error: false } })
    render(
      <ChatCardHeader setModelStatus={mockSetModelStatus} modelStatus={true} />,
    )

    expect(screen.getByTestId('accordion')).toBeInTheDocument()
    expect(screen.getByTestId('accordion-item')).toHaveAttribute(
      'data-value',
      'model-chat-card-header',
    )
    expect(screen.getByTestId('accordion-control')).toBeInTheDocument()
    expect(screen.getByTestId('accordion-panel')).toBeInTheDocument()
  })
})
