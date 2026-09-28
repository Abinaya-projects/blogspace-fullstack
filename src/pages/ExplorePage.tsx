import React, { useState, useEffect, useCallback } from 'react';
import { Post, CATEGORIES, CategoryType } from '../types';
import { api } from '../services/api';
import { BlogCard } from '../components/blog/BlogCard';
import { BlogCardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

interface ExplorePageProps {
  initialFilter?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ initialFilter, onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'comments'>('newest');
  const [totalCount, setTotalCount] = useState(0);

  // Handle initial filter like "category:Design"
  useEffect(() => {
    if (initialFilter && initialFilter.startsWith('category:')) {
      const cat = initialFilter.replace('category:', '') as CategoryType;
      if (CATEGORIES.includes(cat)) {
        setSelectedCategory(cat);
      }
    }
  }, [initialFilter]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.posts.getAll({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchTerm.trim() ? searchTerm.trim() : undefined,
        sort: sortOption,
        limit: 30,
      });

      if (res.success) {
        setPosts(res.posts);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Failed to query posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchTerm, sortOption]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortOption('newest');
  };

  const isFiltered = searchTerm !== '' || selectedCategory !== 'All' || sortOption !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Articles
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          Discover original perspectives, technical deep dives, and creative essays across the community.
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, keyword, or author..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="pl-8 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="comments">Most Discussed</option>
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Interactive Segmented Category Filter Tabs */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Metrics */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <span className="font-semibold text-slate-900 tabular-nums">{posts.length}</span> of{' '}
          <span className="font-semibold text-slate-900 tabular-nums">{totalCount}</span> articles
        </span>
        {selectedCategory !== 'All' && (
          <span className="font-medium text-indigo-600">Category: {selectedCategory}</span>
        )}
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard
              key={post._id}
              post={post}
              onReadMore={(id) => onNavigate('post-detail', id)}
              onSelectCategory={(cat) => setSelectedCategory(cat as CategoryType)}
              onSelectAuthor={(authorId) => onNavigate('profile', authorId)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No articles found"
          description="We couldn't find any articles matching your search query or selected category filter."
          actionText="Clear all filters"
          onAction={clearFilters}
        />
      )}
    </div>
  );
};
