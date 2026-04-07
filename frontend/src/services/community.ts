import type { Post, User, Comment } from '../types/community';

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: '1',
    name: '园艺新手小明',
    avatar: 'https://via.placeholder.com/40/4CAF50/FFFFFF?text=明',
    joinedAt: '2026-03-15',
  },
  {
    id: '2',
    name: '绿植达人李姐',
    avatar: 'https://via.placeholder.com/40/2196F3/FFFFFF?text=李',
    joinedAt: '2026-02-20',
  },
  {
    id: '3',
    name: '多肉爱好者王师傅',
    avatar: 'https://via.placeholder.com/40/FF9800/FFFFFF?text=王',
    joinedAt: '2026-01-10',
  },
];

// 模拟帖子数据
export const mockPosts: Post[] = [
  {
    id: '1',
    title: '我的阳台小花园改造记录',
    content: '经过三个月的努力，终于把原本荒废的阳台改造成了一个小花园。从选择植物到布局设计，每一步都充满了挑战和乐趣。分享一下我的经验...',
    author: mockUsers[0],
    createdAt: '2026-04-01T10:30:00Z',
    updatedAt: '2026-04-01T10:30:00Z',
    tags: ['阳台改造', '新手分享', '多肉植物'],
    likes: 15,
    comments: 8,
    liked: false,
  },
  {
    id: '2',
    title: '春季多肉植物养护要点',
    content: '春天到了，多肉植物开始进入生长期。这时候养护非常重要，分享一下我总结的几个要点：1. 光照管理 2. 浇水频率 3. 施肥建议...',
    author: mockUsers[1],
    createdAt: '2026-04-02T14:20:00Z',
    updatedAt: '2026-04-02T14:20:00Z',
    tags: ['多肉植物', '春季养护', '养护技巧'],
    likes: 23,
    comments: 12,
    liked: true,
  },
  {
    id: '3',
    title: '室内植物选择指南',
    content: '很多朋友想在家里养植物，但不知道选什么。根据我的经验，推荐几种适合室内养的植物：绿萝、吊兰、虎皮兰等...',
    author: mockUsers[2],
    createdAt: '2026-04-03T09:15:00Z',
    updatedAt: '2026-04-03T09:15:00Z',
    tags: ['室内植物', '植物选择', '新手推荐'],
    likes: 18,
    comments: 6,
    liked: false,
  },
];

// 模拟评论数据
export const mockComments: Comment[] = [
  {
    id: '1',
    content: '太棒了！你的阳台改造很有创意，我也想试试。',
    author: mockUsers[1],
    createdAt: '2026-04-01T11:00:00Z',
    postId: '1',
  },
  {
    id: '2',
    content: '请问用的什么土啊？我也是新手，正在学习。',
    author: mockUsers[2],
    createdAt: '2026-04-01T11:30:00Z',
    postId: '1',
  },
  {
    id: '3',
    content: '分享得很详细，对新手很有帮助！',
    author: mockUsers[0],
    createdAt: '2026-04-02T15:00:00Z',
    postId: '2',
  },
];

// 社区服务
export class CommunityService {
  static async getPosts(): Promise<Post[]> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockPosts;
  }

  static async getPostById(id: string): Promise<Post | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockPosts.find(post => post.id === id) || null;
  }

  static async getCommentsByPostId(postId: string): Promise<Comment[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockComments.filter(comment => comment.postId === postId);
  }

  static async toggleLikePost(postId: string): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const post = mockPosts.find(p => p.id === postId);
    if (post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
    }
    return post!;
  }

  static async searchPosts(query: string): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!query.trim()) return mockPosts;
    
    return mockPosts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  static async getPostsByTag(tag: string): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockPosts.filter(post => post.tags.includes(tag));
  }
}