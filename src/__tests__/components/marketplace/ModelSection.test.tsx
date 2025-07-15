// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ModelSection from '@/components/marketplace/ModelSection'

// Mock the ModelCard component
jest.mock('@/components/marketplace/ModelCard', () => ({
  __esModule: true,
  default: jest.fn(({ model, handleCardClick, user }) => (
    <div 
      data-testid="model-card" 
      data-model-name={model.model_name}
      data-user={user}
      onClick={() => handleCardClick(model)}
    >
      {model.model_name}
    </div>
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
  }),
}))

// Mock the marketplace mutations
jest.mock('@/hooks/mutations/useMarketplaceMutations', () => ({
  useUpscaleModelMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  }),
}))

// Mock the Mantine components
const Grid = ({ children, gutter }) => (
  <div data-testid="grid" data-gutter={JSON.stringify(gutter)}>
    {children}
  </div>
);
Grid.Col = ({ children, span, key }) => (
  <div data-testid="grid-col" data-span={JSON.stringify(span)} key={key}>
    {children}
  </div>
);
const Stack = ({ children }) => <div data-testid="stack">{children}</div>;

jest.mock('@mantine/core', () => ({
  LoadingOverlay: ({ children, visible, zIndex, overlayProps }) => (
    <div data-testid="loading-overlay" data-visible={visible}>{children}</div>
  ),
  Button: ({ children, variant, onClick, rightSection }) => (
    <button 
      data-testid="button" 
      data-variant={variant} 
      onClick={onClick}
    >
      {children}
      {rightSection}
    </button>
  ),
  Grid,
  Group: ({ children, justify }) => (
    <div data-testid="group" data-justify={justify}>
      {children}
    </div>
  ),
  LoadingOverlay: ({ children, visible, zIndex, overlayProps }) => (
    <div 
      data-testid="loading-overlay" 
      data-visible={visible} 
      data-z-index={zIndex}
    >
      {children}
    </div>
  ),
  Stack,
  Text: ({ children, fw, fz, c, ta }) => (
    <p 
      data-testid="text" 
      data-fw={fw} 
      data-fz={fz} 
      data-c={c} 
      data-ta={ta}
    >
      {children}
    </p>
  ),
}))

// Mock the Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconChevronDown: () => <span data-testid="icon-chevron-down">ChevronDown</span>,
  IconChevronUp: () => <span data-testid="icon-chevron-up">ChevronUp</span>,
}))

