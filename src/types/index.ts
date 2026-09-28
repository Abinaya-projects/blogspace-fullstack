export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface PostAuthor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  author: PostAuthor | string;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentAuthor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: CommentAuthor | string;
  post: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalPosts: number;
  totalCommentsReceived: number;
  totalCommentsWritten: number;
  recentPosts: Post[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface PaginatedPostsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  posts: Post[];
}

export type CategoryType = 
  | 'All'
  | 'Technology'
  | 'Design'
  | 'Lifestyle'
  | 'Writing'
  | 'Business'
  | 'Programming'
  | 'Science';

export const CATEGORIES: CategoryType[] = [
  'All',
  'Technology',
  'Design',
  'Lifestyle',
  'Writing',
  'Business',
  'Programming',
  'Science',
];
