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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Nature, 
  Search, 
  FilterList, 
  Info,
  Close,
  WbSunny,
  WaterDrop,
  Thermometer,
  Air,
  Calendar,
  LocalHospital,
  Book,
  TrendingUp
} from '@mui/icons-material';

interface Plant {
  id: string;
  name: string;
  scientificName: string;
  commonNames: string[];
  category: 'indoor' | 'outdoor' | 'herb' | 'flower' | 'vegetable';
  light: string;
  water: string;
  temperature?: { ideal: string; min: string; max: string };
  humidity?: { ideal: string; min: string; max: string };
  soil?: string;
  growthRate?: string;
  matureSize?: { height: string; spread: string };
  difficulty: number;
  description?: string;
  careTips: string[];
  toxicity?: string;
  benefits: string[];
  imageUrl?: string;
}

interface FilterOptions {
  category: string;
  light: string;
  water: string;
  difficulty: string;
  search: string;
}

const PlantsPage: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    light: '',
    water: '',
    difficulty: '',
    search: ''
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showCareTips, setShowCareTips] = useState(false);

  useEffect(() => {
    const loadPlants = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 这里应该从后端API获取植物数据
        const mockPlants: Plant[] = [
          {
            id: '1',
            name: '绿萝',
            scientificName: 'Epipremnum aureum',
            commonNames: ['黄金葛', '魔鬼藤'],
            category: 'indoor',
            light: 'low',
            water: 'moderate',
            temperature: { ideal: '18-24°C', min: '15°C', max: '30°C' },
            humidity: { ideal: '40-60%', min: '30%', max: '70%' },
            soil: 'well-draining potting mix',
            growthRate: 'medium',
            matureSize: { height: '20-30cm', spread: '30-50cm' },
            difficulty: 2,
            description: '绿萝是最受欢迎的室内植物之一，易于养护，能有效净化空气。',
            careTips: [
              '避免直射阳光',
              '保持土壤微湿，不要过干',
              '每月施肥一次',
              '定期擦拭叶片保持清洁',
              '可水培或土培'
            ],
            toxicity: 'non-toxic',
            benefits: ['air-purification', 'easy-care', 'pet-friendly'],
            imageUrl: '/images/plants/pothos.jpg'
          },
          {
            id: '2',
            name: '仙人掌',
            scientificName: 'Cactaceae',
            commonNames: ['仙人球', '仙人掌'],
            category: 'outdoor',
            light: 'full-sun',
            water: 'minimal',
            temperature: { ideal: '21-27°C', min: '10°C', max: '35°C' },
            humidity: { ideal: '20-40%', min: '10%', max: '50%' },
            soil: 'cactus mix',
            growthRate: 'slow',
            matureSize: { height: '10-30cm', spread: '5-20cm' },
            difficulty: 1,
            description: '仙人掌是耐旱植物，适合新手养护，造型独特。',
            careTips: [
              '需要充足的阳光',
              '浇水要少，土壤完全干透再浇',
              '使用排水良好的土壤',
              '避免积水',
              '冬季减少浇水频率'
            ],
            toxicity: 'non-toxic',
            benefits: ['drought-resistant', 'low-maintenance', 'decorative'],
            imageUrl: '/images/plants/cactus.jpg'
          },
          {
            id: '3',
            name: '薄荷',
            scientificName: 'Mentha',
            commonNames: ['薄荷', '留兰香'],
            category: 'herb',
            light: 'partial-sun',
            water: 'frequent',
            temperature: { ideal: '18-24°C', min: '15°C', max: '27°C' },
            humidity: { ideal: '50-70%', min: '40%', max: '80%' },
            soil: 'moist, well-draining soil',
            growthRate: 'fast',
            matureSize: { height: '30-90cm', spread: '30-60cm' },
            difficulty: 2,
            description: '薄荷是香草植物，叶片有清凉香气，可用于烹饪和泡茶。',
            careTips: [
              '需要充足的水分',
              '喜欢半阴环境',
              '定期修剪促进分枝',
              '容易蔓延，需要控制',
              '可以随时采摘使用'
            ],
            toxicity: 'non-toxic',
            benefits: ['culinary', 'fragrant', 'medicinal'],
            imageUrl: '/images/plants/mint.jpg'
          },
          {
            id: '4',
            name: '多肉植物',
            scientificName: 'Succulentae',
            commonNames: ['多肉', '肉质植物'],
            category: 'outdoor',
            light: 'partial-sun',
            water: 'minimal',
            temperature: { ideal: '18-25°C', min: '5°C', max: '35°C' },
            humidity: { ideal: '30-50%', min: '20%', max: '60%' },
            soil: 'cactus/succulent mix',
            growthRate: 'slow',
            matureSize: { height: '10-30cm', spread: '10-30cm' },
            difficulty: 1,
            description: '多肉植物叶片肥厚，储水能力强，造型多样可爱。',
            careTips: [
              '避免积水，宁干勿湿',
              '需要良好的光照',
              '使用排水好的土壤',
              '冬季减少浇水',
              '避免叶片长期潮湿'
            ],
            toxicity: 'non-toxic',
            benefits: ['drought-resistant', 'decorative', 'low-maintenance'],
            imageUrl: '/images/plants/succulent.jpg'
          }
        ];
        
        setPlants(mockPlants);
        setFilteredPlants(mockPlants);
      } catch (error) {
        console.error('Failed to load plants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlants();
  }, []);

  useEffect(() => {
    let result = plants;

    // 应用搜索过滤
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(plant => 
        plant.name.toLowerCase().includes(searchLower) ||
        plant.scientificName?.toLowerCase().includes(searchLower) ||
        plant.commonNames.some(name => name.toLowerCase().includes(searchLower))
      );
    }

    // 应用分类过滤
    if (filters.category) {
      result = result.filter(plant => plant.category === filters.category);
    }

    // 应用光照过滤
    if (filters.light) {
      result = result.filter(plant => plant.light === filters.light);
    }

    // 应用浇水过滤
    if (filters.water) {
      result = result.filter(plant => plant.water === filters.water);
    }

    // 应用难度过滤
    if (filters.difficulty) {
      result = result.filter(plant => 
        filters.difficulty === 'easy' ? plant.difficulty <= 2 :
        filters.difficulty === 'medium' ? plant.difficulty === 3 :
        plant.difficulty >= 4
      );
    }

    setFilteredPlants(result);
  }, [filters, plants]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      light: '',
      water: '',
      difficulty: '',
      search: ''
    });
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'success';
    if (difficulty === 3) return 'warning';
    return 'error';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'indoor': return <Nature sx={{ color: 'primary.main' }} />;
      case 'outdoor': return <WbSunny sx={{ color: 'warning.main' }} />;
      case 'herb': return <LocalHospital sx={{ color: 'success.main' }} />;
      case 'flower': return <Nature sx={{ color: 'secondary.main' }} />;
      case 'vegetable': return <TrendingUp sx={{ color: 'info.main' }} />;
      default: return <Nature />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          加载植物数据中...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        植物百科
      </Typography>

      {/* 搜索和过滤器 */}
      <Box sx={{ mb: 4 }}>
        <Card>
          <CardContent sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="搜索植物"
                  variant="outlined"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>分类</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">全部分类</MenuItem>
                    <MenuItem value="indoor">室内植物</MenuItem>
                    <MenuItem value="outdoor">室外植物</MenuItem>
                    <MenuItem value="herb">香草植物</MenuItem>
                    <MenuItem value="flower">花卉植物</MenuItem>
                    <MenuItem value="vegetable">蔬菜植物</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>光照</InputLabel>
                  <Select
                    value={filters.light}
                    onChange={(e) => handleFilterChange('light', e.target.value)}
                  >
                    <MenuItem value="">全部光照</MenuItem>
                    <MenuItem value="low">低光照</MenuItem>
                    <MenuItem value="partial-sun">半日照</MenuItem>
                    <MenuItem value="partial-shade">半阴凉</MenuItem>
                    <MenuItem value="full-sun">全日照</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>浇水</InputLabel>
                  <Select
                    value={filters.water}
                    onChange={(e) => handleFilterChange('water', e.target.value)}
                  >
                    <MenuItem value="">全部浇水</MenuItem>
                    <MenuItem value="minimal">少浇水</MenuItem>
                    <MenuItem value="moderate">中等浇水</MenuItem>
                    <MenuItem value="frequent">多浇水</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>难度</InputLabel>
                  <Select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  >
                    <MenuItem value="">全部难度</MenuItem>
                    <MenuItem value="easy">简单</MenuItem>
                    <MenuItem value="medium">中等</MenuItem>
                    <MenuItem value="hard">困难</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1}>
                <Button 
                  variant="outlined" 
                  onClick={clearFilters}
                  sx={{ height: '100%' }}
                >
                  清除
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* 植物统计 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Nature sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">{plants.length}</Typography>
              <Typography variant="body2" color="text.secondary">植物总数</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Book sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4">{filteredPlants.length}</Typography>
              <Typography variant="body2" color="text.secondary">搜索结果</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalHospital sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h4">{plants.filter(p => p.difficulty <= 2).length}</Typography>
              <Typography variant="body2" color="text.secondary">适合新手</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Info sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
              <Typography variant="h4">100%</Typography>
              <Typography variant="body2" color="text.secondary">信息完整</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 植物列表 */}
      <Grid container spacing={3}>
        {filteredPlants.map((plant) => (
          <Grid item xs={12} md={6} lg={4} key={plant.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getCategoryIcon(plant.category)}
                    <Typography variant="h6">{plant.name}</Typography>
                  </Box>
                }
                subheader={plant.scientificName}
                action={
                  <Chip 
                    label={`难度 ${plant.difficulty}`}
                    color={getDifficultyColor(plant.difficulty)}
                    size="small"
                  />
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plant.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <WbSunny sx={{ mr: 1, fontSize: 18 }} />
                    光照: {plant.light}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <WaterDrop sx={{ mr: 1, fontSize: 18 }} />
                    浇水: {plant.water}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <Thermometer sx={{ mr: 1, fontSize: 18 }} />
                    温度: {plant.temperature?.ideal}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <LocalHospital sx={{ mr: 1, fontSize: 16 }} />
                    常见名称: {plant.commonNames.join(', ')}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <Calendar sx={{ mr: 1, fontSize: 16 }} />
                    生长速度: {plant.growthRate}
                  </Typography>
                </Box>
                
                {plant.toxicity && (
                  <Alert severity="warning" size="small" sx={{ mb: 2 }}>
                    毒性: {plant.toxicity === 'non-toxic' ? '无毒' : 
                           plant.toxicity === 'toxic-to-pets' ? '对宠物有毒' : '对人类有毒'}
                  </Alert>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => {
                    setSelectedPlant(plant);
                    setDrawerOpen(true);
                  }}
                >
                  查看详情
                </Button>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => setShowCareTips(true)}
                >
                  养护指南
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPlants.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Nature sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            没有找到匹配的植物
          </Typography>
          <Typography variant="body2" color="text.secondary">
            尝试调整搜索条件或清除过滤器
          </Typography>
        </Box>
      )}

      {/* 植物详情抽屉 */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '50%', maxWidth: 600 } }}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {selectedPlant?.name} 详情
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        {selectedPlant && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              {selectedPlant.name}
            </Typography>
            <Typography variant="h6" gutterBottom color="text.secondary">
              {selectedPlant.scientificName}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedPlant.description}
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>基本信息</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">分类: {selectedPlant.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">难度: {selectedPlant.difficulty}/5</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">光照: {selectedPlant.light}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">浇水: {selectedPlant.water}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">生长速度: {selectedPlant.growthRate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">成熟大小: {selectedPlant.matureSize?.height} × {selectedPlant.matureSize?.spread}</Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>养护要求</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>土壤:</strong> {selectedPlant.soil}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>温度:</strong> {selectedPlant.temperature?.ideal} (范围: {selectedPlant.temperature?.min} - {selectedPlant.temperature?.max})
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>湿度:</strong> {selectedPlant.humidity?.ideal} (范围: {selectedPlant.humidity?.min} - {selectedPlant.humidity?.max})
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>养护小贴士</Typography>
              <List>
                {selectedPlant.careTips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>功效</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedPlant.benefits.map((benefit, index) => (
                  <Chip key={index} label={benefit} size="small" />
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* 养护指南对话框 */}
      <Dialog open={showCareTips} onClose={() => setShowCareTips(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPlant?.name} 养护指南
        </DialogTitle>
        <DialogContent>
          {selectedPlant && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPlant.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>养护要点</Typography>
              <List>
                {selectedPlant.careTips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="h6" gutterBottom mt={2}>注意事项</Typography>
              {selectedPlant.toxicity && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {selectedPlant.toxicity === 'non-toxic' ? '无毒，适合家庭种植' : 
                   selectedPlant.toxicity === 'toxic-to-pets' ? '对宠物有毒，请避免让宠物接触' : 
                   '对人类有毒，请小心处理'}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCareTips(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlantsPage;