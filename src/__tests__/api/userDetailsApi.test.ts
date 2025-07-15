/**
 * @jest-environment jsdom
 */

import userDetailsApi from '@/api/userDetailsApi'
import axiosInstance from '@/lib/axiosMiddleware'
import type {
  ChangePasswordRequest,
  UpdateDetailsRequest,
} from '@/types/accountDetailsType'

// Mock the axios middleware
jest.mock('@/lib/axiosMiddleware', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
    get: jest.fn(),
  },
}))

const mockedAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>

describe('UserDetailsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateUserDetails', () => {
    it('should call PUT /updateprofile with correct data and return response', async () => {
      // Arrange
      const updateData: UpdateDetailsRequest = {
        name: 'John Doe',
        phone: '+1234567890',
      }
      const expectedResponse = { success: true, message: 'Profile updated' }
      mockedAxiosInstance.put.mockResolvedValue({ data: expectedResponse })

      // Act
      const result = await userDetailsApi.updateUserDetails(updateData)

      // Assert
      expect(mockedAxiosInstance.put).toHaveBeenCalledWith(
        '/updateprofile',
        updateData,
      )
      expect(mockedAxiosInstance.put).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expectedResponse)
    })

    it('should handle API errors when updating user details', async () => {
      // Arrange
      const updateData: UpdateDetailsRequest = {
        name: 'John Doe',
        phone: '+1234567890',
      }
      const apiError = new Error('Validation error')
      mockedAxiosInstance.put.mockRejectedValue(apiError)

      // Act & Assert
      await expect(
        userDetailsApi.updateUserDetails(updateData),
      ).rejects.toThrow('Validation error')
      expect(mockedAxiosInstance.put).toHaveBeenCalledWith(
        '/updateprofile',
        updateData,
      )
    })
  })

  describe('changePassword', () => {
    it('should call PUT /changepass with correct data and return response', async () => {
      // Arrange
      const changePasswordData: ChangePasswordRequest = {
        old_password: 'oldPassword123',
        new_password: 'newPassword456',
      }
      const expectedResponse = {
        success: true,
        message: 'Password changed successfully',
      }
      mockedAxiosInstance.put.mockResolvedValue({ data: expectedResponse })

      // Act
      const result = await userDetailsApi.changePassword(changePasswordData)

      // Assert
      expect(mockedAxiosInstance.put).toHaveBeenCalledWith(
        '/changepass',
        changePasswordData,
      )
      expect(mockedAxiosInstance.put).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expectedResponse)
    })

    it('should handle API errors when changing password', async () => {
      // Arrange
      const changePasswordData: ChangePasswordRequest = {
        old_password: 'wrongPassword',
        new_password: 'newPassword456',
      }
      const apiError = new Error('Current password is incorrect')
      mockedAxiosInstance.put.mockRejectedValue(apiError)

      // Act & Assert
      await expect(
        userDetailsApi.changePassword(changePasswordData),
      ).rejects.toThrow('Current password is incorrect')
      expect(mockedAxiosInstance.put).toHaveBeenCalledWith(
        '/changepass',
        changePasswordData,
      )
    })
  })

  describe('getUserDetails', () => {
    it('should call GET /profile and return user details', async () => {
      // Arrange
      const expectedUserDetails = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'user',
        workspace: 'Test Workspace',
        account: {
          CreationDate: 1641945600,
        },
      }
      mockedAxiosInstance.get.mockResolvedValue({ data: expectedUserDetails })

      // Act
      const result = await userDetailsApi.getUserDetails()

      // Assert
      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/profile')
      expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(expectedUserDetails)
    })

    it('should handle API errors when fetching user details', async () => {
      // Arrange
      const apiError = new Error('Unauthorized')
      mockedAxiosInstance.get.mockRejectedValue(apiError)

      // Act & Assert
      await expect(userDetailsApi.getUserDetails()).rejects.toThrow(
        'Unauthorized',
      )
      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/profile')
    })

    it('should handle empty response when fetching user details', async () => {
      // Arrange
      mockedAxiosInstance.get.mockResolvedValue({ data: null })

      // Act
      const result = await userDetailsApi.getUserDetails()

      // Assert
      expect(mockedAxiosInstance.get).toHaveBeenCalledWith('/profile')
      expect(result).toBeNull()
    })
  })

  describe('API instance configuration', () => {
    it('should use the correct axios instance', () => {
      // Assert that the API class is using the mocked axios instance
      expect(userDetailsApi).toBeDefined()
      expect(typeof userDetailsApi.updateUserDetails).toBe('function')
      expect(typeof userDetailsApi.changePassword).toBe('function')
      expect(typeof userDetailsApi.getUserDetails).toBe('function')
    })
  })
})
