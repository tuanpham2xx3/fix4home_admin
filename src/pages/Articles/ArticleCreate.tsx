import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Box, Typography } from '@mui/material'
import ArticleForm from '@/components/ArticleForm/ArticleForm'
import { articlesApi } from '@/api/articles'
import { CreateArticleRequest } from '@/types/article'
import toast from 'react-hot-toast'

export default function ArticleCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateArticleRequest) => articlesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      toast.success('Article created successfully')
      navigate('/articles')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create article')
    },
  })

  const handleSubmit = async (data: CreateArticleRequest) => {
    await createMutation.mutateAsync(data)
  }

  const handleCancel = () => {
    navigate('/articles')
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Article
      </Typography>
      <ArticleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createMutation.isPending}
      />
    </Box>
  )
}

