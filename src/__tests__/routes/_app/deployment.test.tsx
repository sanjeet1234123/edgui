// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'

// Mock the router
jest.mock('@tanstack/react-router', () => {
  const mockUseSearch = jest.fn().mockReturnValue({ model: 'test-model' })
  const mockUseNavigate = jest.fn()

  return {
    createFileRoute: () => routeConfig => ({
      ...routeConfig,
      useSearch: mockUseSearch,
    }),
    useNavigate: () => mockUseNavigate,
  }
})

// Mock the model store
jest.mock('@/store/modelStore', () => ({
  useModelStore: () => ({
    currentModel: {
      hf_model_name: 'test-model',
      name: 'Test Model',
      description: 'Test Description',
    },
  }),
}))

// Mock the deployment query hook
jest.mock('@/hooks/queries/useDeploymentQuery', () => ({
  useGetClustersQuery: () => ({
    data: {
      clusters: [
        {
          id: '1',
          name: 'Test Cluster',
          status: 'running',
        },
      ],
    },
    refetch: jest.fn(),
  }),
}))

// Mock the components
jest.mock('@/components/deployment/index', () => ({
  ClustersList: ({ clustersData, model }) => (
    <div data-testid="clusters-list">
      <div data-testid="clusters-data">{JSON.stringify(clustersData)}</div>
      <div data-testid="model-data">{JSON.stringify(model)}</div>
    </div>
  ),
  ModalDetails: ({ model, refetchClusters }) => (
    <div data-testid="modal-details">
      <div data-testid="model-info">{JSON.stringify(model)}</div>
      <button data-testid="refetch-button" onClick={refetchClusters}>
        Refetch
      </button>
    </div>
  ),
}))

jest.mock('@/components/deployment/ClustersFallback', () => ({
  __esModule: true,
  default: () => <div data-testid="clusters-fallback">Loading...</div>,
}))

// Mock Mantine core components
jest.mock('@mantine/core', () => ({
  Stack: ({ children, className }) => (
    <div data-testid="mantine-stack" className={className}>
      {children}
    </div>
  ),
  Group: ({ children }) => <div data-testid="mantine-group">{children}</div>,
  Title: ({ children, className }) => <h1 className={className}>{children}</h1>,
}))

// Import the actual component for testing (after mocks)
import { Route } from '@/routes/_app/deployment'

describe('Deployment Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the deployment page with all components', () => {
    render(<Route.component />)

    // Check for title
    expect(screen.getByText('Model Deployment')).toBeInTheDocument()

    // Check for modal details
    const modalDetails = screen.getByTestId('modal-details')
    expect(modalDetails).toBeInTheDocument()

    // Check for clusters list
    const clustersList = screen.getByTestId('clusters-list')
    expect(clustersList).toBeInTheDocument()
  })

  it('should display model information correctly', () => {
    render(<Route.component />)

    const modelInfo = screen.getByTestId('model-info')
    expect(modelInfo).toHaveTextContent('Test Model')
    expect(modelInfo).toHaveTextContent('Test Description')
  })

  it('should display clusters data correctly', () => {
    render(<Route.component />)

    const clustersData = screen.getByTestId('clusters-data')
    expect(clustersData).toHaveTextContent('Test Cluster')
    expect(clustersData).toHaveTextContent('running')
  })

  it('should handle refetch functionality', async () => {
    const mockRefetch = jest.fn()
    jest
      .spyOn(
        require('@/hooks/queries/useDeploymentQuery'),
        'useGetClustersQuery',
      )
      .mockImplementation(() => ({
        data: { clusters: [] },
        refetch: mockRefetch,
      }))

    render(<Route.component />)

    const refetchButton = screen.getByTestId('refetch-button')
    refetchButton.click()

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled()
    })
  })
})
