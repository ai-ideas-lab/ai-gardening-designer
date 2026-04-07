export interface User {
  id: string;
  name: string;
  avatar: string;
  joinedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  likes: number;
  comments: number;
  liked: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  postId: string;
}