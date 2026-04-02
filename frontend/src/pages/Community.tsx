import React, { useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, TextField, Button, Box, Chip, Alert, List, ListItem, ListItemText, Avatar } from '@mui/material';
import { Forum, PostAdd } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Community: React.FC = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [posts] = useState([
    {
      id: 1,
      title: '阳台新手求助：薄荷叶子发黄怎么办？',
      content: '我的薄荷最近叶子开始发黄，不知道是什么原因，有经验的朋友可以帮忙看看吗？我是南向阳台，光照充足。',
      author: '园艺新手小王',
      authorAvatar: '👨‍🌾',
      category: '求助',
      likes: 12,
      comments: 8,
      time: '2小时前'
    },
    {
      id: 2,
      title: '分享我的多肉植物组合搭配',
      content: '经过半年的摸索，终于找到了最适合我家阳台的多肉组合。分享给大家！主要搭配了玉露、生石花、钱串等。',
      author: '多肉爱好者',
      authorAvatar: '🌵',
      category: '分享',
      likes: 25,
      comments: 15,
      time: '5小时前'
    },
    {
      id: 3,
      title: 'AI推荐给我的植物搭配效果不错',
      content: '用了AI设计功能推荐的植物组合，绿萝+薄荷+吊兰，确实很好养活，而且净化空气效果明显。',
      author: '科技达人',
      authorAvatar: '🤖',
      category: '体验',
      likes: 18,
      comments: 6,
      time: '1天前'
    }
  ]);

  const handleCreatePost = () => {
    if (newPost.title.trim() && newPost.content.trim()) {
      // This would make an API call to create the post
      console.log('Creating post:', newPost);
      setNewPost({ title: '', content: '' });
      // In a real app, you'd add the post to the list and refresh
    }
  };

  const categories = ['全部', '求助', '分享', '体验', '养护', '设计'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        社区交流
      </Typography>

      {/* Create Post Section */}
      {user && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              发表帖子
            </Typography>
            <TextField
              fullWidth
              label="标题"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="内容"
              multiline
              rows={4}
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Chip 
                  label="求助" 
                  color="primary" 
                  size="small"
                  sx={{ mr: 1 }}
                />
              </Box>
              <Button 
                variant="contained" 
                startIcon={<PostAdd />}
                onClick={handleCreatePost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
              >
                发布
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Community Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                活跃用户
              </Typography>
              <Typography variant="h4" component="h2" sx={{ color: '#2e7d32' }}>
                1,234
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                帖子总数
              </Typography>
              <Typography variant="h4" component="h2" sx={{ color: '#2e7d32' }}>
                5,678
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                今日新增
              </Typography>
              <Typography variant="h4" component="h2" sx={{ color: '#2e7d32' }}>
                45
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                专家数
              </Typography>
              <Typography variant="h4" component="h2" sx={{ color: '#2e7d32' }}>
                89
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Posts Section */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        最新帖子
      </Typography>
      
      {posts.length === 0 ? (
        <Alert severity="info">
          还没有帖子，快来发布第一个帖子吧！
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: '#f57c00' }}>
                      {post.authorAvatar}
                    </Avatar>
                    <Box sx flexGrow={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="h3">
                          {post.title}
                        </Typography>
                        <Chip 
                          label={post.category}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {post.author} · {post.time}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {post.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                    <Button size="small" sx={{ mr: 2 }}>
                      👍 {post.likes}
                    </Button>
                    <Button size="small">
                      💬 {post.comments}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Hot Topics */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          热门话题
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {['阳台养花', '多肉植物', '薄荷养护', 'AI推荐', '室内植物', '蔬菜种植', '病虫害防治', '植物搭配'].map((topic) => (
            <Chip 
              key={topic}
              label={`#${topic}`}
              variant="outlined"
              clickable
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default Community;