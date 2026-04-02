import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  TextField, 
  Chip, 
  Avatar, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  ThumbsUpUp as ThumbsUpIcon, 
  Message as CommentIcon, 
  Share as ShareIcon,
  Send as SendIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    level: string;
  };
  createdAt: string;
  tags: string[];
  likes: number;
  comments: number;
  images?: string[];
  isLiked: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    level: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // 模拟数据
  useEffect(() => {
    setTimeout(() => {
      setPosts([
        {
          id: '1',
          title: '我的小阳台改造成功分享',
          content: '经过两个月的努力，终于把我的小阳台变成了一个小花园！从最初的植物杀手到现在，真的要感谢AI园艺设计师的帮助。分享一下我的经验：选择合适的植物很重要，多肉植物比较适合新手，记得控制浇水频率...',
          author: {
            name: '阳台园艺师',
            level: '园艺达人'
          },
          createdAt: '2026-04-01T10:30:00Z',
          tags: ['改造分享', '多肉植物', '新手'],
          likes: 23,
          comments: 8,
          images: ['https://via.placeholder.com/300x200'],
          isLiked: false
        },
        {
          id: '2',
          title: '求助：绿萝叶子发黄怎么办？',
          content: '最近发现家里的绿萝叶子开始发黄，特别是新叶子的边缘。按照AI的建议减少了浇水频率，但情况没有好转。请教大家有没有遇到过类似的问题？',
          author: {
            name: '绿萝新手',
            level: '园艺新手'
          },
          createdAt: '2026-04-01T14:20:00Z',
          tags: ['求助', '绿萝', '病虫害'],
          likes: 15,
          comments: 12,
          isLiked: false
        },
        {
          id: '3',
          title: '春季养护小贴士：换盆最佳时间',
          content: '春天是植物生长的旺季，也是换盆的最佳时机。分享一些换盆的经验：1. 选择比原盆大一号的花盆；2. 使用新的营养土；3. 浇透定根水；4. 放在阴凉处缓苗一周...',
          author: {
            name: '资深园丁',
            level: '园艺专家'
          },
          createdAt: '2026-03-31T16:45:00Z',
          tags: ['春季养护', '换盆', '经验分享'],
          likes: 45,
          comments: 15,
          isLiked: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // 加载评论
  useEffect(() => {
    if (selectedPost) {
      setComments([
        {
          id: '1',
          content: '太棒了！你的阳台真的很漂亮，能分享一下都用了哪些植物吗？',
          author: {
            name: '植物爱好者',
            level: '园艺爱好者'
          },
          createdAt: '2026-04-01T11:00:00Z',
          likes: 5,
          isLiked: false
        },
        {
          id: '2',
          content: '从植物杀手到园艺达人的转变真的很有感染力，加油！',
          author: {
            name: 'AI用户',
            level: '科技达人'
          },
          createdAt: '2026-04-01T11:30:00Z',
          likes: 3,
          isLiked: true
        }
      ]);
    }
  }, [selectedPost]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreatePost = () => {
    if (newPost.title && newPost.content) {
      const post: Post = {
        id: Date.now().toString(),
        title: newPost.title,
        content: newPost.content,
        author: {
          name: '当前用户',
          level: '园艺新手'
        },
        createdAt: new Date().toISOString(),
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        likes: 0,
        comments: 0,
        isLiked: false
      };
      
      setPosts([post, ...posts]);
      setNewPost({ title: '', content: '', tags: '' });
      setShowCreateDialog(false);
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked
        };
      }
      return comment;
    }));
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedPost) {
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        author: {
          name: '当前用户',
          level: '园艺新手'
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };
      
      setComments([...comments, comment]);
      setNewComment('');
      setSelectedPost({
        ...selectedPost,
        comments: selectedPost.comments + 1
      });
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🌱 园艺社区
        </Typography>
        <Typography variant="body1" color="text.secondary">
          分享您的园艺经验，与其他爱好者交流学习
        </Typography>
      </Box>

      {/* 操作栏 */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="搜索帖子、标签或内容..."
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
          >
            发布帖子
          </Button>
        </Paper>
      </Box>

      {/* 热门标签 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          热门标签
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['新手指南', '多肉植物', '绿萝养护', '病虫害防治', '阳台设计', '春季养护', '经验分享', '求助'].map(tag => (
            <Chip 
              key={tag} 
              label={tag} 
              variant="outlined" 
              clickable
              onClick={() => setSearchTerm(tag)}
            />
          ))}
        </Box>
      </Box>

      {/* 帖子列表 */}
      <Grid container spacing={4}>
        {filteredPosts.map(post => (
          <Grid item xs={12} key={post.id}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                avatar={
                  <Avatar>
                    <AccountCircleIcon />
                  </Avatar>
                }
                title={post.title}
                subheader={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {post.author.name} · {post.author.level}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {post.content}
                </Typography>
                {post.images && post.images.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {post.images.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`Post image ${index + 1}`}
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 8 }}
                      />
                    ))}
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {post.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    size="small" 
                    startIcon={<ThumbsUpIcon />}
                    onClick={() => handleLikePost(post.id)}
                    color={post.isLiked ? 'primary' : 'inherit'}
                  >
                    {post.likes}
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<CommentIcon />}
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.comments}
                  </Button>
                  <Button size="small" startIcon={<ShareIcon />}>
                    分享
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 创建帖子对话框 */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>发布新帖子</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="标题"
            fullWidth
            variant="outlined"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="内容"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="标签 (用逗号分隔)"
            fullWidth
            variant="outlined"
            value={newPost.tags}
            onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>取消</Button>
          <Button onClick={handleCreatePost} variant="contained">发布</Button>
        </DialogActions>
      </Dialog>

      {/* 帖子详情对话框 */}
      <Dialog 
        open={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedPost && (
          <>
            <DialogTitle>{selectedPost.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedPost.author.name} · {selectedPost.author.level} · 
                  {format(new Date(selectedPost.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                  {selectedPost.content}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {selectedPost.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button 
                    size="small" 
                    startIcon={<ThumbsUpIcon />}
                    onClick={() => handleLikePost(selectedPost.id)}
                    color={selectedPost.isLiked ? 'primary' : 'inherit'}
                  >
                    {selectedPost.likes}
                  </Button>
                  <Button size="small" startIcon={<CommentIcon />}>
                    {selectedPost.comments}
                  </Button>
                  <Button size="small" startIcon={<ShareIcon />}>
                    分享
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" gutterBottom>
                评论 ({comments.length})
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="写下您的评论..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleAddComment} disabled={!newComment.trim()}>
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <List>
                {comments.map(comment => (
                  <React.Fragment key={comment.id}>
                    <ListItem>
                      <Avatar sx={{ mr: 2 }}>
                        <AccountCircleIcon />
                      </Avatar>
                      <ListItemText
                        primary={comment.content}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {comment.author.name} · {comment.author.level}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                              </Typography>
                              <Button 
                                size="small" 
                                startIcon={<ThumbsUpIcon />}
                                onClick={() => handleLikeComment(comment.id)}
                                color={comment.isLiked ? 'primary' : 'inherit'}
                              >
                                {comment.likes}
                              </Button>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedPost(null)}>关闭</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default CommunityPage;