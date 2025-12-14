import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Stack,
} from '@mui/material'
import RichTextEditor from './RichTextEditor'
import { CreateArticleRequest, UpdateArticleRequest, Article } from '@/types/article'

const schema = yup.object({
  title: yup.string().required('Title is required').max(500, 'Title must not exceed 500 characters'),
  shortDescription: yup.string().max(1000, 'Short description must not exceed 1000 characters'),
  slug: yup.string().required('Slug is required').max(500, 'Slug must not exceed 500 characters'),
  metaDescription: yup.string().max(500, 'Meta description must not exceed 500 characters'),
  metaKeywords: yup.string().max(500, 'Meta keywords must not exceed 500 characters'),
  content: yup.string().required('Content is required'),
})

type FormData = Omit<CreateArticleRequest, 'content' | 'heroImage' | 'sections' | 'contactInfo'> & {
  content: string
}

interface ArticleFormProps {
  article?: Article
  onSubmit: (data: CreateArticleRequest | UpdateArticleRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ArticleForm({ article, onSubmit, onCancel, isLoading }: ArticleFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: article?.title || '',
      shortDescription: article?.shortDescription || '',
      slug: article?.slug || '',
      metaDescription: article?.metaDescription || '',
      metaKeywords: article?.metaKeywords || '',
      content: article?.content?.blocks?.[0]?.content || '',
    },
  })

  const contentValue = watch('content')

  const handleFormSubmit = async (data: FormData) => {
    // Convert HTML content from TinyMCE to structured format
    // For simplicity, we'll store HTML in a paragraph block
    const contentBlocks = data.content
      ? [
          {
            type: 'paragraph' as const,
            content: data.content,
          },
        ]
      : []
    
    const submitData = {
      ...data,
      content: {
        type: 'structured' as const,
        blocks: contentBlocks,
      },
    }

    await onSubmit(submitData as CreateArticleRequest | UpdateArticleRequest)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {article ? 'Edit Article' : 'Create New Article'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="shortDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Short Description"
                  multiline
                  rows={3}
                  error={!!errors.shortDescription}
                  helperText={errors.shortDescription?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Slug (URL-friendly)"
                  error={!!errors.slug}
                  helperText={errors.slug?.message || 'e.g., chong-dot-sua-chua-nha'}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Content *
            </Typography>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.content && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.content.message}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="metaDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Meta Description (SEO)"
                  multiline
                  rows={2}
                  error={!!errors.metaDescription}
                  helperText={errors.metaDescription?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="metaKeywords"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Meta Keywords (SEO)"
                  error={!!errors.metaKeywords}
                  helperText={errors.metaKeywords?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

