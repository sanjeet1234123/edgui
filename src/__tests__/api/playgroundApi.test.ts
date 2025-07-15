// @ts-nocheck
import playgroundApi from '@/api/playgroundApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('playgroundApi', () => {
  const mockPost = jest.fn()
  const mockGet = jest.fn()
  beforeAll(() => {
    jest.spyOn(axiosInstance, 'post').mockImplementation(mockPost)
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sendChatMessage calls correct endpoint and returns data', async () => {
    const mockData = { message: 'response' }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { message: 'hello', model: 'gpt' }
    const result = await playgroundApi.sendChatMessage(payload)
    expect(mockPost).toHaveBeenCalledWith('/chat_response', payload)
    expect(result).toBe(mockData)
  })

  it('getModelStatus calls correct endpoint and returns data', async () => {
    const mockData = { status: 'running' }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { model: 'gpt', version: 'v1' }
    const result = await playgroundApi.getModelStatus(payload)
    expect(mockPost).toHaveBeenCalledWith('/deployment_status', payload)
    expect(result).toBe(mockData)
  })

  it('getModelVulnerability calls correct endpoint and returns data', async () => {
    const mockData = { vulnerabilities: [] }
    mockGet.mockResolvedValueOnce({ data: mockData })
    const modelName = 'gpt'
    const result = await playgroundApi.getModelVulnerability(modelName)
    expect(mockGet).toHaveBeenCalledWith(
      `/vulnerabilities?model_name=${modelName}`,
    )
    expect(result).toBe(mockData)
  })
})
