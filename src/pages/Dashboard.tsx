import { Typography, Paper, Box, Grid, Card, CardContent } from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import { useQuery } from '@tanstack/react-query'
import { articlesApi } from '@/api/articles'
import { ArticleStatus } from '@/types/article'

export default function Dashboard() {
  const { data: articles } = useQuery({
    queryKey: ['articles', 'all'],
    queryFn: () => articlesApi.getAll(),
  })

  const stats = {
    total: articles?.total || 0,
    published: articles?.articles.filter(a => a.status === ArticleStatus.PUBLISHED).length || 0,
    draft: articles?.articles.filter(a => a.status === ArticleStatus.DRAFT).length || 0,
    unpublished: articles?.articles.filter(a => a.status === ArticleStatus.UNPUBLISHED).length || 0,
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ArticleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Articles
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ArticleIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Published
                  </Typography>
                  <Typography variant="h4">{stats.published}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ArticleIcon sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Draft
                  </Typography>
                  <Typography variant="h4">{stats.draft}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ArticleIcon sx={{ fontSize: 40, mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Unpublished
                  </Typography>
                  <Typography variant="h4">{stats.unpublished}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