describe('ModelSection', () => {
  const mockModels = [
    {
      model_id: 1,
      model_name: 'Model 1',
      deployment_name: 'deployment-1',
      description: 'Description 1',
    },
    {
      model_id: 2,
      model_name: 'Model 2',
      deployment_name: 'deployment-2',
      description: 'Description 2',
    },
    {
      model_id: 3,
      model_name: 'Model 3',
      deployment_name: 'deployment-3',
      description: 'Description 3',
    },
    {
      model_id: 4,
      model_name: 'Model 4',
      deployment_name: 'deployment-4',
      description: 'Description 4',
    },
  ]

  const defaultProps = {
    title: 'Test Models',
    seeAll: 'See All Models',
    models: mockModels,
    initialCount: 2,
    user: false,
  }

  it('renders the section title correctly', () => {
    render(<ModelSection {...defaultProps} />)
    
    expect(screen.getByText('Test Models')).toBeInTheDocument()
  })

  it('initially shows only the initialCount number of models', () => {
    render(<ModelSection {...defaultProps} />)
    
    const modelCards = screen.getAllByTestId('model-card')
    expect(modelCards.length).toBe(2) // initialCount is 2
    expect(modelCards[0]).toHaveTextContent('Model 1')
    expect(modelCards[1]).toHaveTextContent('Model 2')
  })

  it('shows all models when "See All" button is clicked', () => {
    render(<ModelSection {...defaultProps} />)
    
    // Initially shows only initialCount models
    expect(screen.getAllByTestId('model-card').length).toBe(2)
    
    // Click the "See All" button
    fireEvent.click(screen.getByText('See All Models'))
    
    // Should now show all models
    const modelCards = screen.getAllByTestId('model-card')
    expect(modelCards.length).toBe(4)
  })

  it('shows "Show less" button after expanding and collapses when clicked', () => {
    render(<ModelSection {...defaultProps} />)
    
    // Click to expand
    fireEvent.click(screen.getByText('See All Models'))
    
    // Button should now say "Show less"
    const showLessButton = screen.getByText('Show less')
    expect(showLessButton).toBeInTheDocument()
    
    // Click to collapse
    fireEvent.click(showLessButton)
    
    // Should be back to initialCount models
    expect(screen.getAllByTestId('model-card').length).toBe(2)
    expect(screen.getByText('See All Models')).toBeInTheDocument()
  })

  it('shows "No models available" when models array is empty', () => {
    render(<ModelSection {...defaultProps} models={[]} />)
    
    expect(screen.getByText('No models available')).toBeInTheDocument()
    expect(screen.queryByTestId('model-card')).not.toBeInTheDocument()
  })

  it('calls upscaleModel when a model card is clicked and user is false', () => {
    const navigate = jest.fn()
    require('@tanstack/react-router').useNavigate.mockReturnValue(navigate)
    
    const setCurrentModel = jest.fn()
    const setIngressUrl = jest.fn()
    require('@/store/modelStore').useModelStore.mockReturnValue({
      setCurrentModel,
      setIngressUrl,
    })
    
    const upscaleMutate = jest.fn()
    require('@/hooks/mutations/useMarketplaceMutations').useUpscaleModelMutation.mockReturnValue({
      mutate: upscaleMutate,
      isPending: false,
    })
    
    render(<ModelSection {...defaultProps} />)
    
    // Click the first model card
    fireEvent.click(screen.getAllByTestId('model-card')[0])
    
    // Should call setCurrentModel with the model
    expect(setCurrentModel).toHaveBeenCalledWith(mockModels[0])
    
    // Should call upscaleMutate with the deployment name
    expect(upscaleMutate).toHaveBeenCalledWith(
      { deployment_name: 'deployment-1' },
      expect.any(Object)
    )
  })

  it('does not call upscaleModel when user is true', () => {
    const upscaleMutate = jest.fn()
    require('@/hooks/mutations/useMarketplaceMutations').useUpscaleModelMutation.mockReturnValue({
      mutate: upscaleMutate,
      isPending: false,
    })
    
    render(<ModelSection {...defaultProps} user={true} />)
    
    // Click the first model card
    fireEvent.click(screen.getAllByTestId('model-card')[0])
    
    // Should not call upscaleMutate
    expect(upscaleMutate).not.toHaveBeenCalled()
  })

  it('shows loading overlay when upscaling is in progress', () => {
    require('@/hooks/mutations/useMarketplaceMutations').useUpscaleModelMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    })
    
    render(<ModelSection {...defaultProps} />)
    
    const loadingOverlay = screen.getByTestId('loading-overlay')
    expect(loadingOverlay).toHaveAttribute('data-visible', 'true')
    expect(screen.getByText('Please wait setting up the model')).toBeInTheDocument()
  })

  it('navigates to playground with correct search params on successful upscale', () => {
    const navigate = jest.fn()
    require('@tanstack/react-router').useNavigate.mockReturnValue(navigate)
    
    const setIngressUrl = jest.fn()
    require('@/store/modelStore').useModelStore.mockReturnValue({
      setCurrentModel: jest.fn(),
      setIngressUrl,
    })
    
    // Mock the upscale mutation to call the success callback
    const upscaleMutate = jest.fn((params, options) => {
      options.onSuccess({ ingress_url: 'https://example.com/model' })
    })
    
    require('@/hooks/mutations/useMarketplaceMutations').useUpscaleModelMutation.mockReturnValue({
      mutate: upscaleMutate,
      isPending: false,
    })
    
    render(<ModelSection {...defaultProps} />)
    
    // Click the first model card
    fireEvent.click(screen.getAllByTestId('model-card')[0])
    
    // Should set the ingress URL
    expect(setIngressUrl).toHaveBeenCalledWith('https://example.com/model')
    
    // Should navigate to playground with correct search params
    expect(navigate).toHaveBeenCalledWith({
      to: '/playground',
      search: { model: 'Model 1' },
    })
  })
})
