import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Box, 
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Dashboard, 
  Notifications, 
  Nature, 
  TrendingUp, 
  Calendar,
  PhotoCamera,
  WaterDrop,
  LightMode
} from '@mui/icons-material';

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  plantCount: number;
  lastUpdated: string;
}

interface Plant {
  id: string;
  name: string;
  type: string;
  health: 'good' | 'warning' | 'critical';
  nextCare: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'project' | 'plant' | 'system';
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // 模拟数据加载
    const loadData = async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProjects([
          {
            id: '1',
            name: '南阳台蔬菜园',
            status: '进行中',
            progress: 75,
            plantCount: 8,
            lastUpdated: '2小时前'
          },
          {
            id: '2',
            name: '北阳台观赏区',
            status: '规划中',
            progress: 30,
            plantCount: 3,
            lastUpdated: '1天前'
          }
        ]);

        setPlants([
          {
            id: '1',
            name: '番茄',
            type: '蔬菜',
            health: 'good',
            nextCare: '明天浇水'
          },
          {
            id: '2',
            name: '薄荷',
            type: '香草',
            health: 'warning',
            nextCare: '今天施肥'
          },
          {
            id: '3',
            name: '绿萝',
            type: '观叶',
            health: 'good',
            nextCare: '3天后浇水'
          }
        ]);

        setActivities([
          {
            id: '1',
            title: '完成了南阳台布局设计',
            description: '添加了5种植物，优化了空间利用',
            time: '2小时前',
            type: 'project'
          },
          {
            id: '2',
            title: '植物健康检查',
            description: '2株植物需要关注',
            time: '5小时前',
            type: 'system'
          },
          {
            id: '3',
            title: '新植物识别',
            description: '识别出新的薄荷品种',
            time: '1天前',
            type: 'plant'
          }
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '进行中': return 'primary';
      case '规划中': return 'secondary';
      case '已完成': return 'success';
      default: return 'default';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project': return <Dashboard />;
      case 'plant': return <Nature />;
      case 'system': return <TrendingUp />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          加载仪表板数据中...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        仪表板
      </Typography>

      {/* 欢迎信息和快捷操作 */}
      <Box sx={{ mb: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          欢迎回来！您有 2 个项目正在进行中，需要关注 1 株植物的健康状况。
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<Nature />}>
            新建项目
          </Button>
          <Button variant="outlined" startIcon={<PhotoCamera />}>
            识别植物
          </Button>
          <Button variant="outlined" startIcon={<Dashboard />}>
            查看报告
          </Button>
        </Box>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader avatar={<Avatar><Dashboard /></Avatar>} title="项目总数" />
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{projects.length}</Typography>
              <Typography variant="body2" color="text.secondary">个活跃项目</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader avatar={<Avatar><Nature /></Avatar>} title="植物总数" />
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{plants.length}</Typography>
              <Typography variant="body2" color="text.secondary">株植物</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader avatar={<Avatar><TrendingUp /></Avatar>} title="今日活动" />
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">3</Typography>
              <Typography variant="body2" color="text.secondary">项活动</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader avatar={<Avatar><Calendar /></Avatar>} title="待办事项" />
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">2</Typography>
              <Typography variant="body2" color="text.secondary">项提醒</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 主要内容区域 */}
      <Grid container spacing={4}>
        {/* 项目概览 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="我的项目" />
            <CardContent>
              {projects.map((project) => (
                <Box key={project.id} sx={{ mb: 2, pb: 2, borderBottom: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{project.name}</Typography>
                    <Chip 
                      label={project.status} 
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      进度: {project.progress}%
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                        <Box 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            height: '100%', 
                            borderRadius: 1,
                            width: `${project.progress}%` 
                          }} 
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'text.secondary' }}>
                    <span>{project.plantCount} 株植物</span>
                    <span>更新于 {project.lastUpdated}</span>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 侧边栏 */}
        <Grid item xs={12} md={4}>
          {/* 植物健康状态 */}
          <Card sx={{ mb: 4 }}>
            <CardHeader title="植物健康" />
            <CardContent>
              <List>
                {plants.map((plant) => (
                  <React.Fragment key={plant.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getHealthColor(plant.health) }}>
                          <Nature />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={plant.name}
                        secondary={`${plant.nextCare}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* 最近活动 */}
          <Card>
            <CardHeader title="最近活动" />
            <CardContent>
              <List>
                {activities.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={`${activity.time} - ${activity.description}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 环境监测 */}
      <Card sx={{ mt: 4 }}>
        <CardHeader title="环境监测" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <WaterDrop sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">湿度</Typography>
                <Typography variant="h4">65%</Typography>
                <Typography variant="body2" color="text.secondary">适宜</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <LightMode sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6">光照</Typography>
                <Typography variant="h4">良好</Typography>
                <Typography variant="body2" color="text.secondary">充足</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6">温度</Typography>
                <Typography variant="h4">22°C</Typography>
                <Typography variant="body2" color="text.secondary">适宜</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Calendar sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                <Typography variant="h6">天气</Typography>
                <Typography variant="h4">晴朗</Typography>
                <Typography variant="body2" color="text.secondary">适合园艺</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardPage;