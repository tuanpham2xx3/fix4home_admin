import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { authApi } from '@/api/auth'
import { API_BASE_URL } from '@/config/api'
import { apiLogger } from '@/utils/logger'
import { deleteCookies } from '@/utils/cookies'
import toast from 'react-hot-toast'

const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
})

type LoginFormData = {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<any>(null)
  const [lastError, setLastError] = useState<any>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔐 [LOGIN] Attempting login with:', { username: data.username })
      setLastResponse(null)
      setLastError(null)
      
      const response = await authApi.login(data)
      setLastResponse(response)
      
      // Wait a bit for cookies to be set before checking
      // This ensures cookies are available when getCurrentUser() is called
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Check if user has ADMIN role
      const user = authApi.getCurrentUser()
      console.log('👤 [LOGIN] Current user:', user)
      
      // Also check role directly from response if getCurrentUser fails
      const roleFromResponse = response.user?.role || (response as any).role
      console.log('🔍 [LOGIN] Role check:', {
        fromGetCurrentUser: user?.role,
        fromResponse: roleFromResponse,
        responseUser: response.user,
      })
      
      if (!user || (user.role !== 'ADMIN' && roleFromResponse !== 'ADMIN')) {
        // Clear tokens if not ADMIN (don't call logout API to avoid backend errors)
        console.warn('⚠️ [LOGIN] User is not ADMIN, clearing cookies')
        deleteCookies(['token', 'refreshToken', 'userInfo'])
        const message = 'Access denied. Only ADMIN users can access this system.'
        setError(message)
        toast.error(message)
        return
      }
      
      console.log('✅ [LOGIN] Login successful')
      toast.success('Login successful')
      navigate('/dashboard')
    } catch (err: any) {
      setLastError(err.response?.data || err)
      setLastResponse(null)
      console.error('❌ [LOGIN] Login error:', err)
      console.error('❌ [LOGIN] Error details:', {
        message: err.message,
        code: err.code,
        response: err.response,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        networkErrorDetails: err.networkErrorDetails,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          baseURL: err.config?.baseURL,
          fullURL: err.config ? `${err.config.baseURL}${err.config.url}` : 'Unknown',
          headers: err.config?.headers,
        },
      })
      
      let message = 'Login failed'
      let detailedMessage = ''
      
      // Handle Network Error specifically
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || err.networkErrorDetails) {
        const fullURL = err.networkErrorDetails?.fullURL || (err.config ? `${err.config.baseURL}${err.config.url}` : 'Unknown')
        message = 'Cannot connect to server'
        detailedMessage = `Network Error: Cannot connect to ${fullURL}\n\nPossible causes:\n` +
          `• Backend server is not running\n` +
          `• Wrong API URL (current: ${err.config?.baseURL || 'Unknown'})\n` +
          `• CORS issue - server needs to allow this origin\n` +
          `• Network connectivity issue\n\n` +
          `Please check:\n` +
          `1. Is the backend server running?\n` +
          `2. Is the API URL correct? (Check .env file or config)\n` +
          `3. Check browser console for CORS errors`
      } else if (err.response?.data?.message) {
        message = err.response.data.message
      } else if (err.message) {
        message = err.message
      } else if (err.response?.status) {
        message = `Login failed: ${err.response.status} ${err.response.statusText || ''}`
      }
      
      // Show detailed error in development
      if (import.meta.env.DEV) {
        const errorInfo: any = {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
        }
        
        if (err.networkErrorDetails) {
          errorInfo.networkError = err.networkErrorDetails
        }
        
        if (err.config) {
          errorInfo.request = {
            method: err.config.method,
            url: err.config.url,
            baseURL: err.config.baseURL,
            fullURL: `${err.config.baseURL}${err.config.url}`,
          }
        }
        
        const detailedError = JSON.stringify(errorInfo, null, 2)
        console.error('📋 [LOGIN] Detailed error:', detailedError)
        
        if (detailedMessage) {
          setError(`${message}\n\n${detailedMessage}\n\nDebug info:\n${detailedError}`)
        } else {
          setError(`${message}\n\nDebug info:\n${detailedError}`)
        }
      } else {
        setError(detailedMessage || message)
      }
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Fix4Home Admin
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
            Sign in to manage articles
          </Typography>

          {import.meta.env.DEV && (
            <Typography variant="caption" align="center" color="text.secondary" sx={{ mt: 1, fontFamily: 'monospace' }}>
              API: {API_BASE_URL}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  autoComplete="username"
                  autoFocus
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          {/* Debug: Show JSON Response/Error */}
          {import.meta.env.DEV && (lastResponse || lastError) && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  {lastResponse ? '📥 Response JSON' : '❌ Error JSON'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ position: 'relative' }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const jsonStr = JSON.stringify(lastResponse || lastError, null, 2)
                      navigator.clipboard.writeText(jsonStr)
                      toast.success('JSON copied to clipboard!')
                    }}
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: '400px',
                      bgcolor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(lastResponse || lastError, null, 2)}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      apiLogger.downloadLogs()
                      toast.success('Logs downloaded!')
                    }}
                    sx={{ mt: 1 }}
                  >
                    Download All Logs
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Paper>
      </Box>
    </Container>
  )
}

