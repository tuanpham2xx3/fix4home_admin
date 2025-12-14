import { Container, Paper, Typography } from '@mui/material'
import ImageManager from '@/components/ImageManager/ImageManager'

export default function Images() {
  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Image Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload, manage, and organize your images. Click on an image to copy its URL.
        </Typography>
        <ImageManager />
      </Paper>
    </Container>
  )
}

