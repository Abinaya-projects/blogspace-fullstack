import React, { useEffect, useState } from 'react';
import { Post } from '../types';
import { api } from '../services/api';
import { BlogCard } from '../components/blog/BlogCard';
import { BlogCardSkeleton } from '../components/common/LoadingSkeleton';
import { ArrowRight, Sparkles, Feather, ShieldCheck, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await api.posts.getAll({ limit: 7, sort: 'newest' });
        if (isMounted && res.success && res.posts.length > 0) {
          setFeaturedPost(res.posts[0]);
          setRecentPosts(res.posts.slice(1, 7));
        }
      } catch (err) {
        console.error('Failed to load home posts:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 bg-linear-to-b from-indigo-50/60 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 tracking-wide uppercase bg-indigo-50/80 px-3 py-1 rounded-md border border-indigo-100/60">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Publishing for Creative Minds</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] text-balance">
                Share Your Stories. <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">
                  Inspire the World.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                BlogSpace provides a distraction-free environment for writers, developers, and thinkers.
                Publish thoughtful articles, build an audience, and connect through authentic reader discourse.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate(user ? 'create-post' : 'register')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Feather className="w-4 h-4" />
                  <span>Start Writing</span>
                </button>

                <button
                  onClick={() => onNavigate('explore')}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>Explore Blogs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust & Quality Markers */}
              <div className="pt-8 border-t border-slate-200/60 grid grid-cols-3 gap-6 text-slate-600">
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">100%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Author Ownership</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">&lt;50ms</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Instant Latency</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">Zero Ads</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Pure Reading Experience</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 bg-white">
                <img
                  src="/src/assets/images/hero_creative_workspace_1790610168996.jpg"
                  alt="Minimalist workspace for writers"
                  referrerPolicy="no-referrer"
                  className="w-full h-[380px] object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300 mb-1">
                    Featured Editorial
                  </span>
                  <h2 className="text-lg font-bold leading-tight mb-2">
                    Crafting Clean Architecture in the Modern Cloud
                  </h2>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    Discover how senior engineers balance agility and fault isolation at scale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spotlight Section */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Editorial Choice
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Featured Article</h2>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div
            onClick={() => onNavigate('post-detail', featuredPost._id)}
            className="group cursor-pointer bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-0"
          >
            <div className="md:col-span-7 h-72 md:h-96 relative overflow-hidden bg-slate-100">
              <img
                src={featuredPost.image || '/src/assets/images/post_tech_ai_1790610180057.jpg'}
                alt={featuredPost.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
            <div className="md:col-span-5 p-8 md:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-indigo-600 uppercase tracking-wider">
                    {featuredPost.category}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <time dateTime={featuredPost.createdAt}>
                    {new Date(featuredPost.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {featuredPost.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                  {featuredPost.content.replace(/[#*`_>[\]()]/g, '')}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-6">
                <div className="flex items-center gap-2.5">
                  <span className="font-medium text-slate-800">
                    {typeof featuredPost.author === 'object' && featuredPost.author ? featuredPost.author.name : 'Author'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Read full piece</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Fresh Off the Press
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Latest Blog Posts
            </h2>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Explore all articles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <BlogCard
                key={post._id}
                post={post}
                onReadMore={(id) => onNavigate('post-detail', id)}
                onSelectCategory={(cat) => onNavigate('explore', `category:${cat}`)}
                onSelectAuthor={(authorId) => onNavigate('profile', authorId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-600">No blog posts yet. Be the first to share your story!</p>
          </div>
        )}
      </section>

      {/* Why BlogSpace Value Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Platform Manifesto
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              A home for writing that matters, built for authors who care.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              We stripped away the clutter, engagement bait, and invasive tracking. 
              What remains is an elegant reading surface, fast responses, and a respectful community for thoughtful exchanges.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate(user ? 'create-post' : 'register')}
                className="px-6 py-3 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
              >
                Join BlogSpace Today
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
