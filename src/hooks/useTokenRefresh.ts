import { useEffect } from 'react'
import { getToken, refreshToken, willTokenExpireSoon } from '@/lib/tokenService'

export const useTokenRefresh = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = getToken()

      if (token && willTokenExpireSoon()) {
        try {
          await refreshToken()
        } catch (err) {
          console.error('[Token Refresh] Failed:', err)
        }
      }
    }, 60 * 1000) // every minute

    return () => clearInterval(interval)
  }, [])
}
