import React, { useState } from 'react';
import { usePlants } from '../contexts/PlantContext';
import { Container, Typography, Card, CardContent, Grid, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Alert } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  balconyJson?: string;
  designJson?: string;
  location?: string;
  area?: number;
  budget?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const Projects: React.FC = () => {
  const { projects, loading, fetchProjects } = usePlants();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', location: '', area: 0, budget: 0 });
  const navigate = useNavigate();

  const handleCreateProject = async () => {
    try {
      // This would make an API call to create the project
      console.log('Creating project:', newProject);
      await fetchProjects(); // Refresh projects
      setIsDialogOpen(false);
      setNewProject({ name: '', description: '', location: '', area: 0, budget: 0 });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description || '',
      location: project.location || '',
      area: project.area || 0,
      budget: project.budget || 0
    });
    setIsDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    
    try {
      // This would make an API call to update the project
      console.log('Updating project:', { id: editingProject.id, ...newProject });
      await fetchProjects(); // Refresh projects
      setIsDialogOpen(false);
      setEditingProject(null);
      setNewProject({ name: '', description: '', location: '', area: 0, budget: 0 });
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      try {
        // This would make an API call to delete the project
        console.log('Deleting project:', projectId);
        await fetchProjects(); // Refresh projects
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'primary';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return '规划中';
      case 'in-progress': return '进行中';
      case 'completed': return '已完成';
      default: return status;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          我的项目
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setIsDialogOpen(true)}
        >
          新建项目
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Alert severity="info">
          还没有项目？点击"新建项目"开始创建你的第一个花园项目！
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      {project.name}
                    </Typography>
                    <Box>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/projects/${project.id}`)}
                        sx={{ mr: 1 }}
                      >
                        查看
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => handleEditProject(project)}
                      >
                        <Edit />
                      </Button>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description || '暂无描述'}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={getStatusText(project.status)}
                      color={getStatusColor(project.status) as any}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {project.location && (
                      <Chip 
                        label={project.location}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    {project.area && (
                      <Typography variant="body2" color="text.secondary">
                        面积: {project.area}㎡
                      </Typography>
                    )}
                    {project.budget && (
                      <Typography variant="body2" color="text.secondary">
                        预算: ¥{project.budget}
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    创建时间: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    删除
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Project Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? '编辑项目' : '新建项目'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="项目名称"
            fullWidth
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="项目描述"
            fullWidth
            multiline
            rows={3}
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="位置"
            fullWidth
            value={newProject.location}
            onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="面积 (平方米)"
            type="number"
            fullWidth
            value={newProject.area}
            onChange={(e) => setNewProject({ ...newProject, area: Number(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="预算 (元)"
            type="number"
            fullWidth
            value={newProject.budget}
            onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            取消
          </Button>
          <Button onClick={editingProject ? handleUpdateProject : handleCreateProject} variant="contained">
            {editingProject ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Projects;