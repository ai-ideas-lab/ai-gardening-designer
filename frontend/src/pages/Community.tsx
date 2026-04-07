import React, { useState, useEffect, useCallback } from 'react';
import { Container, TextField, InputAdornment, Box, Typography, CircularProgress, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PostCard from '../components/PostCard';
import type { Post } from '../types/community';
import { CommunityService } from '../services/community';

interface CommunityState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filteredPosts: Post[];
}

const Community: React.FC = () => {
  const [state, setState] = useState<CommunityState>({
    posts: [],
    loading: true,
    error: null,
    searchQuery: '',
    filteredPosts: [],
  });

  const fetchPosts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const fetchedPosts = await CommunityService.getPosts();
      setState(prev => ({ 
        ...prev, 
        posts: fetchedPosts, 
        filteredPosts: fetchedPosts,
        loading: false 
      }));
    } catch (error) {
      console.error('获取帖子失败:', error);
      setState(prev => ({ 
        ...prev, 
        error: '获取帖子失败，请稍后重试',
        loading: false 
      }));
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const searchPosts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, filteredPosts: prev.posts }));
      return;
    }
    
    try {
      const searchResults = await CommunityService.searchPosts(query);
      setState(prev => ({ ...prev, filteredPosts: searchResults }));
    } catch (error) {
      console.error('搜索帖子失败:', error);
      setState(prev => ({ ...prev, error: '搜索失败，请稍后重试' }));
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchPosts(state.searchQuery);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [state.searchQuery, searchPosts]);

  const handlePostClick = (post: Post) => {
    // 这里可以导航到帖子详情页
    console.log('点击帖子:', post.title);
    // 暂时用alert代替
    alert(`查看帖子: ${post.title}\n\n${post.content}`);
  };

  const handleLike = async (postId: string) => {
    try {
      await CommunityService.toggleLikePost(postId);
      // 更新本地状态
      const updatedPosts = state.posts.map(post => 
        post.id === postId ? { ...post, liked: !post.liked } : post
      );
      
      setState(prev => ({ 
        ...prev, 
        posts: updatedPosts,
        filteredPosts: prev.searchQuery.trim() 
          ? prev.filteredPosts.map(post => 
              post.id === postId ? { ...post, liked: !post.liked } : post
            )
          : updatedPosts
      }));
    } catch (error) {
      console.error('点赞失败:', error);
      setState(prev => ({ ...prev, error: '操作失败，请稍后重试' }));
    }
  };

  if (state.loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          加载中...
        </Typography>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="error">
          {state.error}
        </Typography>
        <Button 
          variant="outlined" 
          onClick={fetchPosts}
          sx={{ mt: 2 }}
        >
          重试
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        社区广场
      </Typography>
      
      <TextField
        fullWidth
        placeholder="搜索帖子、标签或内容..."
        value={state.searchQuery}
        onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4 }}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        共 {state.filteredPosts.length} 个帖子
      </Typography>

      {state.filteredPosts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            {state.searchQuery ? '没有找到相关帖子' : '暂无帖子'}
          </Typography>
          {state.searchQuery && (
            <Button 
              variant="outlined" 
              onClick={() => setState(prev => ({ ...prev, searchQuery: '' }))}
              sx={{ mt: 2 }}
            >
              清除搜索
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {state.filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostClick={handlePostClick}
              onLike={handleLike}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Community;