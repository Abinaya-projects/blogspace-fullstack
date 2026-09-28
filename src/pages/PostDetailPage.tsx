import React, { useState, useEffect, useCallback } from 'react';
import { Post, Comment } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CategoryBadge } from '../components/blog/CategoryBadge';
import { CommentItem } from '../components/blog/CommentItem';
import { PostDetailSkeleton } from '../components/common/LoadingSkeleton';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MessageSquare,
  Send,
  BookOpen,
  Calendar,
  Clock,
  User as UserIcon,
} from 'lucide-react';

interface PostDetailPageProps {
  postId: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({ postId, onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadPostAndComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.posts.getById(postId),
        api.comments.getByPost(postId),
      ]);

      if (postRes.success) {
        setPost(postRes.post);
      }
      if (commentsRes.success) {
        setComments(commentsRes.comments);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load blog post.');
    } finally {
      setIsLoading(false);
    }
  }, [postId, toast]);

  useEffect(() => {
    loadPostAndComments();
  }, [loadPostAndComments]);

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Article not found</h2>
        <p className="text-sm text-slate-600">The article you requested might have been deleted or is unavailable.</p>
        <button
          onClick={() => onNavigate('explore')}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  const authorId = typeof post.author === 'object' && post.author ? post.author._id : String(post.author);
  const authorName = typeof post.author === 'object' && post.author ? post.author.name : 'Unknown Author';
  const authorAvatar = typeof post.author === 'object' && post.author ? post.author.avatar : undefined;
  const authorBio = typeof post.author === 'object' && post.author ? post.author.bio : undefined;

  const isOwner = user && user._id === authorId;

  // Reading time calculation ~200 words per minute
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDeletePost = async () => {
    setIsDeletingPost(true);
    try {
      const res = await api.posts.delete(post._id);
      if (res.success) {
        toast.success('Article deleted successfully.');
        setShowDeleteModal(false);
        onNavigate('explore');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete article.');
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (!user) {
      toast.info('Please log in to join the conversation.');
      onNavigate('login');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await api.comments.create(post._id, newCommentText.trim());
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setNewCommentText('');
        toast.success('Comment posted!');
        setPost((prev) => (prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string, newContent: string) => {
    try {
      const res = await api.comments.update(commentId, newContent);
      if (res.success && res.comment) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, content: newContent, updatedAt: new Date().toISOString() } : c))
        );
        toast.success('Comment updated.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await api.comments.delete(commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success('Comment deleted.');
        setPost((prev) => (prev ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) } : prev));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete comment.');
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button & Owner Actions Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('explore')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Articles</span>
        </button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('edit-post', post._id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Post</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Post Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CategoryBadge category={post.category} />
          <span aria-hidden="true" className="text-slate-300">·</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{readingTime} min read</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
          {post.title}
        </h1>

        {/* Author meta row */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('profile', authorId)}
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`;
                }}
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {authorName}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <time dateTime={post.createdAt}>{formattedDate}</time>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.image && !imageError && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-100 max-h-[460px]">
          <img
            src={post.image}
            alt={post.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-slate prose-lg max-w-none text-slate-800 leading-relaxed font-normal space-y-6">
        {post.content.split('\n\n').map((paragraph, index) => {
          const trimmed = paragraph.trim();
          if (!trimmed) return null;

          // Markdown headers
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={index} className="text-xl font-bold text-slate-900 mt-8 mb-3">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={index} className="text-2xl font-bold text-slate-900 mt-10 mb-4">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }

          // Markdown blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={index} className="border-l-4 border-indigo-500 pl-4 py-1 italic text-slate-700 my-6 bg-indigo-50/30 rounded-r-lg">
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }

          // Markdown code blocks
          if (trimmed.startsWith('```')) {
            const cleanCode = trimmed.replace(/```[a-z]*/g, '').trim();
            return (
              <pre key={index} className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto my-6">
                <code>{cleanCode}</code>
              </pre>
            );
          }

          return (
            <p key={index} className="text-base sm:text-lg leading-relaxed text-slate-700">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Author Bio Card */}
      <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <UserIcon className="w-7 h-7" />
          </div>
        )}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">Written by {authorName}</h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {authorBio || 'Author and creative thinker on BlogSpace.'}
          </p>
          <button
            onClick={() => onNavigate('profile', authorId)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 pt-1"
          >
            View full profile and more articles →
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <section className="pt-10 border-t border-slate-200 space-y-8">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">
            Responses ({comments.length})
          </h3>
        </div>

        {/* Comment Input Form */}
        {user ? (
          <form onSubmit={handleAddComment} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 mb-1">
              <span className="font-semibold text-slate-800">{user.name}</span>
              <span>· Sharing your thoughts</span>
            </div>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="What are your thoughts on this article? Join the discussion..."
              rows={3}
              required
              className="w-full text-sm p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingComment || !newCommentText.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingComment ? 'Posting...' : 'Post Response'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Join the discussion</h4>
              <p className="text-xs text-slate-600 mt-0.5">Log in to leave a comment and interact with the author.</p>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              Log in to Comment
            </button>
          </div>
        )}

        {/* Comments List */}
        <div className="divide-y divide-slate-100">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUser={user}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500 py-6 text-center italic">
              No comments yet. Be the first to share your thoughts on this story!
            </p>
          )}
        </div>
      </section>

      {/* Delete Post Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Blog Post"
        message="Are you sure you want to permanently delete this post? All reader comments on this post will also be deleted."
        confirmText="Delete Article"
        isDanger={true}
        isLoading={isDeletingPost}
        onConfirm={handleDeletePost}
        onCancel={() => setShowDeleteModal(false)}
      />
    </article>
  );
};
