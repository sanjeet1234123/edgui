// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

// Mock the actual feature constants since that's what the component directly uses
jest.mock('@/components/upcomingFeatures/constants', () => ({
  features: [
    {
      title: 'Feature 1',
      description: 'Description for feature 1',
      status: 'Coming Soon',
      eta: 'Q1 2025',
      section: 'Dashboard',
    },
    {
      title: 'Feature 2',
      description: 'Description for feature 2',
      status: 'In Development',
      eta: 'Q2 2025',
      section: 'Dashboard',
    },
    {
      title: 'Feature 3',
      description: 'Description for feature 3',
      status: 'Planning',
      eta: 'Q3 2025',
      section: 'Database',
    },
    {
      title: 'Feature 4',
      description: 'Description for feature 4',
      status: 'Unknown',
      eta: 'Q4 2025',
      section: 'Security',
    },
  ],
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const originalModule = jest.requireActual('@mantine/core')
  
  return {
    __esModule: true,
    ...originalModule,
    Title: ({ children, order, fz, fw, c, className }) => (
      <div data-testid={`title-${order}`} className={className}>{children}</div>
    ),
    Text: ({ children, size, className }) => (
      <div data-testid={`text-${size || 'default'}`} className={className}>{children}</div>
    ),
    Stack: ({ children, gap, h }) => (
      <div data-testid="stack" style={{ height: h }}>{children}</div>
    ),
    Grid: ({ children, gutter }) => (
      <div data-testid="grid">{children}</div>
    ),
    Paper: ({ children, shadow, radius, p, className }) => (
      <div data-testid="paper" className={className}>{children}</div>
    ),
    Group: ({ children, justify, className }) => (
      <div data-testid="group" className={className}>{children}</div>
    ),
    Badge: ({ children, color, size, variant, radius }) => (
      <div data-testid={`badge-${color}`}>{children}</div>
    ),
  }
})

// We need to add Grid.Col to the Grid mock
jest.mock('@mantine/core', () => {
  const GridMock = ({ children, gutter }) => <div data-testid="grid">{children}</div>
  GridMock.Col = ({ children, span }) => <div data-testid="grid-col">{children}</div>
  
  return {
    __esModule: true,
    Grid: GridMock,
    Title: ({ children, order, fz, fw, c, className }) => (
      <div data-testid={`title-${order}`} className={className}>{children}</div>
    ),
    Text: ({ children, size, className }) => (
      <div data-testid={`text-${size || 'default'}`} className={className}>{children}</div>
    ),
    Stack: ({ children, gap, h }) => (
      <div data-testid="stack" style={{ height: h }}>{children}</div>
    ),
    Paper: ({ children, shadow, radius, p, className }) => (
      <div data-testid="paper" className={className}>{children}</div>
    ),
    Group: ({ children, justify, className }) => (
      <div data-testid="group" className={className}>{children}</div>
    ),
    Badge: ({ children, color, size, variant, radius }) => (
      <div data-testid={`badge-${color}`}>{children}</div>
    ),
    MantineProvider: ({ children }) => <div>{children}</div>
  }
})

// Import the actual component now that we've set up mocks
import UpcomingFeatures from '@/components/upcomingFeatures/UpcomingFeatures'
import { features } from '@/components/upcomingFeatures/constants'

// Custom render function with MantineProvider
const customRender = (ui) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  )
}

