// @ts-nocheck
import marketplaceApi from '@/api/marketplaceApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('marketplaceApi', () => {
  const mockGet = jest.fn()
  const mockPost = jest.fn()
  beforeAll(() => {
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
    jest.spyOn(axiosInstance, 'post').mockImplementation(mockPost)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getModels calls correct endpoint and returns data', async () => {
    const mockData = [{ id: 1, name: 'model1' }]
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await marketplaceApi.getModels('test-category')
    expect(mockGet).toHaveBeenCalledWith('/models?category=test-category')
    expect(result).toBe(mockData)
  })

  it('upscaleModel calls correct endpoint and returns data', async () => {
    const mockData = { upscaled: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { model_id: 1, scale: 2 }
    const result = await marketplaceApi.upscaleModel(payload)
    expect(mockPost).toHaveBeenCalledWith('/upscale_model', payload)
    expect(result).toBe(mockData)
  })

  it('loadModel calls correct endpoint and returns data', async () => {
    const mockData = { loaded: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { model_id: 1, params: { foo: 'bar' } }
    const result = await marketplaceApi.loadModel(payload)
    expect(mockPost).toHaveBeenCalledWith('/models/load', payload)
    expect(result).toBe(mockData)
  })
})
