// @ts-nocheck
import workspaceApi from '@/api/workspaceApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/lib/axiosMiddleware', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))

describe('WorkspaceApi', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getWorkspaceMembers', () => {
    it('should return data on success', async () => {
      const mockData = [{ id: 1, name: 'John' }]
      axiosInstance.get.mockResolvedValueOnce({ data: mockData })
      const result = await workspaceApi.getWorkspaceMembers()
      expect(result).toEqual(mockData)
      expect(axiosInstance.get).toHaveBeenCalledWith('/workspaces/member')
    })

    it('should throw error on failure', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('Network error'))
      await expect(workspaceApi.getWorkspaceMembers()).rejects.toThrow('Network error')
    })
  })

  describe('inviteWorkspaceMembers', () => {
    it('should return data on success', async () => {
      const mockRequest = { emails: ['test@example.com'] }
      const mockData = { success: true }
      axiosInstance.post.mockResolvedValueOnce({ data: mockData })
      const result = await workspaceApi.inviteWorkspaceMembers(mockRequest)
      expect(result).toEqual(mockData)
      expect(axiosInstance.post).toHaveBeenCalledWith('/workspaces/member', mockRequest)
    })

    it('should throw error on failure', async () => {
      axiosInstance.post.mockRejectedValueOnce(new Error('Request failed'))
      await expect(workspaceApi.inviteWorkspaceMembers({ emails: [] })).rejects.toThrow('Request failed')
    })
  })
})
