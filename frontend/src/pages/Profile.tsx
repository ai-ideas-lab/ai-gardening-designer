import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Card, CardContent, Grid, TextField, Button, Box, Avatar, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { Edit, Notifications, Settings, Email, Location, Calendar } from '@mui/icons-material';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    location: user?.location || '',
    balconyType: user?.balconyType || '',
    balconySize: user?.balconySize || '',
    balconyDirection: user?.balconyDirection || '',
    preferences: user?.preferences || ''
  });

  const handleSaveProfile = async () => {
    try {
      // This would make an API call to update the user profile
      console.log('Updating profile:', userData);
      setIsEditing(false);
      // In a real app, you'd update the user context here
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setUserData({
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
      location: user?.location || '',
      balconyType: user?.balconyType || '',
      balconySize: user?.balconySize || '',
      balconyDirection: user?.balconyDirection || '',
      preferences: user?.preferences || ''
    });
    setIsEditing(false);
  };

  const stats = [
    { label: '加入时间', value: '2024年1月', icon: <Calendar /> },
    { label: '活跃天数', value: '156天', icon: <Calendar /> },
    { label: '完成项目', value: '8个', icon: <Calendar /> },
    { label: '收藏植物', value: '32种', icon: <Calendar /> },
    { label: '社区贡献', value: '45条', icon: <Calendar /> },
    { label: '获得赞数', value: '128个', icon: <Calendar /> }
  ];

  const recentActivities = [
    { action: '创建了项目 "我的小阳台花园"', time: '2小时前' },
    { action: '收藏了植物 "龟背竹"', time: '1天前' },
    { action: '回复了帖子 "阳台新手求助"', time: '2天前' },
    { action: '完成了浇水任务', time: '3天前' },
    { action: '分享了植物搭配经验', time: '5天前' }
  ];

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">
          请先登录查看个人资料
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        个人资料
      </Typography>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  margin: '0 auto 16px',
                  bgcolor: '#2e7d32',
                  fontSize: '48px'
                }}
              >
                {user.name?.charAt(0) || user.username?.charAt(0) || '👤'}
              </Avatar>
              
              <Typography variant="h5" component="h3" gutterBottom>
                {user.name || user.username}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              {user.location && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📍 {user.location}
                </Typography>
              )}
              
              <Button 
                variant="outlined" 
                startIcon={<Edit />}
                onClick={() => setIsEditing(!isEditing)}
                sx={{ mt: 2 }}
              >
                {isEditing ? '取消编辑' : '编辑资料'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Editable Profile */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {isEditing ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="姓名"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="用户名"
                      value={userData.username}
                      onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="邮箱"
                      value={userData.email}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="所在地区"
                      value={userData.location}
                      onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="阳台类型"
                      value={userData.balconyType}
                      onChange={(e) => setUserData({ ...userData, balconyType: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="阳台面积 (平方米)"
                      type="number"
                      value={userData.balconySize}
                      onChange={(e) => setUserData({ ...userData, balconySize: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="阳台朝向"
                      value={userData.balconyDirection}
                      onChange={(e) => setUserData({ ...userData, balconyDirection: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="个人偏好"
                      value={userData.preferences}
                      onChange={(e) => setUserData({ ...userData, preferences: e.target.value })}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="contained" onClick={handleSaveProfile}>
                        保存更改
                      </Button>
                      <Button variant="outlined" onClick={handleCancelEdit}>
                        取消
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 1, color: '#666' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">邮箱</Typography>
                        <Typography>{user.email}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Location sx={{ mr: 1, color: '#666' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">地区</Typography>
                        <Typography>{user.location || '未设置'}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Calendar sx={{ mr: 1, color: '#666' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">加入时间</Typography>
                        <Typography>2024年1月</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Calendar sx={{ mr: 1, color: '#666' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">阳台信息</Typography>
                        <Typography>
                          {user.balconyType && `${user.balconyType} · `}
                          {user.balconySize && `${user.balconySize}㎡ · `}
                          {user.balconyDirection}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                统计信息
              </Typography>
              <Grid container spacing={2}>
                {stats.map((stat, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2, minWidth: 80 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="body1">
                        {stat.icon} {stat.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                最近活动
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemText
                      primary={activity.action}
                      secondary={activity.time}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                账户设置
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Notifications />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    通知设置
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Settings />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    隐私设置
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={logout}
                    fullWidth
                  >
                    退出登录
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;