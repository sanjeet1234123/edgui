// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { features } from '@/components/upcomingFeatures/constants'
import type { Feature } from '@/components/upcomingFeatures/constants'
import UpcomingFeatures from '@/components/upcomingFeatures/UpcomingFeatures'

// Mock Mantine components as in the original test
jest.mock('@mantine/core', () => {
  const GridMock = ({ children, gutter }: { children: React.ReactNode, gutter?: any }) => 
    <div data-testid="grid">{children}</div>
  GridMock.Col = ({ children, span }: { children: React.ReactNode, span?: any }) => 
    <div data-testid="grid-col">{children}</div>
  
  return {
    __esModule: true,
    Grid: GridMock,
    Title: ({ children, order, fz, fw, c, className }: { 
      children: React.ReactNode, 
      order?: number, 
      fz?: string, 
      fw?: string, 
      c?: string, 
      className?: string 
    }) => (
      <div data-testid={`title-${order}`} className={className}>{children}</div>
    ),
    Text: ({ children, size, className }: { 
      children: React.ReactNode, 
      size?: string, 
      className?: string 
    }) => (
      <div data-testid={`text-${size || 'default'}`} className={className}>{children}</div>
    ),
    Stack: ({ children, gap, h }: { 
      children: React.ReactNode, 
      gap?: string, 
      h?: string 
    }) => (
      <div data-testid="stack" style={{ height: h }}>{children}</div>
    ),
    Paper: ({ children, shadow, radius, p, className }: { 
      children: React.ReactNode, 
      shadow?: string, 
      radius?: string, 
      p?: string, 
      className?: string 
    }) => (
      <div data-testid="paper" className={className}>{children}</div>
    ),
    Group: ({ children, justify, className }: { 
      children: React.ReactNode, 
      justify?: string, 
      className?: string 
    }) => (
      <div data-testid="group" className={className}>{children}</div>
    ),
    Badge: ({ children, color, size, variant, radius }: { 
      children: React.ReactNode, 
      color?: string, 
      size?: string, 
      variant?: string, 
      radius?: string 
    }) => (
      <div data-testid={`badge-${color}`}>{children}</div>
    ),
    MantineProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  }
})

// Custom render function with MantineProvider
const customRender = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  )
}

describe('UpcomingFeatures Component and Constants Integration', () => {
  it('should render all sections from constants', () => {
    customRender(<UpcomingFeatures />)
    
    // Get unique sections from constants
    const sections = [...new Set(features.map(feature => feature.section))]
    
    // Get all section titles
    const sectionTitles = screen.getAllByTestId('title-3')
    
    // Check if we have the correct number of sections
    expect(sectionTitles).toHaveLength(sections.length)
    
    // Check each section title is rendered
    sections.forEach(section => {
      const sectionTitle = sectionTitles.find(
        element => element.textContent === section
      )
      expect(sectionTitle).toBeInTheDocument()
    })
  })

  it('should render all features from constants', () => {
    customRender(<UpcomingFeatures />)
    
    // Get all feature titles
    const featureTitles = screen.getAllByTestId('title-4')
    
    // Check if we have the correct number of features
    expect(featureTitles).toHaveLength(features.length)
    
    // Check each feature title is rendered
    features.forEach(feature => {
      const featureTitle = featureTitles.find(
        element => element.textContent === feature.title
      )
      expect(featureTitle).toBeInTheDocument()
    })
  })

  it('should render correct status badges for each status type', () => {
    customRender(<UpcomingFeatures />)
    
    // Get unique statuses from constants
    const statuses = [...new Set(features.map(feature => feature.status))]
    
    // Map of statuses to colors
    const statusColorMap: Record<string, string> = {
      'Coming Soon': 'blue',
      'In Development': 'green',
      'Planning': 'yellow',
      'Unknown': 'gray'
    }
    
    // Check if badges for each status type are rendered
    statuses.forEach(status => {
      const color = statusColorMap[status] || 'gray'
      const badges = screen.getAllByTestId(`badge-${color}`)
      
      // Check we have at least one badge of this color
      expect(badges.length).toBeGreaterThan(0)
      
      // Check at least one badge has the correct text content
      const matchingBadge = badges.find(badge => badge.textContent === status)
      expect(matchingBadge).toBeInTheDocument()
    })
  })

  it('should render all ETAs correctly', () => {
    customRender(<UpcomingFeatures />)
    
    // Get all text items that might contain ETAs
    const textElements = screen.getAllByTestId('text-sm')
    
    // Filter text elements that have ETA content
    const etaElements = textElements.filter(element => 
      element.textContent && element.textContent.startsWith('ETA:')
    )
    
    // Check we have the right number of ETAs
    expect(etaElements).toHaveLength(features.length)
    
    // Check each feature's ETA is displayed
    features.forEach(feature => {
      const etaElement = etaElements.find(element => 
        element.textContent === `ETA: ${feature.eta}`
      )
      expect(etaElement).toBeInTheDocument()
    })
  })

  it('should render all feature descriptions', () => {
    customRender(<UpcomingFeatures />)
    
    // Get all text items that might contain descriptions
    const textElements = screen.getAllByTestId('text-sm')
    
    // Check each feature's description is displayed
    features.forEach(feature => {
      const descElement = textElements.find(element => 
        element.textContent === feature.description
      )
      expect(descElement).toBeInTheDocument()
    })
  })
}) 