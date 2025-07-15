// @ts-nocheck
import projectsApi from '@/api/projectsApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('projectsApi', () => {
  const mockGet = jest.fn()
  const mockPost = jest.fn()

  beforeAll(() => {
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
    jest.spyOn(axiosInstance, 'post').mockImplementation(mockPost)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getProjects calls correct endpoint and returns data', async () => {
    const mockData = [{ id: 1, name: 'Project 1' }]
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await projectsApi.getProjects()
    expect(mockGet).toHaveBeenCalledWith('/user/projects')
    expect(result).toBe(mockData)
  })

  it('createProject calls correct endpoint and returns data', async () => {
    const mockData = { id: 2, name: 'Project 2' }
    const payload = { name: 'Project 2', description: 'desc' }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const result = await projectsApi.createProject(payload)
    expect(mockPost).toHaveBeenCalledWith('/projects', payload)
    expect(result).toBe(mockData)
  })
})
