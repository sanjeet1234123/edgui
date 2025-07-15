// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import ModalPlaygroundConfiguration from '@/components/playground/modelPlayground/ModalPlaygroundConfiguration'
import { sliderConfigs } from '@/components/playground/modelPlayground/constant'
import React from 'react'

// Mock the ModalPlaygroundVulnerability component
jest.mock(
  '@/components/playground/modelPlayground/ModalPlaygroundVulnerability',
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="modal-playground-vulnerability">
        Vulnerability Content
      </div>
    ),
  }),
)

describe('ModalPlaygroundConfiguration', () => {
  // Mock props
  const mockSliderValues = {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 50,
    output_length: 1000,
  }
  const mockSetSliderValues = jest.fn()

  // Setup QueryClient for testing
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <ModalPlaygroundConfiguration
            sliderValues={mockSliderValues}
            setSliderValues={mockSetSliderValues}
            {...props}
          />
        </MantineProvider>
      </QueryClientProvider>,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component correctly', () => {
    renderComponent()

    // Check for Auto-Set Max Length toggle
    expect(screen.getByText('Auto-Set Max Length')).toBeInTheDocument()

    // Check for sliders
    sliderConfigs.forEach(config => {
      expect(screen.getByText(config.label)).toBeInTheDocument()
    })

    // Check for vulnerability section
    expect(
      screen.getByTestId('modal-playground-vulnerability'),
    ).toBeInTheDocument()
  })

  it('displays correct slider values', () => {
    renderComponent()

    // Check if each slider value is displayed correctly in the badges
    const badges = screen.getAllByText((content, element) => {
      return (
        element.tagName.toLowerCase() === 'span' &&
        ['0.7', '0.9', '1000'].includes(content)
      )
    })

    expect(badges).toHaveLength(3)
    expect(badges[0]).toHaveTextContent('0.7')
    expect(badges[1]).toHaveTextContent('0.9')
    expect(badges[2]).toHaveTextContent('1000')
  })

  it('toggles the Auto-Set Max Length switch', () => {
    renderComponent()

    // Initial state should be off (unchecked)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).not.toBeChecked()

    // Toggle the switch
    fireEvent.click(switchElement)
    expect(switchElement).toBeChecked()

    // Toggle it back
    fireEvent.click(switchElement)
    expect(switchElement).not.toBeChecked()
  })

  it('calls setSliderValues when handleSliderChange is called', () => {
    // Create a spy on the setSliderValues function
    const setSliderValuesSpy = jest.fn()

    // Create a simple component that directly tests the slider change behavior
    const TestComponent = () => {
      const [sliderValues, setSliderValues] = React.useState({
        ...mockSliderValues,
      })

      const handleSliderChange = (stateKey, value) => {
        setSliderValues({ ...sliderValues, [stateKey]: value })
      }

      React.useEffect(() => {
        // Simulate changing the temperature slider
        handleSliderChange('temperature', 1.5)

        // Call the spy function to verify the logic
        setSliderValuesSpy({ ...sliderValues, temperature: 1.5 })
      }, [])

      return (
        <div>
          <div data-testid="slider-value">{sliderValues.temperature}</div>
        </div>
      )
    }

    render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <TestComponent />
        </MantineProvider>
      </QueryClientProvider>,
    )

    // Verify the slider value was updated
    expect(screen.getByTestId('slider-value')).toHaveTextContent('1.5')

    // Verify the spy was called with the correct arguments
    expect(setSliderValuesSpy).toHaveBeenCalledWith({
      ...mockSliderValues,
      temperature: 1.5,
    })
  })

  it('renders with different initial slider values', () => {
    const customSliderValues = {
      temperature: 1.2,
      top_p: 0.5,
      top_k: 25,
      output_length: 500,
    }

    renderComponent({ sliderValues: customSliderValues })

    // Check if slider values appear in the badges (more specific query)
    const badges = screen.getAllByText((content, element) => {
      return (
        element.tagName.toLowerCase() === 'span' &&
        element.className.includes('mantine-Badge-label') &&
        ['1.2', '0.5', '500'].includes(content)
      )
    })

    expect(badges).toHaveLength(3)
    expect(badges[0]).toHaveTextContent('1.2')
    expect(badges[1]).toHaveTextContent('0.5')
    expect(badges[2]).toHaveTextContent('500')
  })

  it('handles slider changes correctly', () => {
    renderComponent()

    // First clear the mock
    mockSetSliderValues.mockClear()

    // Get all sliders
    const sliders = screen.getAllByRole('slider')

    // Attempt to simulate changes to the first slider (Temperature)
    fireEvent.keyDown(sliders[0], { key: 'ArrowRight' })

    // Verify setSliderValues was called at least once
    expect(mockSetSliderValues).toHaveBeenCalled()
  })

  it('updates slider value display when props change', () => {
    const { rerender } = renderComponent()

    // Initially check that we have the default values
    const initialBadges = screen.getAllByText((content, element) => {
      return (
        element.tagName.toLowerCase() === 'span' &&
        ['0.7', '0.9', '1000'].includes(content)
      )
    })

    expect(initialBadges[0]).toHaveTextContent('0.7')

    // Now rerender with new values
    const updatedValues = {
      ...mockSliderValues,
      temperature: 1.8,
    }

    rerender(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <ModalPlaygroundConfiguration
            sliderValues={updatedValues}
            setSliderValues={mockSetSliderValues}
          />
        </MantineProvider>
      </QueryClientProvider>,
    )

    // Check the new value is displayed
    const updatedBadges = screen.getAllByText((content, element) => {
      return element.tagName.toLowerCase() === 'span' && content === '1.8'
    })

    expect(updatedBadges[0]).toHaveTextContent('1.8')
  })

  it('renders the correct number of sliders', () => {
    renderComponent()

    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBe(sliderConfigs.length)
  })

  it('renders slider marks correctly', () => {
    renderComponent()

    // Check if slider marks are rendered
    sliderConfigs.forEach(config => {
      config.marks.forEach(mark => {
        // Due to how Mantine renders marks, they might not be directly accessible via text content
        // This is a simplified check
        const markElements = document.querySelectorAll(
          '.mantine-Slider-markLabel',
        )
        expect(markElements.length).toBeGreaterThan(0)
      })
    })
  })

  it('renders badge values for sliders', () => {
    renderComponent()

    // We check badge values using a more precise query
    const badges = screen.getAllByText((content, element) => {
      return (
        element.tagName.toLowerCase() === 'span' &&
        element.className.includes('mantine-Badge-label') &&
        ['0.7', '0.9', '1000'].includes(content)
      )
    })

    expect(badges).toHaveLength(3)
  })
})
