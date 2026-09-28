import {
  AuthResponse,
  PaginatedPostsResponse,
  Post,
  Comment,
  User,
  DashboardStats,
} from '../types';

const API_BASE = '/api';

const getHeaders = (hasBody: boolean = true): HeadersInit => {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('blogspace_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  auth: {
    async register(payload: { name: string; email: string; password: string; confirmPassword?: string }): Promise<AuthResponse> {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse<AuthResponse>(res);
    },

    async login(payload: { email: string; password: string }): Promise<AuthResponse> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse<AuthResponse>(res);
    },

    async getMe(): Promise<{ success: boolean; user: User }> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(false),
      });
      return handleResponse<{ success: boolean; user: User }>(res);
    },
  },

  // Posts
  posts: {
    async getAll(params: {
      category?: string;
      search?: string;
      author?: string;
      sort?: string;
      page?: number;
      limit?: number;
    } = {}): Promise<PaginatedPostsResponse> {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') query.set('category', params.category);
      if (params.search) query.set('search', params.search);
      if (params.author) query.set('author', params.author);
      if (params.sort) query.set('sort', params.sort);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));

      const res = await fetch(`${API_BASE}/posts?${query.toString()}`, {
        headers: getHeaders(false),
      });
      return handleResponse<PaginatedPostsResponse>(res);
    },

    async getById(id: string): Promise<{ success: boolean; post: Post }> {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        headers: getHeaders(false),
      });
      return handleResponse<{ success: boolean; post: Post }>(res);
    },

    async create(postData: { title: string; content: string; category: string; image?: string }): Promise<{ success: boolean; message: string; post: Post }> {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(postData),
      });
      return handleResponse<{ success: boolean; message: string; post: Post }>(res);
    },

    async update(id: string, postData: Partial<{ title: string; content: string; category: string; image?: string }>): Promise<{ success: boolean; message: string; post: Post }> {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(postData),
      });
      return handleResponse<{ success: boolean; message: string; post: Post }>(res);
    },

    async delete(id: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(false),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
  },

  // Comments
  comments: {
    async getByPost(postId: string): Promise<{ success: boolean; comments: Comment[] }> {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        headers: getHeaders(false),
      });
      return handleResponse<{ success: boolean; comments: Comment[] }>(res);
    },

    async create(postId: string, content: string): Promise<{ success: boolean; message: string; comment: Comment }> {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content }),
      });
      return handleResponse<{ success: boolean; message: string; comment: Comment }>(res);
    },

    async update(commentId: string, content: string): Promise<{ success: boolean; message: string; comment: Comment }> {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ content }),
      });
      return handleResponse<{ success: boolean; message: string; comment: Comment }>(res);
    },

    async delete(commentId: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getHeaders(false),
      });
      return handleResponse<{ success: boolean; message: string }>(res);
    },
  },

  // Users
  users: {
    async getProfile(id: string): Promise<{ success: boolean; user: User; totalPosts: number; posts: Post[] }> {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        headers: getHeaders(false),
      });
      return handleResponse<{ success: boolean; user: User; totalPosts: number; posts: Post[] }>(res);
    },

    async updateProfile(id: string, data: { name?: string; bio?: string; avatar?: string }): Promise<{ success: boolean; message: string; user: User }> {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string; user: User }>(res);
    },

    async getDashboardStats(): Promise<{ success: boolean; stats: DashboardStats }> {
      const res = await fetch(`${API_BASE}/users/stats/dashboard`, {
        headers: getHeaders(false),
      });
      return handleResponse<{ success: boolean; stats: DashboardStats }>(res);
    },
  },
};
