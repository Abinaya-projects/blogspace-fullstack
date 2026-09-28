import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  PenSquare,
  Image as ImageIcon,
  Eye,
  Edit3,
  X,
  Sparkles,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';

interface CreateEditPostPageProps {
  editPostId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

const PRESET_IMAGES = [
  { label: 'Writing Workspace', url: '/src/assets/images/hero_creative_workspace_1790610168996.jpg' },
  { label: 'Technology & AI', url: '/src/assets/images/post_tech_ai_1790610180057.jpg' },
  { label: 'Design Systems', url: '/src/assets/images/post_design_systems_1790610193082.jpg' },
  { label: 'Lifestyle & Journal', url: '/src/assets/images/post_lifestyle_mindfulness_1790610205164.jpg' },
];

export const CreateEditPostPage: React.FC<CreateEditPostPageProps> = ({ editPostId, onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [customCategory, setCustomCategory] = useState('');
  const [image, setImage] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(editPostId));

  const isEditMode = Boolean(editPostId);

  // Check auth
  useEffect(() => {
    if (!user) {
      toast.info('Please log in to create or edit articles.');
      onNavigate('login');
    }
  }, [user, onNavigate, toast]);

  // Load existing post if in edit mode
  useEffect(() => {
    if (!editPostId) return;

    let isMounted = true;
    async function loadPost() {
      setIsLoading(true);
      try {
        const res = await api.posts.getById(editPostId as string);
        if (isMounted && res.success && res.post) {
          setTitle(res.post.title);
          setContent(res.post.content);
          setImage(res.post.image || '');

          const cat = res.post.category;
          if (CATEGORIES.includes(cat as any)) {
            setCategory(cat);
          } else {
            setCategory('Other');
            setCustomCategory(cat);
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load post for editing.');
        onNavigate('explore');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadPost();
    return () => {
      isMounted = false;
    };
  }, [editPostId, toast, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title for your article.');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write some content for your article.');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category;
    if (!finalCategory) {
      toast.error('Please provide a category.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editPostId) {
        const res = await api.posts.update(editPostId, {
          title: title.trim(),
          content: content.trim(),
          category: finalCategory,
          image: image.trim(),
        });
        if (res.success) {
          toast.success('Post updated successfully!');
          onNavigate('post-detail', editPostId);
        }
      } else {
        const res = await api.posts.create({
          title: title.trim(),
          content: content.trim(),
          category: finalCategory,
          image: image.trim(),
        });
        if (res.success && res.post) {
          toast.success('Your article has been published!');
          onNavigate('post-detail', res.post._id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading post editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(isEditMode && editPostId ? 'post-detail' : 'explore', editPostId)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditMode ? 'Modify and refine your published post.' : 'Share your ideas, research, or tutorials with the world.'}
            </p>
          </div>
        </div>

        {/* View mode toggle: Editor vs Live Preview */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        /* Live Preview Mode */
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {category === 'Other' ? customCategory || 'General' : category}
            </span>
            <span className="text-xs text-slate-400">Preview Mode</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {title || 'Untitled Article'}
          </h1>

          {image && (
            <div className="rounded-xl overflow-hidden max-h-80 bg-slate-100">
              <img
                src={image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
            {content || 'Start typing in the editor to see your article preview here...'}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setActiveTab('edit')}
              className="px-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50"
            >
              Back to Editor
            </button>
          </div>
        </div>
      ) : (
        /* Editor Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Article Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Article Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Designing Micro-Interactions That Delight Users"
              className="w-full px-4 py-3 text-lg font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other (Custom category)</option>
              </select>
            </div>

            {category === 'Other' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Custom Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g., Artificial Intelligence, Philosophy"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Featured Image URL <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg or select preset below"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50"
                  title="Clear image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Presets suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Presets:
              </span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    image === preset.url
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Article Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Article Body <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                Supports Markdown (headers ##, quotes &gt;, code blocks ```)
              </span>
            </div>
            <textarea
              required
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story... You can use ## for section headings, > for quotes, and ``` for code blocks."
              className="w-full p-4 text-sm font-normal text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono sm:font-sans"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate(isEditMode && editPostId ? 'post-detail' : 'explore', editPostId)}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isEditMode ? 'Updating...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <PenSquare className="w-4 h-4" />
                  <span>{isEditMode ? 'Save Changes' : 'Publish Article'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
