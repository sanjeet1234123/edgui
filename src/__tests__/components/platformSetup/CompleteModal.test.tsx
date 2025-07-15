// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import CompleteModal from '@/components/platformSetup/CompleteModal'
import { PATHS } from '@/constants/paths'

// Mock the useNavigate hook
const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock the image import
jest.mock('@/assets/images/completeModal.svg', () => 'complete-modal-image')

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Image: ({ src, w, fit }) => (
    <img
      data-testid="modal-image"
      src={src}
      width={w}
      style={{ objectFit: fit }}
      alt="Complete Modal"
    />
  ),
  Modal: ({
    opened,
    onClose,
    centered,
    size,
    radius,
    padding,
    withCloseButton,
    children,
  }) =>
    opened ? (
      <div
        data-testid="modal"
        data-centered={centered}
        data-size={size}
        data-radius={radius}
        data-padding={padding}
        data-close-button={withCloseButton}
      >
        {children}
      </div>
    ) : null,
  Space: ({ h }) => <div data-testid="space" data-height={h}></div>,
  Stack: ({ justify, align, children }) => (
    <div data-testid="stack" data-justify={justify} data-align={align}>
      {children}
    </div>
  ),
  Text: ({ ta, c, fw, fz, children }) => (
    <p
      data-testid="text"
      data-align={ta}
      data-color={c}
      data-fontweight={fw}
      data-fontsize={fz}
    >
      {children}
    </p>
  ),
}))

describe('CompleteModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should not render when opened is false', () => {
    render(<CompleteModal opened={false} />)

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('should render correctly when opened is true', () => {
    render(<CompleteModal opened={true} />)

    // Check modal props
    const modal = screen.getByTestId('modal')
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveAttribute('data-centered', 'true')
    expect(modal).toHaveAttribute('data-size', 'lg')
    expect(modal).toHaveAttribute('data-radius', 'lg')
    expect(modal).toHaveAttribute('data-padding', 'xl')
    expect(modal).toHaveAttribute('data-close-button', 'false')

    // Check stack props
    const stack = screen.getByTestId('stack')
    expect(stack).toHaveAttribute('data-justify', 'center')
    expect(stack).toHaveAttribute('data-align', 'center')

    // Check image
    const image = screen.getByTestId('modal-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'complete-modal-image')
    expect(image).toHaveAttribute('width', '200px')

    // Check text content
    const textElements = screen.getAllByTestId('text')
    expect(textElements).toHaveLength(2)
    expect(textElements[0].textContent).toBe(
      'NexaStack AI Platform Onboarding successful',
    )
    expect(textElements[1].textContent).toBe(
      "You have been successfully onboarded. You're all set to start deploying, managing resources, and exploring powerful cloud capabilities.",
    )

    // Check space element
    expect(screen.getByTestId('space')).toBeInTheDocument()
    expect(screen.getByTestId('space')).toHaveAttribute('data-height', 'xl')
  })

  it('should navigate to marketplace after timeout when opened', () => {
    render(<CompleteModal opened={true} />)

    // Initially, navigate should not have been called
    expect(mockNavigate).not.toHaveBeenCalled()

    // Advance timers by 1000ms
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Now navigate should have been called with PATHS.MARKETPLACE
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.MARKETPLACE })
  })

  it('should not set timeout when opened is false', () => {
    render(<CompleteModal opened={false} />)

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Navigate should not be called
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should clear the timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { unmount } = render(<CompleteModal opened={true} />)

    // Unmount the component
    unmount()

    // clearTimeout should have been called
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
