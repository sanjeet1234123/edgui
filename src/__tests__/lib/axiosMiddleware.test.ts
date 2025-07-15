// @ts-nocheck
/**
 * @jest-environment jsdom
 */
// Mock axios as a function with a create method BEFORE any imports
jest.mock('axios', () => {
  const mockRequestHandlers = []
  const mockResponseHandlers = []
  // Make the instance a callable function with properties
  const mockAxiosInstance = function (config) {
    // Allow spying in tests
    return mockAxiosInstance.request(config)
  }
  mockAxiosInstance.interceptors = {
    request: {
      handlers: mockRequestHandlers,
      use: (fulfilled, rejected) => {
        mockRequestHandlers.push({ fulfilled, rejected })
      },
    },
    response: {
      handlers: mockResponseHandlers,
      use: (fulfilled, rejected) => {
        mockResponseHandlers.push({ fulfilled, rejected })
      },
    },
  }
  mockAxiosInstance.request = jest.fn()
  // The create method returns the callable instance
  function axios() {
    return mockAxiosInstance
  }
  axios.create = jest.fn(() => mockAxiosInstance)
  axios._mockRequestHandlers = mockRequestHandlers
  axios._mockResponseHandlers = mockResponseHandlers
  axios._mockAxiosInstance = mockAxiosInstance
  return axios
})
jest.mock('@/constants/paths', () => ({ PATHS: { LOGIN: '/login' } }))
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/api',
}))

const mockGetToken = jest.fn()
const mockWillTokenExpireSoon = jest.fn()
const mockRefreshToken = jest.fn()
const mockClearSession = jest.fn()

jest.mock('@/lib/tokenService', () => ({
  getToken: () => mockGetToken(),
  willTokenExpireSoon: () => mockWillTokenExpireSoon(),
  refreshToken: () => mockRefreshToken(),
  clearSession: () => mockClearSession(),
}))

// Import after all mocks are set up
import axiosInstance from '@/lib/axiosMiddleware'
import { PATHS } from '@/constants/paths'

describe('axiosMiddleware', () => {
  let originalLocation: Location
  beforeAll(() => {
    originalLocation = window.location
    // @ts-ignore
    delete window.location
    // @ts-ignore
    window.location = { ...originalLocation, replace: jest.fn() }
  })
  afterAll(() => {
    // @ts-ignore
    window.location = originalLocation
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('adds Authorization header if token exists and not expiring', async () => {
    mockGetToken.mockReturnValue('token123')
    mockWillTokenExpireSoon.mockReturnValue(false)
    const config = { headers: {} }
    const reqInterceptor =
      axiosInstance.interceptors.request.handlers[0].fulfilled
    const result = await reqInterceptor(config)
    expect(result.headers.Authorization).toBe('Bearer token123')
  })

  it('refreshes token if expiring soon', async () => {
    mockGetToken.mockReturnValue('token123')
    mockWillTokenExpireSoon.mockReturnValue(true)
    mockRefreshToken.mockResolvedValue('newtoken456')
    const config = { headers: {} }
    const reqInterceptor =
      axiosInstance.interceptors.request.handlers[0].fulfilled
    const result = await reqInterceptor(config)
    expect(result.headers.Authorization).toBe('Bearer newtoken456')
  })

  it('does not set Authorization if no token', async () => {
    mockGetToken.mockReturnValue(null)
    const config = { headers: {} }
    const reqInterceptor =
      axiosInstance.interceptors.request.handlers[0].fulfilled
    const result = await reqInterceptor(config)
    expect(result.headers.Authorization).toBeUndefined()
  })

  it('silently fails if refreshToken throws in request', async () => {
    mockGetToken.mockReturnValue('token123')
    mockWillTokenExpireSoon.mockReturnValue(true)
    mockRefreshToken.mockRejectedValue(new Error('fail'))
    const config = { headers: {} }
    const reqInterceptor =
      axiosInstance.interceptors.request.handlers[0].fulfilled
    const result = await reqInterceptor(config)
    // Should not throw, should not set Authorization
    expect(result.headers.Authorization).toBeUndefined()
  })

  it('passes through response on success', () => {
    const resInterceptor =
      axiosInstance.interceptors.response.handlers[0].fulfilled
    const response = { data: 123 }
    expect(resInterceptor(response)).toBe(response)
  })

  it('retries request on 401 and sets new token', async () => {
    mockRefreshToken.mockResolvedValue('newtoken789')
    const originalRequest = { headers: {}, _retry: false }
    const error = {
      config: originalRequest,
      response: { status: 401 },
    }
    // Mock axiosInstance to resolve
    const mockAxiosInstance = jest
      .spyOn(axiosInstance, 'request')
      .mockResolvedValue('response')
    // Patch axiosInstance callable
    axiosInstance.mockImplementationOnce = req => mockAxiosInstance(req)
    const resInterceptor =
      axiosInstance.interceptors.response.handlers[0].rejected
    const result = await resInterceptor(error)
    expect(mockRefreshToken).toHaveBeenCalled()
    expect(originalRequest.headers.Authorization).toBe('Bearer newtoken789')
    expect(mockAxiosInstance).toHaveBeenCalled()
  })

  it('clears session and redirects on refreshToken failure in response', async () => {
    mockRefreshToken.mockRejectedValue(new Error('fail'))
    const originalRequest = { headers: {}, _retry: false }
    const error = {
      config: originalRequest,
      response: { status: 401 },
    }
    const resInterceptor =
      axiosInstance.interceptors.response.handlers[0].rejected
    await expect(resInterceptor(error)).rejects.toThrow('fail')
    expect(mockClearSession).toHaveBeenCalled()
    expect(window.location.replace).toHaveBeenCalledWith('/login')
  })

  it('does not retry if already retried', async () => {
    const originalRequest = { headers: {}, _retry: true }
    const error = {
      config: originalRequest,
      response: { status: 401 },
    }
    const resInterceptor =
      axiosInstance.interceptors.response.handlers[0].rejected
    await expect(resInterceptor(error)).rejects.toBe(error)
  })

  it('passes through non-401 errors', async () => {
    const error = { config: {}, response: { status: 500 } }
    const resInterceptor =
      axiosInstance.interceptors.response.handlers[0].rejected
    await expect(resInterceptor(error)).rejects.toBe(error)
  })
})
