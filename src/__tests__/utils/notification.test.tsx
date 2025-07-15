// @ts-nocheck - Disable TypeScript checking for this test file
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { showNotification } from '@/utils/notification'
import { notifications } from '@mantine/notifications'

// Mock Mantine notifications
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}))

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconCheck: () => <div data-testid="icon-success" />,
  IconAlertTriangle: () => <div data-testid="icon-warning" />,
  IconX: () => <div data-testid="icon-error" />,
}))

describe('Notification Utility', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks()
  })

  it('should call notifications.show with the correct parameters for success', () => {
    showNotification('success', 'Test success message')

    expect(notifications.show).toHaveBeenCalledTimes(1)
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.anything(), // Testing the Text component is difficult, just check it exists
        message: 'Test success message',
        color: 'var(--clr-notification-success)',
      }),
    )
  })

  it('should call notifications.show with the correct parameters for warning', () => {
    showNotification('warning', 'Test warning message')

    expect(notifications.show).toHaveBeenCalledTimes(1)
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.anything(),
        message: 'Test warning message',
        color: 'var(--clr-notification-warning)',
      }),
    )
  })

  it('should call notifications.show with the correct parameters for error', () => {
    showNotification('error', 'Test error message')

    expect(notifications.show).toHaveBeenCalledTimes(1)
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.anything(),
        message: 'Test error message',
        color: 'var(--clr-notification-error)',
      }),
    )
  })
})
