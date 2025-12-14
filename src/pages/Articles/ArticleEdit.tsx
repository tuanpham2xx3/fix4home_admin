import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import ArticleForm from '@/components/ArticleForm/ArticleForm'
import { articlesApi } from '@/api/articles'
import { UpdateArticleRequest, Article } from '@/types/article'
import toast from 'react-hot-toast'

export default function ArticleEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const articleId = parseInt(id || '0', 10)

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ['article', articleId],
    queryFn: () => articlesApi.getById(articleId, true),
    enabled: !!articleId,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateArticleRequest) => articlesApi.update(articleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['article', articleId] })
      toast.success('Article updated successfully')
      navigate('/articles')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update article')
    },
  })

  const handleSubmit = async (data: UpdateArticleRequest) => {
    await updateMutation.mutateAsync(data)
  }

  const handleCancel = () => {
    navigate('/articles')
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !article) {
    return (
      <Alert severity="error">
        {error ? 'Failed to load article' : 'Article not found'}
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edit Article
      </Typography>
      <ArticleForm
        article={article}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateMutation.isPending}
      />
    </Box>
  )
}

