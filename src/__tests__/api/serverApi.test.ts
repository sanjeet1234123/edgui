// @ts-nocheck
import serverApi from '../../api/serverApi'

// Mock axiosMiddleware (the actual axiosInstance used in serverApi)
jest.mock('@/lib/axiosMiddleware', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}))
const mockAxiosInstance = require('@/lib/axiosMiddleware').default

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('ServerApi', () => {
  beforeEach(() => {
    jest.clearAllMocks() // Clear previous mocks to ensure isolation between tests
  })

  it('should return server data when getServer is called', async () => {
    // Arrange
    const serverId = 'server123'
    const mockResponse = { data: { id: serverId, name: 'Test Server' } }
    mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

    // Act
    const response = await serverApi.getServer(serverId)

    // Assert
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/mcp/marketplace', {
      params: { search: serverId },
    })
    expect(response).toEqual(mockResponse.data)
  })

  it('should return raw GitHub file data when getRawGithubFile is called', async () => {
    // Arrange
    const fileId = 'file123'
    const mockFileData = { content: 'raw markdown file content' }
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockFileData })

    // Act
    const response = await serverApi.getRawGithubFile(fileId)

    // Assert
    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      `/mcp/marketplace/${fileId}/readme`,
    )
    expect(response).toEqual(mockFileData)
  })

  it('should handle errors gracefully when getServer fails', async () => {
    // Arrange
    const serverId = 'server123'
    const errorMessage = 'Network Error'
    mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage))

    // Act & Assert
    await expect(serverApi.getServer(serverId)).rejects.toThrow(errorMessage)
  })

  it('should handle errors gracefully when getRawGithubFile fails', async () => {
    // Arrange
    const fileId = 'file123'
    const errorMessage = 'Network Error'
    mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage))

    // Act & Assert
    await expect(serverApi.getRawGithubFile(fileId)).rejects.toThrow(
      errorMessage,
    )
  })
})
