import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Button, 
  Box, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Project {
  id: string;
  name: string;
  description: string;
  balconyType: string;
  balconySize: number;
  balconyDirection: string;
  plants: string[];
  createdAt: string;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: '小阳台花园',
      description: '打造一个美丽的小阳台花园，种植多肉植物和花卉',
      balconyType: '阳台',
      balconySize: 8,
      balconyDirection: 'south',
      plants: ['多肉植物', '绿萝', '吊兰'],
      createdAt: '2026-03-15'
    },
    {
      id: '2',
      name: '室内植物角',
      description: '在客厅创建一个室内植物角，净化空气',
      balconyType: '室内',
      balconySize: 5,
      balconyDirection: 'east',
      plants: ['常春藤', '芦荟', '虎皮兰'],
      createdAt: '2026-03-20'
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [createData, setCreateData] = useState({
    name: '',
    description: '',
    balconyType: '',
    balconySize: 0,
    balconyDirection: '',
    plants: [] as string[]
  });

  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...createData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects([...projects, newProject]);
    setCreateData({
      name: '',
      description: '',
      balconyType: '',
      balconySize: 0,
      balconyDirection: '',
      plants: []
    });
    setDialogOpen(false);
    setSelectedProject(null);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setCreateData({
      name: project.name,
      description: project.description,
      balconyType: project.balconyType,
      balconySize: project.balconySize,
      balconyDirection: project.balconyDirection,
      plants: project.plants
    });
    setDialogOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleCreateSubmit = () => {
    if (selectedProject) {
      // Update existing project
      setProjects(projects.map(p => 
        p.id === selectedProject.id 
          ? { ...selectedProject, ...createData }
          : p
      ));
    } else {
      // Create new project
      handleCreateProject();
    }
    setDialogOpen(false);
    setSelectedProject(null);
  };

  const balconyTypes = ['阳台', '室内', '窗台', '庭院', '天台'];
  const directions = ['北', '南', '东', '西'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🌱 我的项目
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理您的园艺项目，记录植物生长过程
        </Typography>
      </Box>

      {/* 操作栏 */}
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedProject(null);
            setCreateData({
              name: '',
              description: '',
              balconyType: '',
              balconySize: 0,
              balconyDirection: '',
              plants: []
            });
            setDialogOpen(true);
          }}
        >
          新建项目
        </Button>
      </Box>

      {/* 项目列表 */}
      <Grid container spacing={4}>
        {projects.map(project => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={project.name}
                subheader={project.createdAt}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {project.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>环境信息：</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.balconyType} · {project.balconySize}㎡ · 朝{project.balconyDirection}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>植物种类：</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {project.plants.map((plant, index) => (
                      <Chip key={index} label={plant} size="small" />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleEditProject(project)}
                  >
                    编辑
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteProject(project.id)}
                    color="error"
                  >
                    删除
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 创建/编辑项目对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProject ? '编辑项目' : '新建项目'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="项目名称"
              value={createData.name}
              onChange={(e) => setCreateData({...createData, name: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="项目描述"
              multiline
              rows={3}
              value={createData.description}
              onChange={(e) => setCreateData({...createData, description: e.target.value})}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>阳台类型</InputLabel>
                  <Select
                    value={createData.balconyType}
                    onChange={(e) => setCreateData({...createData, balconyType: e.target.value})}
                  >
                    {balconyTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="阳台面积 (㎡)"
                  type="number"
                  value={createData.balconySize}
                  onChange={(e) => setCreateData({...createData, balconySize: Number(e.target.value)})}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>阳台朝向</InputLabel>
              <Select
                value={createData.balconyDirection}
                onChange={(e) => setCreateData({...createData, balconyDirection: e.target.value})}
              >
                {directions.map(dir => (
                  <MenuItem key={dir} value={dir}>{dir}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={handleCreateSubmit} variant="contained">
            {selectedProject ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectsPage;