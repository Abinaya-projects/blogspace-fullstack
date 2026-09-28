import React, { useState } from 'react';
import { Post } from '../../types';
import { CategoryBadge } from './CategoryBadge';
import { MessageSquare, ArrowRight, User as UserIcon, BookOpen } from 'lucide-react';

interface BlogCardProps {
  post: Post;
  onReadMore: (postId: string) => void;
  onSelectCategory?: (category: string) => void;
  onSelectAuthor?: (authorId: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  post,
  onReadMore,
  onSelectCategory,
  onSelectAuthor,
}) => {
  const [imageError, setImageError] = useState(false);

  const authorName = typeof post.author === 'object' && post.author ? post.author.name : 'Unknown Author';
  const authorAvatar = typeof post.author === 'object' && post.author ? post.author.avatar : undefined;
  const authorId = typeof post.author === 'object' && post.author ? post.author._id : String(post.author);

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Clean plain text excerpt
  const excerpt = post.content
    .replace(/[#*`_>[\]()]/g, '')
    .split('\n')
    .filter((line) => line.trim().length > 0)[0] || post.content;
  const truncatedExcerpt = excerpt.length > 130 ? excerpt.slice(0, 130) + '...' : excerpt;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Featured Image or Styled CSS Fallback */}
      <div
        className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onReadMore(post._id)}
      >
        {post.image && !imageError ? (
          <img
            src={post.image}
            alt={post.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-6 text-slate-400">
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="w-8 h-8 text-indigo-400/80" />
              <span className="text-xs font-medium text-slate-500">{post.category}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Category & Date with middle dot */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
            <CategoryBadge
              category={post.category}
              onClick={onSelectCategory ? () => onSelectCategory(post.category) : undefined}
            />
            <span aria-hidden="true" className="text-slate-300">·</span>
            <time dateTime={post.createdAt} className="font-normal">{formattedDate}</time>
          </div>

          {/* Title */}
          <h3
            onClick={() => onReadMore(post._id)}
            className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug mb-2"
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
            {truncatedExcerpt}
          </p>
        </div>

        {/* Footer info: Author, comments, read more */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
          {/* Author avatar and name */}
          <div
            className="flex items-center gap-2 cursor-pointer group/author"
            onClick={() => onSelectAuthor && onSelectAuthor(authorId)}
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`;
                }}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="font-medium text-slate-700 group-hover/author:text-indigo-600 transition-colors max-w-[110px] truncate">
              {authorName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Comment count */}
            <div className="flex items-center gap-1 text-slate-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="tabular-nums font-medium">{post.commentsCount || 0}</span>
            </div>

            {/* Read More button */}
            <button
              onClick={() => onReadMore(post._id)}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors ml-1 focus:outline-none"
              aria-label={`Read full article: ${post.title}`}
            >
              <span>Read</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
