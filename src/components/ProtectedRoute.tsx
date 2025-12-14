import React from 'react'
import { Navigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { getCookie } from '@/utils/cookies'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getCookie('token')
  const user = authApi.getCurrentUser()
  
  console.log('🔒 [PROTECTED ROUTE] Checking access:', {
    hasToken: !!token,
    hasUser: !!user,
    userRole: user?.role,
  })
  
  if (!token) {
    console.warn('⚠️ [PROTECTED ROUTE] No token found, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  if (!user) {
    console.warn('⚠️ [PROTECTED ROUTE] Token exists but user cannot be decoded, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  if (user.role !== 'ADMIN') {
    console.warn('⚠️ [PROTECTED ROUTE] User is not ADMIN, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('✅ [PROTECTED ROUTE] Access granted')
  return <>{children}</>
}

