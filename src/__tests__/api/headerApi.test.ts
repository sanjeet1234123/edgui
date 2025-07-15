// @ts-nocheck
import headerApi from '@/api/headerApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('headerApi', () => {
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
    const mockData = [{ id: 1, name: 'project1' }]
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await headerApi.getProjects()
    expect(mockGet).toHaveBeenCalledWith('/user/projects')
    expect(result).toBe(mockData)
  })

  it('updateToken calls correct endpoint and returns merged data', async () => {
    const mockResponse = { token: 'abc', expires: '2024-12-31' }
    mockPost.mockResolvedValueOnce({ data: mockResponse })
    const params = { project_id: 42, environment: 'dev' }
    const result = await headerApi.updateToken(params)
    expect(mockPost).toHaveBeenCalledWith('/upgrade_token', {
      project_id: params.project_id,
      environment: params.environment,
    })
    expect(result).toEqual({
      ...mockResponse,
      projectId: params.project_id,
      environment: params.environment,
    })
  })
})
