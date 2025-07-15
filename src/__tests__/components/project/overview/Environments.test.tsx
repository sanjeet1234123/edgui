// @ts-nocheck
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MantineProvider } from '@mantine/core'
import Environments from '@/components/project/overview/Environments'

// Mock the Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconServer: () => <div data-testid="server-icon">Server Icon</div>,
}))

// Mock the CSS module
jest.mock('@/components/project/overview/Overview.module.css', () => ({
  cardTitle: 'cardTitle m_8a5d1357',
  cardDescription: 'cardDescription m_8a5d1357',
  environment: 'environment m_b6d8b162',
  environmentName: 'environmentName m_b6d8b162',
  environmentDescription: 'environmentDescription m_b6d8b162',
}))

describe('Environments', () => {
  const renderComponent = () => {
    return render(
      <MantineProvider>
        <Environments />
      </MantineProvider>,
    )
  }

  it('renders the component with correct title and description', () => {
    renderComponent()

    expect(screen.getByText('Environments')).toBeInTheDocument()
    expect(
      screen.getByText('Manage your project environments'),
    ).toBeInTheDocument()
  })

  it('renders all environment items with their names and descriptions', () => {
    renderComponent()

    // Check Development environment
    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(
      screen.getByText('Development and testing environment'),
    ).toBeInTheDocument()

    // Check Staging environment
    expect(screen.getByText('Staging')).toBeInTheDocument()
    expect(
      screen.getByText('Pre-production testing environment'),
    ).toBeInTheDocument()

    // Check Production environment
    expect(screen.getByText('Production')).toBeInTheDocument()
    expect(
      screen.getByText('Live environment for end users'),
    ).toBeInTheDocument()
  })

  it('renders server icons for each environment', () => {
    renderComponent()

    // Should have 3 server icons (one for each environment)
    const serverIcons = screen.getAllByTestId('server-icon')
    expect(serverIcons).toHaveLength(3)
  })

  it('applies correct CSS classes to title and description', () => {
    renderComponent()

    const title = screen.getByText('Environments')
    expect(title.className).toContain('cardTitle')

    const description = screen.getByText('Manage your project environments')
    expect(description.className).toContain('cardDescription')
  })

  it('applies correct CSS classes to environment items', () => {
    renderComponent()

    // Test name and description separately with exact selectors
    const developmentName = screen.getByText('Development')
    expect(developmentName.className).toContain('environmentName')

    const stagingName = screen.getByText('Staging')
    expect(stagingName.className).toContain('environmentName')

    const productionName = screen.getByText('Production')
    expect(productionName.className).toContain('environmentName')

    // Check that each description has the correct class
    const devDescription = screen.getByText(
      'Development and testing environment',
    )
    expect(devDescription.className).toContain('environmentDescription')

    const stagingDescription = screen.getByText(
      'Pre-production testing environment',
    )
    expect(stagingDescription.className).toContain('environmentDescription')

    const prodDescription = screen.getByText('Live environment for end users')
    expect(prodDescription.className).toContain('environmentDescription')
  })

  it('renders the component in a Card with correct structure', () => {
    const { container } = renderComponent()

    // Verify Card structure
    const card = container.querySelector('.mantine-Card-root')
    expect(card).toBeTruthy()

    // Verify Stack structure - there should be multiple stacks
    const stacks = container.querySelectorAll('.mantine-Stack-root')
    expect(stacks.length).toBeGreaterThan(0)

    // Verify Group structure - should have 3 groups for environments
    const groups = container.querySelectorAll('.mantine-Group-root')
    expect(groups.length).toBe(3)
  })
})
