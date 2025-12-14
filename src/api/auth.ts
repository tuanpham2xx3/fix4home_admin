import apiClient, { extractData } from '@/utils/api'
import { LoginRequest, AuthResponse } from '@/types/auth'
import { ApiResponse } from '@/types/article'
import { setCookie, getCookie, setCookieJSON, getCookieJSON, deleteCookies } from '@/utils/cookies'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log('📤 [AUTH API] Sending login request to /auth/login')
    console.log('📤 [AUTH API] Credentials:', { username: credentials.username, password: '***' })
    
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
      
      // Log full response as JSON
      console.log('📥 [AUTH API] Login response received:')
      console.log('📥 [AUTH API] Status:', response.status, response.statusText)
      console.log('📥 [AUTH API] Headers:', JSON.stringify(response.headers, null, 2))
      console.log('📥 [AUTH API] Full Response JSON:')
      console.log(JSON.stringify(response.data, null, 2))
      console.log('📥 [AUTH API] Response object:', response.data)
      
      const data = extractData(response)
      console.log('✅ [AUTH API] Extracted data:', { 
        hasToken: !!data.token, 
        hasRefreshToken: !!data.refreshToken,
        user: data.user 
      })
      console.log('✅ [AUTH API] Extracted data JSON:')
      console.log(JSON.stringify(data, null, 2))
      
      // Handle different response structures
      // Backend may return accessToken instead of token, and role at top level
      const token = (data as any).accessToken || data.token
      const refreshToken = (data as any).refreshToken || data.refreshToken
      const role = (data as any).role || data.user?.role
      const userId = (data as any).userId || data.user?.id
      const username = (data as any).username || data.user?.username
      const email = (data as any).email || data.user?.email
      
      console.log('🔍 [AUTH API] Parsed fields:', {
        token: !!token,
        refreshToken: !!refreshToken,
        role,
        userId,
        username,
        email,
      })
      
      // Store tokens in cookies only (no localStorage)
      const expiresIn = (data as any).expiresIn || data.expiresIn || 0
      // Calculate days: if expiresIn is in seconds, convert to days
      // Ensure minimum 1 day for cookie persistence
      let expiresInDays = 7 // default
      if (expiresIn > 0) {
        const days = expiresIn / 86400 // Convert seconds to days
        expiresInDays = Math.max(1, Math.ceil(days)) // At least 1 day, round up
      }
      console.log('⏰ [AUTH API] Token expiration:', {
        expiresInSeconds: expiresIn,
        expiresInDays,
        calculated: expiresIn > 0 ? `${expiresIn / 86400} days` : 'default 7 days',
      })
      
      if (token) {
        // Store token in cookie
        setCookie('token', token, expiresInDays)
        console.log('💾 [AUTH API] Token stored in cookie:', {
          length: token.length,
          preview: token.substring(0, 20) + '...',
          expiresInDays,
        })
        
        // Verify token was saved
        const savedToken = getCookie('token')
        if (savedToken !== token) {
          console.error('❌ [AUTH API] Token was not saved correctly!', {
            expected: token.substring(0, 20),
            got: savedToken?.substring(0, 20),
          })
        } else {
          console.log('✅ [AUTH API] Token verified in cookie')
        }
      } else {
        console.error('❌ [AUTH API] No token to save!')
      }
      
      if (refreshToken) {
        // Refresh token expires in 30 days
        setCookie('refreshToken', refreshToken, 30)
        console.log('💾 [AUTH API] RefreshToken stored in cookie')
      }
      
      // Store user info in cookie (same expiration as token)
      // IMPORTANT: Store userInfo FIRST before token to ensure it's available immediately
      if (userId && username && email && role) {
        const userInfo = {
          id: userId,
          username,
          email,
          role,
        }
        setCookieJSON('userInfo', userInfo, expiresInDays)
        console.log('💾 [AUTH API] User info stored in cookie:', userInfo)
        
        // Verify userInfo was saved immediately
        const verifyUserInfo = getCookieJSON('userInfo')
        if (!verifyUserInfo || verifyUserInfo.role !== role) {
          console.error('❌ [AUTH API] UserInfo was not saved correctly!', {
            expected: userInfo,
            got: verifyUserInfo,
          })
        } else {
          console.log('✅ [AUTH API] UserInfo verified in cookie')
        }
      }
      
      console.log('💾 [AUTH API] All tokens and user info stored in cookies only')
      
      // Final verification - wait a bit for cookies to be set
      setTimeout(() => {
        const finalToken = getCookie('token')
        const finalUserInfo = getCookieJSON('userInfo')
        console.log('🔍 [AUTH API] Final verification (after delay):', {
          token: { exists: !!finalToken, length: finalToken?.length || 0, matches: finalToken === token },
          userInfo: { exists: !!finalUserInfo, data: finalUserInfo },
        })
      }, 100)
      
      // Return normalized data
      return {
        token: token || '',
        refreshToken: refreshToken || '',
        tokenType: (data as any).tokenType || data.tokenType || 'Bearer',
        expiresIn: (data as any).expiresIn || data.expiresIn || 0,
        user: {
          id: userId || 0,
          username: username || '',
          email: email || '',
          role: (role as 'ADMIN' | 'CUSTOMER' | 'TECHNICIAN') || 'CUSTOMER',
        },
      }
    } catch (error: any) {
      console.error('❌ [AUTH API] Login error:', error)
      
      if (error.response) {
        console.error('❌ [AUTH API] Error Response Status:', error.response.status, error.response.statusText)
        console.error('❌ [AUTH API] Error Response Headers:', JSON.stringify(error.response.headers, null, 2))
        console.error('❌ [AUTH API] Error Response Data JSON:')
        console.error(JSON.stringify(error.response.data, null, 2))
        console.error('❌ [AUTH API] Full Error Response:', error.response)
      } else {
        console.error('❌ [AUTH API] No response received (Network Error)')
        console.error('❌ [AUTH API] Error details:', JSON.stringify({
          message: error.message,
          code: error.code,
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            baseURL: error.config.baseURL,
          } : null,
        }, null, 2))
      }
      
      throw error
    }
  },

  logout: async (): Promise<void> => {
    console.log('🚪 [AUTH API] Logging out...')
    try {
      await apiClient.post('/auth/logout')
      console.log('✅ [AUTH API] Logout API call successful')
    } catch (error: any) {
      // Log error but don't throw - we still want to clear local storage
      console.warn('⚠️ [AUTH API] Logout API call failed, but clearing local storage anyway:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      })
    } finally {
      // Always clear tokens regardless of API call result
      // Clear all auth cookies
      deleteCookies(['token', 'refreshToken', 'userInfo'])
      console.log('🧹 [AUTH API] All auth cookies cleared')
    }
  },

  getCurrentUser: (): { id: number; username: string; email: string; role: string } | null => {
    console.log('👤 [AUTH API] Getting current user...')
    
    // First try to get from stored userInfo cookie (most reliable)
    const userInfo = getCookieJSON<{ id: number; username: string; email: string; role: string }>('userInfo')
    if (userInfo) {
      console.log('👤 [AUTH API] User info from cookie:', userInfo)
      return userInfo
    }
    
    // Fallback: decode from JWT token in cookie
    const token = getCookie('token')
    if (!token) {
      console.warn('⚠️ [AUTH API] No token found in cookies')
      return null
    }
    
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('👤 [AUTH API] Decoded JWT payload:', payload)
      const decodedUser = {
        id: payload.userId || payload.sub || 0,
        username: payload.username || '',
        email: payload.email || '',
        role: payload.role || '',
      }
      
      // Save decoded user info to cookie for next time
      if (decodedUser.id && decodedUser.username && decodedUser.email && decodedUser.role) {
        setCookieJSON('userInfo', decodedUser, 7)
        console.log('💾 [AUTH API] Saved decoded user info to cookie')
      }
      
      return decodedUser
    } catch (error) {
      console.error('❌ [AUTH API] Failed to decode token:', error)
      return null
    }
  },
}

