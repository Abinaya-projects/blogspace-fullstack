import React, { useState } from 'react';
import { Comment, User } from '../../types';
import { Pencil, Trash2, Check, X, User as UserIcon } from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface CommentItemProps {
  comment: Comment;
  currentUser: User | null;
  onUpdate: (commentId: string, newContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUser,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorId = typeof comment.author === 'object' && comment.author ? comment.author._id : String(comment.author);
  const authorName = typeof comment.author === 'object' && comment.author ? comment.author.name : 'Author';
  const authorAvatar = typeof comment.author === 'object' && comment.author ? comment.author.avatar : undefined;

  const isOwner = currentUser && currentUser._id === authorId;

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsUpdating(true);
    try {
      await onUpdate(comment._id, editContent.trim());
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment._id);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-5 border-b border-slate-100 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        {/* Author information */}
        <div className="flex items-center gap-3">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`;
              }}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-medium text-xs">
              <UserIcon className="w-4 h-4" />
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-slate-900 leading-tight">
              {authorName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{formattedDate}</span>
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="italic">edited</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditContent(comment.content);
                setIsEditing(true);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              title="Edit comment"
              aria-label="Edit comment"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
              title="Delete comment"
              aria-label="Delete comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Comment Body or Inline Editor */}
      <div className="mt-3 pl-11">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
              placeholder="Edit your comment..."
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isUpdating}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isUpdating || !editContent.trim()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {comment.content}
          </p>
        )}
      </div>

      {/* Confirmation Modal for Comment Deletion */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
