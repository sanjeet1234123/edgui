// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChangePassword from '@/components/accountSettings/ChangePassword'
import { MantineProvider } from '@mantine/core'

// Mock the dependencies
jest.mock('@/hooks/mutations/useUserDetailsMutations', () => ({
  useChangePasswordMutation: jest.fn(),
}))

jest.mock('@/utils/commonFunction', () => ({
  getStrength: jest.fn(),
}))

jest.mock('@/components/accountSettings/PasswordRequirement', () => {
  return function MockPasswordRequirement({
    meets,
    label,
  }: {
    meets: boolean
    label: string
  }) {
    return (
      <div data-testid="password-requirement" data-meets={meets}>
        {label}
      </div>
    )
  }
})

// Mock zod validation with proper chaining
jest.mock('zod', () => {
  const mockRegex = jest.fn(() => mockString)
  const mockMin = jest.fn(() => mockString)
  const mockString = {
    min: mockMin,
    regex: mockRegex,
  }

  const mockRefine = jest.fn(() => ({}))
  const mockObject = jest.fn(() => ({
    refine: mockRefine,
  }))

  return {
    z: {
      string: jest.fn(() => mockString),
      object: mockObject,
    },
  }
})

jest.mock('mantine-form-zod-resolver', () => ({
  zodResolver: jest.fn(() => jest.fn()),
}))

// Mock Mantine form
jest.mock('@mantine/form', () => ({
  useForm: jest.fn(),
}))

// Create a custom render function
const customRender = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>)
}

describe('ChangePassword', () => {
  const mockMutate = jest.fn()
  const mockClose = jest.fn()
  const mockFormReset = jest.fn()
  const mockGetInputProps = jest.fn()
  const mockOnSubmit = jest.fn()

  const mockForm = {
    getInputProps: mockGetInputProps,
    onSubmit: mockOnSubmit,
    values: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    reset: mockFormReset,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock useChangePasswordMutation
    require('@/hooks/mutations/useUserDetailsMutations').useChangePasswordMutation.mockReturnValue(
      {
        mutate: mockMutate,
        isPending: false,
      },
    )

    // Mock getStrength function
    require('@/utils/commonFunction').getStrength.mockReturnValue(50)

    // Mock useForm
    require('@mantine/form').useForm.mockReturnValue(mockForm)

    mockGetInputProps.mockImplementation(field => ({
      value: mockForm.values[field] || '',
      onChange: jest.fn(),
      onBlur: jest.fn(),
    }))

    mockOnSubmit.mockImplementation(callback => e => {
      e.preventDefault()
      callback(mockForm.values)
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('does not render modal when opened is false', () => {
      customRender(<ChangePassword close={mockClose} opened={false} />)

      expect(screen.queryByText('Change Password')).not.toBeInTheDocument()
    })

    it('renders submit button', () => {
      customRender(<ChangePassword close={mockClose} opened={true} />)

      const submitButton = screen.getByRole('button', {
        name: 'Change Password',
      })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('Form Interactions', () => {
    it('calls getInputProps for each form field', () => {
      customRender(<ChangePassword close={mockClose} opened={true} />)

      expect(mockGetInputProps).toHaveBeenCalledWith('currentPassword')
      expect(mockGetInputProps).toHaveBeenCalledWith('newPassword')
      expect(mockGetInputProps).toHaveBeenCalledWith('confirmPassword')
    })

    it('handles form submission', async () => {
      const user = userEvent.setup()

      customRender(<ChangePassword close={mockClose} opened={true} />)

      const submitButton = screen.getByRole('button', {
        name: 'Change Password',
      })
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalled()
    })

    it('disables submit button when isPending is true', () => {
      require('@/hooks/mutations/useUserDetailsMutations').useChangePasswordMutation.mockReturnValue(
        {
          mutate: mockMutate,
          isPending: true,
        },
      )

      customRender(<ChangePassword close={mockClose} opened={true} />)

      const submitButton = screen.getByRole('button', {
        name: 'Change Password',
      })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Submission and Mutation', () => {
    it('calls mutation with correct data format', () => {
      const testValues = {
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      }

      mockOnSubmit.mockImplementation(callback => e => {
        e.preventDefault()
        callback(testValues)
      })

      customRender(<ChangePassword close={mockClose} opened={true} />)

      // Trigger form submission
      const submitButton = screen.getByRole('button', {
        name: 'Change Password',
      })
      fireEvent.click(submitButton)

      expect(mockMutate).toHaveBeenCalledWith(
        {
          old_password: 'oldpass123',
          new_password: 'newpass123',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      )
    })

    it('handles successful password change', () => {
      const testValues = {
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      }

      let onSuccessCallback
      mockMutate.mockImplementation((data, { onSuccess }) => {
        onSuccessCallback = onSuccess
      })

      mockOnSubmit.mockImplementation(callback => e => {
        e.preventDefault()
        callback(testValues)
      })

      customRender(<ChangePassword close={mockClose} opened={true} />)

      // Trigger form submission
      const submitButton = screen.getByRole('button', {
        name: 'Change Password',
      })
      fireEvent.click(submitButton)

      // Simulate successful mutation
      if (onSuccessCallback) {
        onSuccessCallback()
      }

      expect(mockFormReset).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('Component State Management', () => {
    it('initializes with default form values', () => {
      customRender(<ChangePassword close={mockClose} opened={true} />)

      expect(require('@mantine/form').useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          },
        }),
      )
    })

    it('uses zodResolver for form validation', () => {
      customRender(<ChangePassword close={mockClose} opened={true} />)

      expect(require('@mantine/form').useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          validate: expect.any(Function),
        }),
      )
    })
  })

  describe('Password Strength Calculation', () => {
    it('calls getStrength with current password value', () => {
      mockForm.values.newPassword = 'testpass123'

      customRender(<ChangePassword close={mockClose} opened={true} />)

      expect(
        require('@/utils/commonFunction').getStrength,
      ).toHaveBeenCalledWith('testpass123')
    })

    it('handles different password values for strength calculation', () => {
      const passwords = ['', 'weak', 'StrongerPass123!', 'a1B@']

      passwords.forEach(password => {
        jest.clearAllMocks()
        mockForm.values.newPassword = password

        const { unmount } = customRender(
          <ChangePassword close={mockClose} opened={true} />,
        )

        expect(
          require('@/utils/commonFunction').getStrength,
        ).toHaveBeenCalledWith(password)
        unmount()
      })
    })
  })
})
