import serversApi from '@/api/serversApi'

jest.mock('@/lib/axiosMiddleware', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}))

describe('serversApi', () => {
  const mockAxios = require('@/lib/axiosMiddleware').default

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls axiosInstance.get with default params', async () => {
    mockAxios.get.mockResolvedValue({ data: { servers: [] } })
    const data = await serversApi.getServers()
    expect(mockAxios.get).toHaveBeenCalledWith('/mcp/marketplace', {
      params: { page: 1, limit: 12, search: '' },
    })
    expect(data).toEqual({ servers: [] })
  })

  it('calls axiosInstance.get with custom params', async () => {
    mockAxios.get.mockResolvedValue({ data: { servers: ['foo'] } })
    const data = await serversApi.getServers(2, 5, 'test')
    expect(mockAxios.get).toHaveBeenCalledWith('/mcp/marketplace', {
      params: { page: 2, limit: 5, search: 'test' },
    })
    expect(data).toEqual({ servers: ['foo'] })
  })

  it('throws error if axiosInstance.get fails', async () => {
    mockAxios.get.mockRejectedValue(new Error('Network error'))
    await expect(serversApi.getServers()).rejects.toThrow('Network error')
  })
})
