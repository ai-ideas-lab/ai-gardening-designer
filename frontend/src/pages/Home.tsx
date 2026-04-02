import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Card, CardContent, Grid, Box } from '@mui/material';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI智能设计',
      description: '根据你的阳台条件，AI为你推荐最适合的植物搭配方案',
      icon: '🎨'
    },
    {
      title: '植物百科',
      description: '丰富的植物数据库，包含详细的养护指南和常见问题',
      icon: '🌿'
    },
    {
      title: '项目管理',
      description: '创建和管理你的花园项目，跟踪生长进度',
      icon: '📋'
    },
    {
      title: '社区交流',
      description: '与其他园艺爱好者分享经验和获得专业建议',
      icon: '👥'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Hero Section */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ color: '#2e7d32' }}>
          🌱 AI 园艺设计师
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ color: '#666', mb: 3 }}>
          为城市小阳台族提供AI驱动的园艺设计和养护系统
        </Typography>
        <Typography variant="body1" sx={{ color: '#888', mb: 4, maxWidth: 600, mx: 'auto' }}>
          通过人工智能技术，让每个人都能轻松拥有美丽的花园。从智能植物推荐到个性化养护指导，我们陪伴你的园艺之旅。
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2, px: 4, py: 2 }}
        >
          开始设计
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => navigate('/plants')}
          sx={{ px: 4, py: 2 }}
        >
          探索植物
        </Button>
      </Box>

      {/* Features Section */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
        核心功能
      </Typography>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#2e7d32' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How it Works */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
          如何使用
        </Typography>
        <Grid container spacing={4} sx={{ maxWidth: 800, mx: 'auto' }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32' }}>
                1. 描述你的阳台
              </Typography>
              <Typography variant="body2" color="text.secondary">
                告诉我们你的阳台大小、朝向、光照条件等信息
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32' }}>
                2. AI智能推荐
              </Typography>
              <Typography variant="body2" color="text.secondary">
                我们的AI算法为你推荐最适合的植物组合
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32' }}>
                3. 开始你的园艺之旅
              </Typography>
              <Typography variant="body2" color="text.secondary">
                获得详细的养护指导，享受种植乐趣
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;