// @ts-nocheck
import deploymentApi from '@/api/deploymentApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('deploymentApi', () => {
  const mockGet = jest.fn()
  const mockPost = jest.fn()
  beforeAll(() => {
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
    jest.spyOn(axiosInstance, 'post').mockImplementation(mockPost)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getClusters calls correct endpoint and returns data', async () => {
    const mockData = [{ id: 1, name: 'cluster1' }]
    mockGet.mockResolvedValueOnce({ data: mockData })
    const modelName = 'test-model'
    const result = await deploymentApi.getClusters(modelName)
    expect(mockGet).toHaveBeenCalledWith(`/clusters?name=${modelName}`)
    expect(result).toBe(mockData)
  })

  it('handleDeploymentPodStatus calls correct endpoint and returns response', async () => {
    const mockResponse = { status: 200, data: { pod: 'ok' } }
    mockPost.mockResolvedValueOnce(mockResponse)
    const payload = { podName: 'pod-1', status: 'Running' }
    const result = await deploymentApi.handleDeploymentPodStatus(payload)
    expect(mockPost).toHaveBeenCalledWith('/playground/podstatus', payload)
    expect(result).toBe(mockResponse)
  })

  it('deployCluster calls correct endpoint and returns response', async () => {
    const mockResponse = { status: 201, data: { deployed: true } }
    mockPost.mockResolvedValueOnce(mockResponse)
    const payload = { cluster: 'c1', model: 'm1' }
    const result = await deploymentApi.deployCluster(payload)
    expect(mockPost).toHaveBeenCalledWith('/install_model', payload)
    expect(result).toBe(mockResponse)
  })

  it('handleDownscaleModel calls correct endpoint and returns data', async () => {
    const mockData = { downscaled: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { model: 'm1', scale: 1 }
    const result = await deploymentApi.handleDownscaleModel(payload)
    expect(mockPost).toHaveBeenCalledWith('/downscale_model', payload)
    expect(result).toBe(mockData)
  })
})
