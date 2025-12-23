import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ConfigProvider } from 'antd'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/Layout/AdminLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ArticleList from '@/pages/Articles/ArticleList'
import ArticleCreate from '@/pages/Articles/ArticleCreate'
import ArticleEdit from '@/pages/Articles/ArticleEdit'
import Images from '@/pages/Images'
import BookingList from '@/pages/Bookings/BookingList'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ConfigProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/new" element={<ArticleCreate />} />
              <Route path="articles/:id/edit" element={<ArticleEdit />} />
              <Route path="images" element={<Images />} />
              <Route path="bookings" element={<BookingList />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ConfigProvider>
  )
}

export default App

