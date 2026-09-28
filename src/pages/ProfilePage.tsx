import React, { useState, useEffect, useCallback } from 'react';
import { User, Post } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BlogCard } from '../components/blog/BlogCard';
import { BlogCardSkeleton } from '../components/common/LoadingSkeleton';
import {
  Calendar,
  Mail,
  Edit2,
  Check,
  X,
  User as UserIcon,
  BookOpen,
} from 'lucide-react';

interface ProfilePageProps {
  userId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId, onNavigate }) => {
  const { user: currentUser, updateUser } = useAuth();
  const { toast } = useToast();

  const targetUserId = userId || currentUser?._id;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [totalPostsCount, setTotalPostsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const isSelf = currentUser && targetUserId === currentUser._id;

  const loadUserProfile = useCallback(async () => {
    if (!targetUserId) return;
    setIsLoading(true);
    try {
      const res = await api.users.getProfile(targetUserId);
      if (res.success && res.user) {
        setProfileUser(res.user);
        setUserPosts(res.posts);
        setTotalPostsCount(res.totalPosts);
        setEditName(res.user.name);
        setEditBio(res.user.bio || '');
        setEditAvatar(res.user.avatar || '');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load user profile.');
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, toast]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;

    if (!editName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await api.users.updateProfile(profileUser._id, {
        name: editName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar.trim(),
      });

      if (res.success && res.user) {
        setProfileUser(res.user);
        if (isSelf) {
          updateUser(res.user);
        }
        setIsEditingProfile(false);
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-44 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BlogCardSkeleton />
          <BlogCardSkeleton />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">User Not Found</h2>
        <p className="text-sm text-slate-600">The profile you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  const joinDate = new Date(profileUser.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {profileUser.avatar ? (
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileUser.name)}`;
                }}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl">
                <UserIcon className="w-10 h-10" />
              </div>
            )}

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profileUser.name}
              </h1>
              <p className="text-sm text-slate-600 max-w-lg leading-relaxed">
                {profileUser.bio || 'Author on BlogSpace. Writing stories and sharing insights with the world.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profileUser.email}</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined {joinDate}</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="tabular-nums">{totalPostsCount}</span>
                  <span>{totalPostsCount === 1 ? 'Published Article' : 'Published Articles'}</span>
                </div>
              </div>
            </div>
          </div>

          {isSelf && !isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Inline Edit Profile Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Update Profile Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Bio
              </label>
              <textarea
                rows={2}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Brief description about your background and interests..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                disabled={isUpdating}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Published Posts Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Articles by {profileUser.name}
          </h2>
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {userPosts.length} {userPosts.length === 1 ? 'Story' : 'Stories'}
          </span>
        </div>

        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userPosts.map((post) => (
              <BlogCard
                key={post._id}
                post={post}
                onReadMore={(id) => onNavigate('post-detail', id)}
                onSelectCategory={(cat) => onNavigate('explore', `category:${cat}`)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-600">No articles published by this author yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};
