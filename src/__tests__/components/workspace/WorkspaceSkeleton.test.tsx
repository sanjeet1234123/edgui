// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import WorkspaceSkeleton from '@/components/workspace/WorkspaceSkeleton'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Group: ({ children, justify, align, gap }) => (
    <div data-testid="mantine-group" data-justify={justify} data-align={align} data-gap={gap}>
      {children}
    </div>
  ),
  Stack: ({ children, gap, h, className }) => (
    <div 
      data-testid="mantine-stack" 
      data-gap={gap} 
      data-h={h} 
      className={className}
    >
      {children}
    </div>
  ),
  Card: ({ children, withBorder, radius, h }) => (
    <div 
      data-testid="mantine-card" 
      data-with-border={withBorder} 
      data-radius={radius} 
      data-h={h}
    >
      {children}
    </div>
  ),
  Skeleton: ({ height, width, radius }) => (
    <div 
      data-testid="mantine-skeleton"
      data-height={height}
      data-width={width}
      data-radius={radius}
    ></div>
  )
}))

describe('WorkspaceSkeleton', () => {
  it('renders the component structure correctly', () => {
    const { container } = render(<WorkspaceSkeleton />)
    
    // Check that the main structure is rendered
    const stacks = screen.getAllByTestId('mantine-stack')
    expect(stacks.length).toBeGreaterThan(0)
    
    // Verify the root stack has the flex-grow class
    const rootStack = stacks.find(stack => stack.className === 'flex-grow')
    expect(rootStack).toBeInTheDocument()
  })

  it('renders the header skeleton', () => {
    render(<WorkspaceSkeleton />)
    
    // Check header skeleton elements
    const groupElements = screen.getAllByTestId('mantine-group')
    expect(groupElements.length).toBeGreaterThan(0)

    const skeletons = screen.getAllByTestId('mantine-skeleton')
    const headerSkeleton = skeletons.find(
      skeleton => skeleton.getAttribute('data-height') === '32' && 
                  skeleton.getAttribute('data-width') === '200'
    )
    expect(headerSkeleton).toBeInTheDocument()

    // Check the action button skeleton
    const actionSkeleton = skeletons.find(
      skeleton => skeleton.getAttribute('data-height') === '40' && 
                  skeleton.getAttribute('data-width') === '40' &&
                  skeleton.getAttribute('data-radius') === 'md'
    )
    expect(actionSkeleton).toBeInTheDocument()
  })

  it('renders the tab control skeleton', () => {
    render(<WorkspaceSkeleton />)
    
    const skeletons = screen.getAllByTestId('mantine-skeleton')
    const tabSkeleton = skeletons.find(
      skeleton => skeleton.getAttribute('data-height') === '36' && 
                  skeleton.getAttribute('data-width') === '300' &&
                  skeleton.getAttribute('data-radius') === 'md'
    )
    expect(tabSkeleton).toBeInTheDocument()
  })

  it('renders two card components', () => {
    render(<WorkspaceSkeleton />)
    
    const cards = screen.getAllByTestId('mantine-card')
    expect(cards.length).toBe(2)
    
    // Check that both cards have correct attributes
    cards.forEach(card => {
      expect(card).toHaveAttribute('data-with-border', 'true')
      expect(card).toHaveAttribute('data-radius', 'md')
      expect(card).toHaveAttribute('data-h', '100%')
    })
  })

  it('renders the workspace details card skeleton', () => {
    render(<WorkspaceSkeleton />)
    
    const skeletons = screen.getAllByTestId('mantine-skeleton')
    
    // Title skeletons in the first card
    const titleSkeleton = skeletons.find(
      skeleton => skeleton.getAttribute('data-height') === '24' && 
                  skeleton.getAttribute('data-width') === '150'
    )
    expect(titleSkeleton).toBeInTheDocument()
    
    // Description skeleton
    const descriptionSkeleton = skeletons.find(
      skeleton => skeleton.getAttribute('data-height') === '16' && 
                  skeleton.getAttribute('data-width') === '200'
    )
    expect(descriptionSkeleton).toBeInTheDocument()
  })

  it('renders the workspace members card skeleton with member skeletons', () => {
    render(<WorkspaceSkeleton />)
    
    const skeletons = screen.getAllByTestId('mantine-skeleton')
    
    // Check for member avatar skeletons
    const avatarSkeletons = skeletons.filter(
      skeleton => skeleton.getAttribute('data-height') === '40' && 
                  skeleton.getAttribute('data-width') === '40' &&
                  skeleton.getAttribute('data-radius') === 'xl'
    )
    expect(avatarSkeletons.length).toBe(3) // Should have 3 member skeletons
    
    // Check for invite button skeleton
    const inviteButtonSkeleton = skeletons.find(
      skeleton => skeleton.getAttribute('data-height') === '36' && 
                  skeleton.getAttribute('data-width') === '100' &&
                  skeleton.getAttribute('data-radius') === 'md'
    )
    expect(inviteButtonSkeleton).toBeInTheDocument()
  })
})
