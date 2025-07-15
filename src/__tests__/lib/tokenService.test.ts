import moment from 'moment'
jest.mock('../../lib/axiosMiddleware', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))
import axiosInstance from '../../lib/axiosMiddleware'
import * as tokenService from '../../lib/tokenService'

describe('tokenService', () => {
  let localStorageMock: Record<string, string> = {}
  const setItem = jest.fn((key, value) => {
    localStorageMock[key] = value
  })
  const getItem = jest.fn(key => localStorageMock[key] || null)
  const clear = jest.fn(() => {
    localStorageMock = {}
  })

  beforeAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: { setItem, getItem, clear },
      configurable: true,
    })
  })

  beforeEach(() => {
    localStorageMock = {}
    jest.clearAllMocks()
  })

  describe('getToken', () => {
    it('returns token from localStorage', () => {
      localStorageMock['token'] = 'abc123'
      expect(tokenService.getToken()).toBe('abc123')
    })
    it('returns null if no token', () => {
      expect(tokenService.getToken()).toBeNull()
    })
  })

  describe('willTokenExpireSoon', () => {
    it('returns false if no expire in localStorage', () => {
      expect(tokenService.willTokenExpireSoon()).toBe(false)
    })
    it('returns true if expire is within 5 minutes', () => {
      localStorageMock['expire'] = '2025-05-28T12:00:00Z'
      jest.spyOn(moment, 'utc').mockImplementation((input?: any) => {
        if (!input) return moment('2025-05-28T11:56:00Z') // now
        return moment(input)
      })
      expect(tokenService.willTokenExpireSoon()).toBe(true)
      jest.restoreAllMocks()
    })
    it('returns false if expire is more than 5 minutes away', () => {
      localStorageMock['expire'] = '2025-05-28T12:10:00Z'
      jest.spyOn(moment, 'utc').mockImplementation((input?: any) => {
        if (!input) return moment('2025-05-28T12:00:00Z') // now
        return moment(input)
      })
      expect(tokenService.willTokenExpireSoon()).toBe(false)
      jest.restoreAllMocks()
    })
  })

  describe('clearSession', () => {
    it('calls localStorage.clear', () => {
      tokenService.clearSession()
      expect(clear).toHaveBeenCalled()
    })
  })

  describe('refreshToken', () => {
    it('throws if no token', async () => {
      await expect(tokenService.refreshToken()).rejects.toThrow(
        'No token to refresh',
      )
    })
    it('returns promise if already refreshing', async () => {
      localStorageMock['token'] = 'abc123'
      localStorageMock['project_id'] = '42'
      const postMock = jest.spyOn(axiosInstance, 'post').mockResolvedValue({
        data: { token: 'newtoken', expire: '2025-05-29T00:00:00Z' },
      })
      // Simulate a refresh in progress by calling refreshToken and assigning the promise
      // @ts-ignore
      tokenService['refreshPromise'] = tokenService.refreshToken()
      expect(await tokenService.refreshToken()).toBe('newtoken')
      // @ts-ignore
      tokenService['refreshPromise'] = null
      postMock.mockRestore()
    })
    it('calls axiosInstance and updates localStorage on success', async () => {
      localStorageMock['token'] = 'abc123'
      localStorageMock['project_id'] = '42'
      const postMock = jest.spyOn(axiosInstance, 'post').mockResolvedValue({
        data: { token: 'newtoken', expire: '2025-05-29T00:00:00Z' },
      })
      const result = await tokenService.refreshToken()
      expect(postMock).toHaveBeenCalledWith('/upgrade_token', {
        project_id: 42,
      })
      expect(setItem).toHaveBeenCalledWith('token', 'newtoken')
      expect(setItem).toHaveBeenCalledWith('expire', '2025-05-29T00:00:00Z')
      expect(result).toBe('newtoken')
    })
    it('throws and clears session on error', async () => {
      localStorageMock['token'] = 'abc123'
      const postMock = jest
        .spyOn(axiosInstance, 'post')
        .mockRejectedValue(new Error('fail'))
      await expect(tokenService.refreshToken()).rejects.toThrow('fail')
      expect(clear).toHaveBeenCalled()
      postMock.mockRestore()
    })
    it('throws if response is invalid', async () => {
      localStorageMock['token'] = 'abc123'
      const postMock = jest
        .spyOn(axiosInstance, 'post')
        .mockResolvedValue({ data: {} })
      await expect(tokenService.refreshToken()).rejects.toThrow(
        'Invalid refresh response',
      )
      postMock.mockRestore()
    })
  })
})
