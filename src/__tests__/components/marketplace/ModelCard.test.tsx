// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ModelCard from '@/components/marketplace/ModelCard'

// Mock the AgentIcons
jest.mock('@/assets/agent-icons', () => ({
  AgentIcons: {
    user: () => <div data-testid="user-icon">User Icon</div>,
    openai: () => <div data-testid="openai-icon">OpenAI Icon</div>,
  },
}))

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Badge: ({ children, color, variant, tt }) => (
    <div data-testid="badge" data-color={color} data-variant={variant} data-tt={tt}>
      {children}
    </div>
  ),
  Box: ({ children, style }) => (
    <div data-testid="box" style={style}>
      {children}
    </div>
  ),
  Button: ({ children, leftSection, onClick, variant, size }) => (
    <button 
      data-testid="button" 
      data-variant={variant} 
      data-size={size} 
      onClick={onClick}
    >
      {leftSection}
      {children}
    </button>
  ),
  Card: ({ children, classNames, onClick }) => (
    <div 
      data-testid="card" 
      className={classNames?.root} 
      onClick={onClick}
    >
      {children}
    </div>
  ),
  Group: ({ children, align, justify }) => (
    <div 
      data-testid="group" 
      data-align={align} 
      data-justify={justify}
    >
      {children}
    </div>
  ),
  Stack: ({ children, mt, style }) => (
    <div 
      data-testid="stack" 
      style={{ marginTop: mt, ...style }}
    >
      {children}
    </div>
  ),
  Text: ({ children, classNames, lineClamp }) => (
    <p 
      data-testid="text" 
      className={classNames?.root} 
      data-line-clamp={lineClamp}
    >
      {children}
    </p>
  ),
  Tooltip: ({ children, label, position }) => (
    <div 
      data-testid="tooltip" 
      data-label={label} 
      data-position={position}
    >
      {children}
    </div>
  ),
}))

// Mock the Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconCube: ({ size, color }) => (
    <div data-testid="icon-cube" data-size={size} data-color={color}>
      Cube Icon
    </div>
  ),
}))

describe('ModelCard', () => {
  const mockModel = {
    model_id: 1,
    model_name: 'Test Model',
    provider: 'OpenAI',
    provider_base64_image: 'openai',
    description: 'This is a test model description',
    processor_type: 'CPU',
    vulnerability: 'safe',
    status: 'active',
  }

  const mockHandleCardClick = jest.fn()

  it('renders the model card with correct model name', () => {
    render(
      <ModelCard 
        model={mockModel} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    expect(screen.getByText('Test Model')).toBeInTheDocument()
  })

  it('renders the correct provider icon', () => {
    render(
      <ModelCard 
        model={mockModel} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    expect(screen.getByTestId('openai-icon')).toBeInTheDocument()
  })

  it('renders user icon when provider is empty', () => {
    const modelWithEmptyProvider = {
      ...mockModel,
      provider_base64_image: '',
    }
    
    render(
      <ModelCard 
        model={modelWithEmptyProvider} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('renders processor type badge when available', () => {
    render(
      <ModelCard 
        model={mockModel} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    const badges = screen.getAllByTestId('badge')
    const processorBadge = badges.find(badge => badge.textContent === 'CPU')
    expect(processorBadge).toBeInTheDocument()
  })

  it('renders vulnerability badge with correct color for safe', () => {
    render(
      <ModelCard 
        model={mockModel} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    const badges = screen.getAllByTestId('badge')
    const vulnerabilityBadge = badges.find(badge => badge.textContent === 'safe')
    expect(vulnerabilityBadge).toBeInTheDocument()
    expect(vulnerabilityBadge).toHaveAttribute('data-color', 'green')
  })

  it('renders vulnerability badge with correct color for unsafe', () => {
    const unsafeModel = {
      ...mockModel,
      vulnerability: 'unsafe',
    }
    
    render(
      <ModelCard 
        model={unsafeModel} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    const badges = screen.getAllByTestId('badge')
    const vulnerabilityBadge = badges.find(badge => badge.textContent === 'unsafe')
    expect(vulnerabilityBadge).toBeInTheDocument()
    expect(vulnerabilityBadge).toHaveAttribute('data-color', 'red')
  })

  it('renders the model description', () => {
    render(
      <ModelCard 
        model={mockModel} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    expect(screen.getByText('This is a test model description')).toBeInTheDocument()
  })

  it('renders playground button for non-user cards', () => {
    render(
      <ModelCard 
        model={mockModel} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    expect(screen.getByText('Playground')).toBeInTheDocument()
  })

  it('renders status badge for user cards', () => {
    render(
      <ModelCard 
        model={mockModel} 
        handleCardClick={mockHandleCardClick} 
        user={true} 
      />
    )
    
    const statusBadge = screen.getByText('active')
    expect(statusBadge).toBeInTheDocument()
  })

  it('calls handleCardClick when card is clicked', () => {
    render(
      <ModelCard 
        model={mockModel} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    fireEvent.click(screen.getByTestId('card'))
    expect(mockHandleCardClick).toHaveBeenCalledWith(mockModel)
  })

  it('calls handleCardClick when playground button is clicked', () => {
    render(
      <ModelCard 
        model={mockModel} 
        handleCardClick={mockHandleCardClick} 
        user={false} 
      />
    )
    
    fireEvent.click(screen.getByText('Playground'))
    expect(mockHandleCardClick).toHaveBeenCalledWith(mockModel)
  })
})