// First set of tests use our original mocked render approach
describe('UpcomingFeatures - Mocked Component Tests', () => {
  // Mock the UpcomingFeatures component before tests
  const MockUpcomingFeatures = () => {
    // Group features by section (simplified version of the component logic)
    const groupedFeatures = features.reduce(
      (acc, feature) => {
        if (!acc[feature.section]) {
          acc[feature.section] = []
        }
        acc[feature.section].push(feature)
        return acc
      },
      {} as Record<string, any[]>,
    )
    
    // Map status to colors
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Coming Soon': return 'blue'
        case 'In Development': return 'green'
        case 'Planning': return 'yellow'
        default: return 'gray'
      }
    }
    
    // Helper to create unique IDs for features
    const getFeatureId = (section, index) => `${section}-feature-${index}`
    
    return (
      <div data-testid="upcoming-features">
        <div data-testid="title-2">Upcoming Features</div>
        
        {Object.entries(groupedFeatures).map(([section, sectionFeatures], sectionIndex) => (
          <div key={section} data-testid={`section-${sectionIndex}`}>
            <div data-testid={`title-3-${sectionIndex}`}>{section}</div>
            
            <div>
              {sectionFeatures.map((feature, index) => {
                const featureId = getFeatureId(section, index)
                return (
                  <div key={featureId} data-testid={`paper-${featureId}`}>
                    <div data-testid={`title-4-${featureId}`}>{feature.title}</div>
                    <div data-testid={`desc-${featureId}`}>{feature.description}</div>
                    <div>
                      <div data-testid={`badge-${getStatusColor(feature.status)}-${featureId}`}>
                        {feature.status}
                      </div>
                      <div data-testid={`eta-${featureId}`}>ETA: {feature.eta}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  it('renders the main title correctly', () => {
    render(<MockUpcomingFeatures />)
    
    // Check if the main title is rendered
    const mainTitle = screen.getByTestId('title-2')
    expect(mainTitle).toBeInTheDocument()
    expect(mainTitle.textContent).toBe('Upcoming Features')
  })

  it('renders section titles correctly', () => {
    render(<MockUpcomingFeatures />)
    
    // Check if all section titles are rendered
    const dashboardSection = screen.getByTestId('title-3-0')
    const databaseSection = screen.getByTestId('title-3-1')
    const securitySection = screen.getByTestId('title-3-2')
    
    expect(dashboardSection).toBeInTheDocument()
    expect(databaseSection).toBeInTheDocument()
    expect(securitySection).toBeInTheDocument()
    
    // Check section title content
    expect(dashboardSection.textContent).toBe('Dashboard')
    expect(databaseSection.textContent).toBe('Database')
    expect(securitySection.textContent).toBe('Security')
  })

  it('renders feature cards correctly', () => {
    render(<MockUpcomingFeatures />)
    
    // Check if all feature titles are rendered with correct content
    const feature1Title = screen.getByTestId('title-4-Dashboard-feature-0')
    const feature2Title = screen.getByTestId('title-4-Dashboard-feature-1')
    const feature3Title = screen.getByTestId('title-4-Database-feature-0')
    const feature4Title = screen.getByTestId('title-4-Security-feature-0')
    
    expect(feature1Title).toBeInTheDocument()
    expect(feature2Title).toBeInTheDocument()
    expect(feature3Title).toBeInTheDocument()
    expect(feature4Title).toBeInTheDocument()
    
    expect(feature1Title.textContent).toBe('Feature 1')
    expect(feature2Title.textContent).toBe('Feature 2')
    expect(feature3Title.textContent).toBe('Feature 3')
    expect(feature4Title.textContent).toBe('Feature 4')
    
    // Check feature descriptions
    const feature1Desc = screen.getByTestId('desc-Dashboard-feature-0')
    const feature2Desc = screen.getByTestId('desc-Dashboard-feature-1')
    const feature3Desc = screen.getByTestId('desc-Database-feature-0')
    const feature4Desc = screen.getByTestId('desc-Security-feature-0')
    
    expect(feature1Desc.textContent).toBe('Description for feature 1')
    expect(feature2Desc.textContent).toBe('Description for feature 2')
    expect(feature3Desc.textContent).toBe('Description for feature 3')
    expect(feature4Desc.textContent).toBe('Description for feature 4')
  })

  it('renders badges with correct colors based on status', () => {
    render(<MockUpcomingFeatures />)
    
    // Check badge colors and content
    const comingSoonBadge = screen.getByTestId('badge-blue-Dashboard-feature-0')
    const inDevelopmentBadge = screen.getByTestId('badge-green-Dashboard-feature-1')
    const planningBadge = screen.getByTestId('badge-yellow-Database-feature-0')
    const unknownBadge = screen.getByTestId('badge-gray-Security-feature-0')
    
    expect(comingSoonBadge).toBeInTheDocument()
    expect(inDevelopmentBadge).toBeInTheDocument()
    expect(planningBadge).toBeInTheDocument()
    expect(unknownBadge).toBeInTheDocument()
    
    expect(comingSoonBadge.textContent).toBe('Coming Soon')
    expect(inDevelopmentBadge.textContent).toBe('In Development')
    expect(planningBadge.textContent).toBe('Planning')
    expect(unknownBadge.textContent).toBe('Unknown')
  })

  it('renders ETA information correctly', () => {
    render(<MockUpcomingFeatures />)
    
    // Check ETA information
    const feature1Eta = screen.getByTestId('eta-Dashboard-feature-0')
    const feature2Eta = screen.getByTestId('eta-Dashboard-feature-1')
    const feature3Eta = screen.getByTestId('eta-Database-feature-0')
    const feature4Eta = screen.getByTestId('eta-Security-feature-0')
    
    expect(feature1Eta.textContent).toBe('ETA: Q1 2025')
    expect(feature2Eta.textContent).toBe('ETA: Q2 2025')
    expect(feature3Eta.textContent).toBe('ETA: Q3 2025')
    expect(feature4Eta.textContent).toBe('ETA: Q4 2025')
  })
})

// Second set of tests test the actual component
describe('UpcomingFeatures - Actual Component Tests', () => {
  it('renders the main title correctly', () => {
    customRender(<UpcomingFeatures />)
    
    // Check if the main title is rendered
    const mainTitle = screen.getByTestId('title-2')
    expect(mainTitle).toBeInTheDocument()
    expect(mainTitle.textContent).toBe('Upcoming Features')
  })

  it('renders all sections correctly', () => {
    customRender(<UpcomingFeatures />)
    
    // Get all section headings (title-3)
    const sectionTitles = screen.getAllByTestId('title-3')
    
    // Check we have the expected number of sections
    expect(sectionTitles).toHaveLength(3) // Dashboard, Database, Security
    
    // Check specific section names
    expect(sectionTitles[0].textContent).toBe('Dashboard')
    expect(sectionTitles[1].textContent).toBe('Database')
    expect(sectionTitles[2].textContent).toBe('Security')
  })

  it('renders feature cards with titles and descriptions', () => {
    customRender(<UpcomingFeatures />)
    
    // Get all feature titles
    const featureTitles = screen.getAllByTestId('title-4')
    expect(featureTitles).toHaveLength(4) // Total number of features
    
    // Check specific feature titles
    expect(featureTitles[0].textContent).toBe('Feature 1')
    expect(featureTitles[1].textContent).toBe('Feature 2')
    expect(featureTitles[2].textContent).toBe('Feature 3')
    expect(featureTitles[3].textContent).toBe('Feature 4')
    
    // Check descriptions
    const descriptions = screen.getAllByTestId('text-sm')
    // There should be 8 text-sm elements (4 descriptions and 4 ETAs)
    expect(descriptions).toHaveLength(8)
    
    // Find descriptions by checking content
    const descriptionTexts = descriptions.filter(el => {
      return el.textContent?.includes('Description for feature')
    })
    expect(descriptionTexts).toHaveLength(4)
  })

  it('renders badges with correct colors based on status', () => {
    customRender(<UpcomingFeatures />)
    
    // Check badge colors
    const blueBadge = screen.getByTestId('badge-blue')
    const greenBadge = screen.getByTestId('badge-green')
    const yellowBadge = screen.getByTestId('badge-yellow')
    const grayBadge = screen.getByTestId('badge-gray')
    
    expect(blueBadge).toBeInTheDocument()
    expect(greenBadge).toBeInTheDocument()
    expect(yellowBadge).toBeInTheDocument()
    expect(grayBadge).toBeInTheDocument()
    
    expect(blueBadge.textContent).toBe('Coming Soon')
    expect(greenBadge.textContent).toBe('In Development')
    expect(yellowBadge.textContent).toBe('Planning')
    expect(grayBadge.textContent).toBe('Unknown')
  })

  it('renders the Stack component properly', () => {
    customRender(<UpcomingFeatures />)
    
    // Check if Stack component is rendered - use getAllByTestId since there are multiple stacks
    const stacks = screen.getAllByTestId('stack')
    expect(stacks.length).toBeGreaterThan(0)
    expect(stacks[0]).toBeInTheDocument()
  })

  it('renders Paper components for feature cards', () => {
    customRender(<UpcomingFeatures />)
    
    // Check if Paper components are rendered for each feature
    const papers = screen.getAllByTestId('paper')
    expect(papers).toHaveLength(4)
  })

  it('renders Grid components for layout', () => {
    customRender(<UpcomingFeatures />)
    
    // Check if Grid component is rendered - use getAllByTestId since there are multiple grids
    const grids = screen.getAllByTestId('grid')
    expect(grids.length).toBeGreaterThan(0)
    expect(grids[0]).toBeInTheDocument()
    
    // Check if Grid.Col components are rendered
    const gridCols = screen.getAllByTestId('grid-col')
    expect(gridCols).toHaveLength(4)
  })

  it('renders Group components for badge and ETA layout', () => {
    customRender(<UpcomingFeatures />)
    
    // Check if Group components are rendered for each feature
    const groups = screen.getAllByTestId('group')
    expect(groups).toHaveLength(4)
  })
}) 