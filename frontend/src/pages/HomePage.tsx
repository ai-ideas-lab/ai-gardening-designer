import React from 'react';
import { Container, Grid, Card, CardContent, CardHeader, Typography, Button, Box, Paper } from '@mui/material';
import { Nature, Home, Timeline, Group, Lightbulb } from '@mui/icons-material';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Nature color="primary" />,
      title: "AI植物识别",
      description: "上传植物照片，AI自动识别植物种类并提供专业养护建议",
      color: "primary"
    },
    {
      icon: <Home color="secondary" />,
      title: "智能阳台设计",
      description: "分析您的阳台环境，AI生成个性化植物设计方案",
      color: "secondary"
    },
    {
      icon: <Timeline color="success" />,
      title: "养护提醒系统",
      description: "智能跟踪植物生长状态，提供个性化养护提醒和建议",
      color: "success"
    },
    {
      icon: <Group color="info" />,
      title: "园艺社区",
      description: "与其他园艺爱好者交流分享，获取专业养护经验",
      color: "info"
    },
    {
      icon: <Lightbulb color="warning" />,
      title: "知识库",
      description: "丰富的植物养护知识，解决各种园艺难题",
      color: "warning"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          🌱 AI园艺设计师
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          为城市小阳台族提供AI驱动的园艺设计和养护系统
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          通过AI技术让每个人都能轻松拥有美丽的阳台花园，享受绿色生活的乐趣
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" size="large" color="primary">
            开始设计
          </Button>
          <Button variant="outlined" size="large" color="secondary">
            了解更多
          </Button>
        </Box>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s' }} hover>
              <CardHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {feature.icon}
                  <Typography variant="h6" component="h3">
                    {feature.title}
                  </Typography>
                </Box>
              </CardHeader>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          为什么选择AI园艺设计师？
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="primary" gutterBottom>
                1000+
              </Typography>
              <Typography variant="body1">
                植物种类识别
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="secondary" gutterBottom>
                95%
              </Typography>
              <Typography variant="body1">
                识别准确率
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="success" gutterBottom>
                24/7
              </Typography>
              <Typography variant="body1">
                智能养护提醒
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="info" gutterBottom>
                10万+
              </Typography>
              <Typography variant="body1">
                活跃用户
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box sx={{ mt: 8, textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          开始您的智能园艺之旅
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          立即注册，享受个性化AI园艺设计服务
        </Typography>
        <Button variant="contained" size="large" sx={{ mt: 2 }}>
          免费注册
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;