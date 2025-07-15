// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ModelSectionTable from '@/components/marketplace/ModelSectionTable'

// Mock RenderModelsTable component
jest.mock('@/components/marketplace/RenderModelsTable', () => ({
  __esModule: true,
  default: jest.fn(({ model, handleCardClick, user }) => (
    <tr data-testid="render-models-table" key={model.model_id}>
      <td data-testid="model-name">{model.model_name}</td>
      <td>
        <button
          data-testid="playground-button"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            handleCardClick(model)
          }}
        >
          Playground
        </button>
      </td>
    </tr>
  )),
}))

// Mock the react-router hooks
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
}))

// Mock the model store
jest.mock('@/store/modelStore', () => ({
  useModelStore: jest.fn().mockReturnValue({
    setCurrentModel: jest.fn(),
    setIngressUrl: jest.fn(),
    searchedModel: '',
  }),
}))

// Mock the marketplace mutations
jest.mock('@/hooks/mutations/useMarketplaceMutations', () => ({
  useUpscaleModelMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  }),
}))

// Mock the CSS classes
jest.mock('@/components/marketplace/marketplace.module.css', () => ({}))

// Mock the PATHS constant
jest.mock('@/constants/paths', () => ({
  PATHS: {
    PLAYGROUND: '/playground',
  },
}))

// Extend Table mock with nested components
const TableComponent = ({
  children,
  highlightOnHover,
  withTableBorder,
  horizontalSpacing,
  classNames,
}) => (
  <table
    data-testid="table"
    data-highlight-on-hover={highlightOnHover}
    data-with-table-border={withTableBorder}
    data-horizontal-spacing={horizontalSpacing}
  >
    {children}
  </table>
)

TableComponent.Thead = ({ children }) => (
  <thead data-testid="table-thead">{children}</thead>
)

TableComponent.Tbody = ({ children }) => (
  <tbody data-testid="table-tbody">{children}</tbody>
)

TableComponent.Tr = ({ children }) => (
  <tr data-testid="table-row">{children}</tr>
)

TableComponent.Th = ({ children, style }) => (
  <th data-testid="table-header" style={style}>
    {children}
  </th>
)

TableComponent.Td = ({ children, colSpan, align }) => (
  <td data-testid="table-cell" colSpan={colSpan} align={align}>
    {children}
  </td>
)

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  LoadingOverlay: ({ children, visible, zIndex, overlayProps }) => (
    <div
      data-testid="loading-overlay"
      data-visible={visible}
      data-z-index={zIndex}
    >
      {children}
    </div>
  ),
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  Table: TableComponent,
  Text: ({ children, size, fw }) => (
    <span data-testid="text" data-size={size} data-fw={fw}>
      {children}
    </span>
  ),
}))

