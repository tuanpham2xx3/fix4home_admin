import apiClient, { extractData } from '@/utils/api'
import { LoginRequest, AuthResponse } from '@/types/auth'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', credentials)
    const data = extractData(response)
    
    // Store tokens
    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
    
    return data
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  },

  getCurrentUser: (): { id: number; username: string; email: string; role: string } | null => {
    const token = localStorage.getItem('token')
    if (!token) return null
    
    try {
      // Decode JWT token to get user info (simple implementation)
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        id: payload.userId || payload.sub,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      }
    } catch {
      return null
    }
  },
}

