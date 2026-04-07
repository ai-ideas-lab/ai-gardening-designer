import React from 'react';
import { Card, CardContent, CardMedia, Typography, Avatar, Chip, Box, IconButton, Button } from '@mui/material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Post } from '../types/community';
import { CommunityService } from '../services/community';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffIcon from '@mui/icons-material/ThumbUpOff';
import CommentIcon from '@mui/icons-material/Comment';

interface PostCardProps {
  post: Post;
  onPostClick: (post: Post) => void;
  onLike: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostClick, onLike }) => {
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await CommunityService.toggleLikePost(post.id);
    onLike(post.id);
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
      onClick={() => onPostClick(post)}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar 
            src={post.author.avatar} 
            alt={post.author.name}
            sx={{ width: 48, height: 48 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {post.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="body2" color="text.secondary">
                {post.author.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2, 
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {post.content}
            </Typography>

            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              {post.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size="small" 
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>

            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <IconButton 
                size="small" 
                onClick={handleLike}
                color={post.liked ? 'primary' : 'default'}
              >
                {post.liked ? <ThumbUpIcon /> : <ThumbUpOffIcon />}
              </IconButton>
              <Typography variant="body2" color={post.liked ? 'primary' : 'text.secondary'}>
                {post.likes}
              </Typography>
              
              <IconButton size="small" color="default">
                <CommentIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {post.comments}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostCard;