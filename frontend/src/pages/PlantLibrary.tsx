import React, { useState } from 'react';
import { usePlants } from '../contexts/PlantContext';
import { Container, Typography, Card, CardContent, Grid, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Chip, Box, Pagination } from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';

const PlantLibrary: React.FC = () => {
  const { plants, loading } = usePlants();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLight, setSelectedLight] = useState('all');
  const [selectedWater, setSelectedWater] = useState('all');
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Get unique categories for filter
  const categories = Array.from(new Set(plants.map(plant => plant.category)));
  const lightConditions = Array.from(new Set(plants.map(plant => plant.light)));
  const wateringConditions = Array.from(new Set(plants.map(plant => plant.water)));

  // Filter plants based on criteria
  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.scientificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.commonNames?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || plant.category === selectedCategory;
    const matchesLight = selectedLight === 'all' || plant.light === selectedLight;
    const matchesWater = selectedWater === 'all' || plant.water === selectedWater;
    const matchesDifficulty = difficulty === null || plant.difficulty === difficulty;

    return matchesSearch && matchesCategory && matchesLight && matchesWater && matchesDifficulty;
  });

  // Pagination
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlants = filteredPlants.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPlants.length / itemsPerPage);

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'indoor': 'primary',
      'outdoor': 'success',
      'herb': 'warning',
      'flower': 'error',
      'vegetable': 'info'
    };
    return colors[category] || 'default';
  };

  const getLightIcon = (light: string) => {
    const icons: { [key: string]: string } = {
      'full-sun': '☀️',
      'partial-sun': '⛅',
      'partial-shade': '🌤️',
      'shade': '🌙'
    };
    return icons[light] || '💡';
  };

  const getWaterIcon = (water: string) => {
    const icons: { [key: string]: string } = {
      'frequent': '💧💧💧',
      'moderate': '💧💧',
      'minimal': '💧'
    };
    return icons[water] || '💧';
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
        植物百科
      </Typography>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="搜索植物..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>类别</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">全部</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>光照</InputLabel>
                <Select
                  value={selectedLight}
                  onChange={(e) => setSelectedLight(e.target.value)}
                >
                  <MenuItem value="all">全部</MenuItem>
                  {lightConditions.map(light => (
                    <MenuItem key={light} value={light}>
                      {getLightIcon(light)} {light}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>浇水</InputLabel>
                <Select
                  value={selectedWater}
                  onChange={(e) => setSelectedWater(e.target.value)}
                >
                  <MenuItem value="all">全部</MenuItem>
                  {wateringConditions.map(water => (
                    <MenuItem key={water} value={water}>
                      {getWaterIcon(water)} {water}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>难度</InputLabel>
                <Select
                  value={difficulty === null ? '' : difficulty}
                  onChange={(e) => setDifficulty(e.target.value ? Number(e.target.value) : null)}
                >
                  <MenuItem value="">全部</MenuItem>
                  {[1, 2, 3, 4, 5].map(level => (
                    <MenuItem key={level} value={level}>
                      {getDifficultyStars(level)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Info */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          找到 {filteredPlants.length} 种植物
        </Typography>
        {filteredPlants.length === 0 && (
          <Typography variant="body1" color="error">
            没有找到匹配的植物，请调整搜索条件
          </Typography>
        )}
      </Box>

      {/* Plants Grid */}
      <Grid container spacing={3}>
        {currentPlants.map((plant) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={plant.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  {plant.imageUrl ? (
                    <img 
                      src={plant.imageUrl} 
                      alt={plant.name}
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 120, 
                        background: '#f5f5f5', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h4">🌱</Typography>
                    </Box>
                  )}
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom sx={{ textAlign: 'center' }}>
                  {plant.name}
                </Typography>
                
                {plant.scientificName && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                    {plant.scientificName}
                  </Typography>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={plant.category}
                    color={getCategoryColor(plant.category) as any}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <span style={{ mr: 8 }}>{getLightIcon(plant.light)}</span>
                    {plant.light}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <span style={{ mr: 8 }}>{getWaterIcon(plant.water)}</span>
                    {plant.water}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ mr: 8 }}>⭐</span>
                    难度 {plant.difficulty}/5
                  </Typography>
                </Box>
                
                {plant.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {plant.description.length > 100 ? plant.description.substring(0, 100) + '...' : plant.description}
                  </Typography>
                )}
                
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {getDifficultyStars(plant.difficulty)}
                  </Typography>
                  <Button size="small" fullWidth variant="outlined">
                    查看详情
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default PlantLibrary;