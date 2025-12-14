import React from 'react'
import { Navigate } from 'react-router-dom'
import { authApi } from '@/api/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = authApi.getCurrentUser()
  
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

