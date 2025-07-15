// @ts-nocheck
import platformSetupApi from '@/api/platformSetupApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('platformSetupApi', () => {
  const mockPost = jest.fn()
  beforeAll(() => {
    jest.spyOn(axiosInstance, 'post').mockImplementation(mockPost)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('createWorkspace calls correct endpoint and returns data', async () => {
    const mockData = { id: 1, name: 'workspace1' }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { name: 'workspace1', owner: 'user1' }
    const result = await platformSetupApi.createWorkspace(payload)
    expect(mockPost).toHaveBeenCalledWith('/workspaces', payload)
    expect(result).toBe(mockData)
  })

  it('checkWorkspaceAvailability calls correct endpoint and returns data', async () => {
    const mockData = { available: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { workspace: 'test' }
    const result = await platformSetupApi.checkWorkspaceAvailability(payload)
    expect(mockPost).toHaveBeenCalledWith('/workspace_availability', payload)
    expect(result).toBe(mockData)
  })

  it('inviteMembers calls correct endpoint and returns data', async () => {
    const mockData = { invited: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { workspace_id: 1, members: ['user1@test.com'] }
    const result = await platformSetupApi.inviteMembers(payload)
    expect(mockPost).toHaveBeenCalledWith('/workspaces/member', payload)
    expect(result).toBe(mockData)
  })
})
