import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlants } from '../contexts/PlantContext';
import { Container, Typography, Paper, Grid, Card, CardContent, Button, Box, TextField, MenuItem, Select, FormControl, InputLabel, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface BalconyInfo {
  type: string;
  size: number;
  direction: string;
  sunlight: string;
  budget: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, plants, loading } = usePlants();
  const navigate = useNavigate();
  
  const [balconyInfo, setBalconyInfo] = useState<BalconyInfo>({
    type: '',
    size: 0,
    direction: '',
    sunlight: '',
    budget: 0
  });
  
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // This would be an API call to our AI backend
      // For now, we'll simulate some recommendations
      setTimeout(() => {
        const mockRecommendations = [
          {
            id: 1,
            name: '薄荷',
            reason: '喜阳光，易养护，适合阳台种植',
            difficulty: 1,
            benefits: ['驱蚊', '泡茶', '香料']
          },
          {
            id: 2,
            name: '绿萝',
            reason: '耐阴性强，净化空气，新手友好',
            difficulty: 1,
            benefits: ['净化空气', '观赏价值高']
          },
          {
            id: 3,
            name: '多肉植物组合',
            reason: '省水省空间，造型多样',
            difficulty: 2,
            benefits: ['装饰性强', '养护简单']
          }
        ];
        setAiRecommendations(mockRecommendations);
        setIsAnalyzing(false);
      }, 2000);
    } catch (error) {
      console.error('AI分析失败:', error);
      setIsAnalyzing(false);
    }
  };

  const handleCreateProject = async () => {
    if (newProject.name.trim()) {
      // This would create a new project
      setNewProject({ name: '', description: '' });
      // Redirect to projects page
      navigate('/projects');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Box textAlign="center" py={4}>
          <Typography>加载中...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        欢迎回来，{user?.name || user?.username || '园艺爱好者'}！
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                我的项目
              </Typography>
              <Typography variant="h4" component="h2" sx={{ color: '#2e7d32' }}>
                {projects.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                植物收藏
              </Typography>
              <Typography variant="h4" component="h2" sx={{ color: '#2e7d32' }}>
                {plants.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                活跃天数
              </Typography>
              <Typography variant="h4" component="h2" sx={{ color: '#2e7d32' }}>
                7
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                社区贡献
              </Typography>
              <Typography variant="h4" component="h2" sx={{ color: '#2e7d32' }}>
                3
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        快速操作
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🌱 创建新项目
            </Typography>
            <TextField
              fullWidth
              label="项目名称"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="项目描述"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={handleCreateProject}
              disabled={!newProject.name.trim()}
            >
              创建项目
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎨 AI 设计助手
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              告诉我们你的阳台信息，AI为你推荐最适合的植物组合
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>阳台类型</InputLabel>
                  <Select
                    value={balconyInfo.type}
                    onChange={(e) => setBalconyInfo({ ...balconyInfo, type: e.target.value })}
                  >
                    <MenuItem value="open">开放式</MenuItem>
                    <MenuItem value="enclosed">封闭式</MenuItem>
                    <MenuItem value="semi">半开放式</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>朝向</InputLabel>
                  <Select
                    value={balconyInfo.direction}
                    onChange={(e) => setBalconyInfo({ ...balconyInfo, direction: e.target.value })}
                  >
                    <MenuItem value="south">南向</MenuItem>
                    <MenuItem value="north">北向</MenuItem>
                    <MenuItem value="east">东向</MenuItem>
                    <MenuItem value="west">西向</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Button 
              variant="contained" 
              onClick={handleAIAnalysis}
              disabled={isAnalyzing || !balconyInfo.type || !balconyInfo.direction}
              sx={{ width: '100%' }}
            >
              {isAnalyzing ? 'AI分析中...' : '开始AI设计'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            🤖 AI 智能推荐
          </Typography>
          <Grid container spacing={3}>
            {aiRecommendations.map((plant) => (
              <Grid item xs={12} md={4} key={plant.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#2e7d32' }}>
                      {plant.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plant.reason}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        难度: {'⭐'.repeat(plant.difficulty)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        功效: {plant.benefits.join(', ')}
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined">
                      了解详情
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Recent Projects */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          最近项目
        </Typography>
        {projects.length > 0 ? (
          <Grid container spacing={3}>
            {projects.slice(0, 3).map((project) => (
              <Grid item xs={12} md={4} key={project.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      状态: {project.status}
                    </Typography>
                    <Button size="small" variant="outlined" sx={{ mt: 1 }}>
                      查看详情
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            还没有项目？点击上方"创建新项目"开始你的园艺之旅！
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;