export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: {
    id: number
    username: string
    email: string
    role: 'ADMIN' | 'CUSTOMER' | 'TECHNICIAN'
  }
}

export interface User {
  id: number
  username: string
  email: string
  role: 'ADMIN' | 'CUSTOMER' | 'TECHNICIAN'
}

