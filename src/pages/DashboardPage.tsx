import React, { useState, useEffect, useCallback } from 'react';
import { DashboardStats, Post } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { CategoryBadge } from '../components/blog/CategoryBadge';
import {
  FileText,
  MessageSquare,
  PenSquare,
  Plus,
  Eye,
  Pencil,
  Trash2,
  TrendingUp,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.info('Please log in to access your author dashboard.');
      onNavigate('login');
    }
  }, [user, onNavigate, toast]);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [statsRes, postsRes] = await Promise.all([
        api.users.getDashboardStats(),
        api.posts.getAll({ author: user._id, limit: 50, sort: 'newest' }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      if (postsRes.success) {
        setUserPosts(postsRes.posts);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.posts.delete(postToDelete._id);
      if (res.success) {
        toast.success('Post deleted successfully.');
        setUserPosts((prev) => prev.filter((p) => p._id !== postToDelete._id));
        setStats((prev) =>
          prev ? { ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) } : null
        );
        setPostToDelete(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Author Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Welcome back, <span className="font-semibold text-slate-900">{user.name}</span>. Here's an overview of your publication metrics.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-post')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Articles</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {stats?.totalPosts || userPosts.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Comments Received</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {stats?.totalCommentsReceived ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reader Engagement</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {userPosts.length > 0 ? `${((stats?.totalCommentsReceived || 0) / userPosts.length).toFixed(1)}/post` : '0'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Posts Management Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Manage Your Posts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Edit, view, or remove your published articles.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {userPosts.length} {userPosts.length === 1 ? 'Article' : 'Articles'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading your posts...</p>
          </div>
        ) : userPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4 text-center">Responses</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {userPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <p
                        onClick={() => onNavigate('post-detail', post._id)}
                        className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer truncate"
                      >
                        {post.title}
                      </p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <CategoryBadge category={post.category} />
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span className="tabular-nums font-semibold">{post.commentsCount || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate('post-detail', post._id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View article"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('edit-post', post._id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit article"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPostToDelete(post)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center px-4">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">You haven't written any articles yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Ready to inspire readers? Draft your first article and publish it to the community.
            </p>
            <button
              onClick={() => onNavigate('create-post')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write Your First Post</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(postToDelete)}
        title="Delete Post"
        message={`Are you sure you want to delete "${postToDelete?.title}"? This will permanently delete the post and all associated comments.`}
        confirmText="Delete"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  );
};