describe('ModelSectionTable', () => {
  const mockModels = [
    {
      model_id: 1,
      model_name: 'Test Model 1',
      deployment_name: 'test-deployment-1',
      description: 'Test Description 1',
      processor_type: 'GPU',
      vulnerability: 'safe',
      provider_base64_image: 'test-provider',
      trending: false,
    },
    {
      model_id: 2,
      model_name: 'Test Model 2',
      deployment_name: 'test-deployment-2',
      description: 'Test Description 2',
      processor_type: 'CPU',
      vulnerability: 'unsafe',
      provider_base64_image: 'test-provider-2',
      trending: false,
    },
  ]

  const defaultProps = {
    models: mockModels,
    user: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the table with correct structure', () => {
    render(<ModelSectionTable {...defaultProps} />)

    expect(screen.getByTestId('table')).toBeInTheDocument()
    expect(screen.getByTestId('table-thead')).toBeInTheDocument()
    expect(screen.getByTestId('table-tbody')).toBeInTheDocument()

    // Check table headers
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Hardware')).toBeInTheDocument()
    expect(screen.getByText('Vulnerability')).toBeInTheDocument()
    expect(screen.getAllByText('Playground')).toHaveLength(3) // 1 header + 2 buttons
  })

  it('renders models when models array is not empty', () => {
    render(<ModelSectionTable {...defaultProps} />)

    const renderModelsComponents = screen.getAllByTestId('render-models-table')
    expect(renderModelsComponents).toHaveLength(2)

    expect(screen.getByText('Test Model 1')).toBeInTheDocument()
    expect(screen.getByText('Test Model 2')).toBeInTheDocument()
  })

  it('shows "No models found" message when models array is empty', () => {
    render(<ModelSectionTable {...defaultProps} models={[]} />)

    expect(screen.getByText('No models found')).toBeInTheDocument()
    expect(screen.queryByTestId('render-models-table')).not.toBeInTheDocument()
  })

  it('filters models based on searchedModel from store', () => {
    const mockUseModelStore = require('@/store/modelStore').useModelStore
    mockUseModelStore.mockReturnValue({
      setCurrentModel: jest.fn(),
      setIngressUrl: jest.fn(),
      searchedModel: 'Test Model 1',
    })

    render(<ModelSectionTable {...defaultProps} />)

    // Only one model should be rendered (the one that matches the search)
    const renderModelsComponents = screen.getAllByTestId('render-models-table')
    expect(renderModelsComponents).toHaveLength(1)
    expect(screen.getByText('Test Model 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Model 2')).not.toBeInTheDocument()
  })

  it('handles model search filtering with case insensitive matching', () => {
    const mockUseModelStore = require('@/store/modelStore').useModelStore
    mockUseModelStore.mockReturnValue({
      setCurrentModel: jest.fn(),
      setIngressUrl: jest.fn(),
      searchedModel: 'test model 1',
    })

    render(<ModelSectionTable {...defaultProps} />)

    const renderModelsComponents = screen.getAllByTestId('render-models-table')
    expect(renderModelsComponents).toHaveLength(1)
    expect(screen.getByText('Test Model 1')).toBeInTheDocument()
  })

  it('shows all models when searchedModel is empty', () => {
    const mockUseModelStore = require('@/store/modelStore').useModelStore
    mockUseModelStore.mockReturnValue({
      setCurrentModel: jest.fn(),
      setIngressUrl: jest.fn(),
      searchedModel: '',
    })

    render(<ModelSectionTable {...defaultProps} />)

    const renderModelsComponents = screen.getAllByTestId('render-models-table')
    expect(renderModelsComponents).toHaveLength(2)
  })

  it('calls handleCardClick when playground button is clicked for non-user models', () => {
    const mockNavigate = jest.fn()
    const mockSetCurrentModel = jest.fn()
    const mockSetIngressUrl = jest.fn()
    const mockUpscaleModel = jest.fn()

    require('@tanstack/react-router').useNavigate.mockReturnValue(mockNavigate)
    require('@/store/modelStore').useModelStore.mockReturnValue({
      setCurrentModel: mockSetCurrentModel,
      setIngressUrl: mockSetIngressUrl,
      searchedModel: '',
    })
    require('@/hooks/mutations/useMarketplaceMutations').useUpscaleModelMutation.mockReturnValue(
      {
        mutate: mockUpscaleModel,
        isPending: false,
      },
    )

    render(<ModelSectionTable {...defaultProps} user={false} />)

    const playgroundButtons = screen.getAllByTestId('playground-button')
    fireEvent.click(playgroundButtons[0])

    expect(mockSetCurrentModel).toHaveBeenCalledWith(mockModels[0])
    expect(mockUpscaleModel).toHaveBeenCalledWith(
      { deployment_name: 'test-deployment-1' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('does not call upscaleModel for user models', () => {
    const mockUpscaleModel = jest.fn()
    const mockSetCurrentModel = jest.fn()

    require('@/hooks/mutations/useMarketplaceMutations').useUpscaleModelMutation.mockReturnValue(
      {
        mutate: mockUpscaleModel,
        isPending: false,
      },
    )
    require('@/store/modelStore').useModelStore.mockReturnValue({
      setCurrentModel: mockSetCurrentModel,
      setIngressUrl: jest.fn(),
      searchedModel: '',
    })

    render(<ModelSectionTable {...defaultProps} user={true} />)

    const playgroundButtons = screen.getAllByTestId('playground-button')
    fireEvent.click(playgroundButtons[0])

    expect(mockSetCurrentModel).not.toHaveBeenCalled()
    expect(mockUpscaleModel).not.toHaveBeenCalled()
  })

  it('navigates to playground on successful upscale', () => {
    const mockNavigate = jest.fn()
    const mockSetIngressUrl = jest.fn()
    const mockUpscaleModel = jest.fn((params, options) => {
      // Simulate successful upscale
      options.onSuccess({ ingress_url: 'https://test-ingress.com' })
    })

    require('@tanstack/react-router').useNavigate.mockReturnValue(mockNavigate)
    require('@/store/modelStore').useModelStore.mockReturnValue({
      setCurrentModel: jest.fn(),
      setIngressUrl: mockSetIngressUrl,
      searchedModel: '',
    })
    require('@/hooks/mutations/useMarketplaceMutations').useUpscaleModelMutation.mockReturnValue(
      {
        mutate: mockUpscaleModel,
        isPending: false,
      },
    )

    render(<ModelSectionTable {...defaultProps} user={false} />)

    const playgroundButtons = screen.getAllByTestId('playground-button')
    fireEvent.click(playgroundButtons[0])

    expect(mockSetIngressUrl).toHaveBeenCalledWith('https://test-ingress.com')
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/playground',
      search: { model: 'Test Model 1' },
    })
  })

  it('shows loading overlay when upscaling is in progress', () => {
    require('@/hooks/mutations/useMarketplaceMutations').useUpscaleModelMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: true,
      },
    )

    render(<ModelSectionTable {...defaultProps} />)

    const loadingOverlay = screen.getByTestId('loading-overlay')
    expect(loadingOverlay).toHaveAttribute('data-visible', 'true')
    expect(
      screen.getByText('Please wait setting up the model'),
    ).toBeInTheDocument()
  })

  it('hides loading overlay when not upscaling', () => {
    require('@/hooks/mutations/useMarketplaceMutations').useUpscaleModelMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
      },
    )

    render(<ModelSectionTable {...defaultProps} />)

    const loadingOverlay = screen.getByTestId('loading-overlay')
    expect(loadingOverlay).toHaveAttribute('data-visible', 'false')
  })

  it('renders with optional user prop defaulting to false', () => {
    const propsWithoutUser = { models: mockModels }
    render(<ModelSectionTable {...propsWithoutUser} />)

    expect(screen.getByTestId('table')).toBeInTheDocument()
    expect(screen.getAllByTestId('render-models-table')).toHaveLength(2)
  })

  it('passes correct props to RenderModelsTable component', () => {
    const mockRenderModelsTable =
      require('@/components/marketplace/RenderModelsTable').default

    render(<ModelSectionTable {...defaultProps} />)

    expect(mockRenderModelsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        model: mockModels[0],
        user: false,
        handleCardClick: expect.any(Function),
      }),
      undefined,
    )

    expect(mockRenderModelsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        model: mockModels[1],
        user: false,
        handleCardClick: expect.any(Function),
      }),
      undefined,
    )
  })
})
