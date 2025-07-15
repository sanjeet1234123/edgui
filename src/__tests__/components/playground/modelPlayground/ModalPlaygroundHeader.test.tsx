// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModalPlaygroundHeader from '@/components/playground/modelPlayground/ModalPlaygroundHeader'

// Mock dependencies
jest.mock('@mantine/core', () => ({
  Button: ({ children, leftSection, onClick, size }) => (
    <button onClick={onClick} data-size={size} data-testid="deploy-button">
      {leftSection}
      {children}
    </button>
  ),
  Group: ({ children, justify }) => (
    <div data-justify={justify} data-testid="header-group">
      {children}
    </div>
  ),
  Text: ({ children, className }) => (
    <span className={className} data-testid="header-title">
      {children}
    </span>
  ),
}))

jest.mock('lucide-react', () => ({
  Rocket: ({ size }) => (
    <span data-testid="rocket-icon" data-size={size}>
      🚀
    </span>
  ),
}))

jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(),
}))

jest.mock('@/constants/paths', () => ({
  PATHS: {
    DEPLOYMENT: '/deployment',
  },
}))

jest.mock('@/store/modelStore', () => ({
  useModelStore: jest.fn(),
}))

import { useNavigate } from '@tanstack/react-router'
import { useModelStore } from '@/store/modelStore'

describe('ModalPlaygroundHeader Component', () => {
  // Setup default mocks before each test
  const mockNavigate = jest.fn()
  const mockCurrentModel = {
    model_name: 'test-model',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
    useModelStore.mockReturnValue({ currentModel: mockCurrentModel })
  })

  test('renders correctly with proper title and deploy button', () => {
    render(<ModalPlaygroundHeader />)

    expect(screen.getByTestId('header-title')).toHaveTextContent(
      'Model Playground',
    )
    expect(screen.getByTestId('deploy-button')).toHaveTextContent(
      'Deploy on Production',
    )
    expect(screen.getByTestId('rocket-icon')).toBeInTheDocument()
    expect(screen.getByTestId('header-group')).toHaveAttribute(
      'data-justify',
      'space-between',
    )
  })

  test('navigates to deployment page with correct parameters when deploy button is clicked', () => {
    render(<ModalPlaygroundHeader />)

    const deployButton = screen.getByTestId('deploy-button')
    fireEvent.click(deployButton)

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/deployment',
      search: {
        model: 'test-model',
      },
    })
  })

  test('handles null or undefined currentModel gracefully', () => {
    useModelStore.mockReturnValue({ currentModel: null })

    render(<ModalPlaygroundHeader />)

    const deployButton = screen.getByTestId('deploy-button')
    fireEvent.click(deployButton)

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/deployment',
      search: {
        model: undefined,
      },
    })
  })

  test('deploy button has correct size and icon', () => {
    render(<ModalPlaygroundHeader />)

    const deployButton = screen.getByTestId('deploy-button')
    const rocketIcon = screen.getByTestId('rocket-icon')

    expect(deployButton).toHaveAttribute('data-size', 'lg')
    expect(rocketIcon).toHaveAttribute('data-size', '20')
  })
})
