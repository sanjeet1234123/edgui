// @ts-nocheck
import authApi from '@/api/authApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('authApi', () => {
  const mockPost = jest.fn()
  const mockGet = jest.fn()
  beforeAll(() => {
    jest.spyOn(axiosInstance, 'post').mockImplementation(mockPost)
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('login calls correct endpoint and returns data', async () => {
    const mockData = { token: 'abc' }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { email: 'test@test.com', password: 'pass' }
    const result = await authApi.login(payload)
    expect(mockPost).toHaveBeenCalledWith('/login', payload)
    expect(result).toBe(mockData)
  })

  it('signup calls correct endpoint and returns data', async () => {
    const mockData = { user: 'abc' }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { email: 'test@test.com', password: 'pass', name: 'Test' }
    const result = await authApi.signup(payload)
    expect(mockPost).toHaveBeenCalledWith('/signup', payload)
    expect(result).toBe(mockData)
  })

  it('logout calls correct endpoint and returns data', async () => {
    const mockData = { success: true }
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await authApi.logout()
    expect(mockGet).toHaveBeenCalledWith('/logout')
    expect(result).toBe(mockData)
  })

  it('verifyEmail calls correct endpoint and returns data', async () => {
    const mockData = { verified: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { email: 'test@test.com', code: '1234' }
    const result = await authApi.verifyEmail(payload)
    expect(mockPost).toHaveBeenCalledWith('/verifymail', payload)
    expect(result).toBe(mockData)
  })

  it('requestVerificationCode calls correct endpoint and returns data', async () => {
    const mockData = { sent: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { email: 'test@test.com' }
    const result = await authApi.requestVerificationCode(payload)
    expect(mockPost).toHaveBeenCalledWith('/send_code_again', payload)
    expect(result).toBe(mockData)
  })

  it('forgetPassword calls correct endpoint and returns data', async () => {
    const mockData = { reset: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { email: 'test@test.com' }
    const result = await authApi.forgetPassword(payload)
    expect(mockPost).toHaveBeenCalledWith('/forgotpass', payload)
    expect(result).toBe(mockData)
  })

  it('forgetWorkspace calls correct endpoint and returns data', async () => {
    const mockData = { reset: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { email: 'test@test.com' }
    const result = await authApi.forgetWorkspace(payload)
    expect(mockPost).toHaveBeenCalledWith('/forgot_workspace', payload)
    expect(result).toBe(mockData)
  })
})
