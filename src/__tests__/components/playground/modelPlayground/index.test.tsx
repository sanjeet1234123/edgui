// Mock endpoint to avoid import.meta.env issues
jest.mock('@/constants/endpoint', () => ({
  default: 'http://localhost:3000/v1',
}))

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModelPlayground from '@/components/playground/modelPlayground'
import { MantineProvider } from '@mantine/core'

// Mock child components
jest.mock(
  '@/components/playground/modelPlayground/ModalPlaygroundHeader',
  () => ({
    __esModule: true,
    default: () => <div data-testid="mock-header">Header</div>,
  }),
)

jest.mock(
  '@/components/playground/modelPlayground/ModalPlaygroundChatCard',
  () => ({
    __esModule: true,
    default: ({ sliderValues }: { sliderValues: any }) => (
      <div data-testid="mock-chat-card">
        Chat Card - Temperature: {sliderValues.temperature}
      </div>
    ),
  }),
)

jest.mock(
  '@/components/playground/modelPlayground/ModalPlaygroundConfiguration',
  () => ({
    __esModule: true,
    default: ({
      sliderValues,
      setSliderValues,
    }: {
      sliderValues: any
      setSliderValues: (values: any) => void
    }) => (
      <div data-testid="mock-configuration">
        Configuration
        <button
          onClick={() => setSliderValues({ ...sliderValues, temperature: 0.5 })}
        >
          Update Temperature
        </button>
      </div>
    ),
  }),
)

function renderWithMantineProvider(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>)
}

describe('ModelPlayground', () => {
  it('renders all child components', () => {
    renderWithMantineProvider(<ModelPlayground />)

    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-chat-card')).toBeInTheDocument()
    expect(screen.getByTestId('mock-configuration')).toBeInTheDocument()
  })

  it('initializes with default slider values', () => {
    renderWithMantineProvider(<ModelPlayground />)

    const chatCard = screen.getByTestId('mock-chat-card')
    expect(chatCard).toHaveTextContent('Temperature: 1')
  })

  it('updates slider values when configuration changes', async () => {
    renderWithMantineProvider(<ModelPlayground />)

    const updateButton = screen.getByText('Update Temperature')
    await userEvent.click(updateButton)

    const chatCard = screen.getByTestId('mock-chat-card')
    expect(chatCard).toHaveTextContent('Temperature: 0.5')
  })
})
