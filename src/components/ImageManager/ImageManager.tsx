import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Pagination,
  FormControlLabel,
  Switch,
  Skeleton,
  Tooltip,
  Alert,
  AlertTitle,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import { imagesApi } from '@/api/images'
import { Image } from '@/types/image'
import toast from 'react-hot-toast'
import { getCookie } from '@/utils/cookies'

interface ImageManagerProps {
  onSelectImage?: (url: string) => void
  selectMode?: boolean
}

export default function ImageManager({ onSelectImage, selectMode = false }: ImageManagerProps) {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState({ description: '', isPublic: true })
  const [page, setPage] = useState(0)
  const [size] = useState(12)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [filterPublic, setFilterPublic] = useState<boolean | undefined>(undefined)
  const [authError, setAuthError] = useState<string | null>(null)

  // Load images
  const loadImages = async () => {
    setLoading(true)
    try {
      const data = await imagesApi.getAll(page, size, filterPublic)
      // Backend returns Spring Data Page format with 'content' array
      setImages(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotal(data.totalElements || 0)
    } catch (error: any) {
      console.error('Failed to load images:', error)
      toast.error(error.response?.data?.message || 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [page, filterPublic])

  // Upload image
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check token before upload
    const token = getCookie('token')
    console.log('🔍 [IMAGE MANAGER] Pre-upload check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      allCookies: document.cookie,
    })

    if (!token) {
      toast.error('Session expired. Please login again.')
      console.error('❌ [IMAGE MANAGER] No token found in cookies')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setUploading(true)
    console.log('📤 [IMAGE MANAGER] Starting upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
    
    try {
      const result = await imagesApi.upload(file, undefined, true)
      console.log('✅ [IMAGE MANAGER] Upload successful:', result)
      toast.success('Image uploaded successfully')
      await loadImages()
      if (onSelectImage) {
        onSelectImage(result.url)
      }
    } catch (error: any) {
      console.error('❌ [IMAGE MANAGER] Upload failed:', error)
      console.error('❌ [IMAGE MANAGER] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers,
        },
      })
      
      // Check if it's an authentication error
      const isAuthError = error.response?.status === 401 || 
        (error.response?.status === 400 && 
         (error.response?.data?.message?.toLowerCase().includes('not authenticated') ||
          error.response?.data?.message?.toLowerCase().includes('authentication')))
      
      if (isAuthError) {
        const errorMsg = error.response?.data?.message || 'Authentication failed. Please check console for details.'
        setAuthError(errorMsg)
        toast.error(errorMsg)
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to upload image')
      }
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Delete image
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      await imagesApi.delete(id)
      toast.success('Image deleted successfully')
      await loadImages()
    } catch (error: any) {
      console.error('Failed to delete image:', error)
      toast.error(error.response?.data?.message || 'Failed to delete image')
    }
  }

  // Copy URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard!')
  }

  // Edit image
  const handleEdit = (image: Image) => {
    setSelectedImage(image)
    setEditData({
      description: image.description || '',
      isPublic: image.isPublic,
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedImage) return

    try {
      await imagesApi.update(selectedImage.id, editData)
      toast.success('Image updated successfully')
      setEditDialogOpen(false)
      await loadImages()
    } catch (error: any) {
      console.error('Failed to update image:', error)
      toast.error(error.response?.data?.message || 'Failed to update image')
    }
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1) // MUI Pagination is 1-indexed, backend is 0-indexed
  }

  return (
    <Box>
      {/* Authentication Error Alert */}
      {authError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                window.location.href = '/login'
              }}
            >
              Go to Login
            </Button>
          }
          onClose={() => setAuthError(null)}
        >
          <AlertTitle>Authentication Error</AlertTitle>
          {authError}
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Check browser console for detailed logs. Auto-redirect is disabled for debugging.
          </Typography>
        </Alert>
      )}

      {/* Header with Upload and Filter */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6">Image Gallery</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={filterPublic === true}
                onChange={(e) => setFilterPublic(e.target.checked ? true : undefined)}
              />
            }
            label="Public only"
          />
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              component="span"
              startIcon={uploading ? <CircularProgress size={20} /> : <AddPhotoAlternateIcon />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </label>
        </Box>
      </Box>

      {/* Image Grid */}
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(12)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardActions>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : images.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            No images found. Upload your first image!
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: selectMode ? 'pointer' : 'default',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => {
                    if (selectMode && onSelectImage) {
                      onSelectImage(image.url)
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.url}
                    alt={image.description || 'Image'}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
                  {image.description && (
                    <Box sx={{ p: 1 }}>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {image.description}
                      </Typography>
                    </Box>
                  )}
                  <CardActions sx={{ justifyContent: 'flex-end', mt: 'auto' }}>
                    <Tooltip title="Copy URL">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyUrl(image.url)
                        }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(image)
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(image.id)
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}

          {/* Total count */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            Total: {total} images
          </Typography>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Image</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ mb: 2 }}>
              <img
                src={selectedImage.url}
                alt={selectedImage.description || 'Image'}
                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
              />
            </Box>
          )}
          <TextField
            fullWidth
            label="Description"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            sx={{ mt: 2 }}
            multiline
            rows={3}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editData.isPublic}
                onChange={(e) => setEditData({ ...editData, isPublic: e.target.checked })}
              />
            }
            label="Public"
            sx={{ mt: 2, display: 'block' }}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveEdit}>
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

