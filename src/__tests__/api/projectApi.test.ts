// @ts-nocheck
import projectApi from '@/api/projectApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('projectApi', () => {
  const mockGet = jest.fn()
  const mockPost = jest.fn()
  const mockDelete = jest.fn()

  beforeAll(() => {
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
    jest.spyOn(axiosInstance, 'post').mockImplementation(mockPost)
    jest.spyOn(axiosInstance, 'delete').mockImplementation(mockDelete)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getProject calls correct endpoint and returns data', async () => {
    const mockData = { id: '1', name: 'Project 1' }
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await projectApi.getProject('1')
    expect(mockGet).toHaveBeenCalledWith('/projects/1')
    expect(result).toBe(mockData)
  })

  it('getProjectActivities calls correct endpoint and returns data', async () => {
    const mockData = [{ id: 1, activity: 'created' }]
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await projectApi.getProjectActivities('1')
    expect(mockGet).toHaveBeenCalledWith('/projects/1/activities')
    expect(result).toBe(mockData)
  })

  it('getProjectMembers calls correct endpoint and returns data', async () => {
    const mockData = [{ id: 1, name: 'User' }]
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await projectApi.getProjectMembers('1')
    expect(mockGet).toHaveBeenCalledWith('/projects/1/members')
    expect(result).toBe(mockData)
  })

  it('inviteProjectMember calls correct endpoint and returns data', async () => {
    const mockData = { invited: true }
    const payload = { project_id: '1', email: 'test@test.com' }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const result = await projectApi.inviteProjectMember(payload)
    expect(mockPost).toHaveBeenCalledWith('/projects/member/invite', payload)
    expect(result).toBe(mockData)
  })

  it('deleteProject calls correct endpoint and returns data', async () => {
    const mockData = { deleted: true }
    mockDelete.mockResolvedValueOnce({ data: mockData })
    const result = await projectApi.deleteProject('1')
    expect(mockDelete).toHaveBeenCalledWith('/projects/1')
    expect(result).toBe(mockData)
  })
})
