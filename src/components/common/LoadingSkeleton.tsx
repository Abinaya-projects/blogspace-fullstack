import React from 'react';

export const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse">
      <div className="h-52 bg-slate-100" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-slate-100 rounded" />
          <div className="h-3 w-3 bg-slate-100 rounded-full" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-5/6 bg-slate-100 rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-4/6 bg-slate-100 rounded" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
          <div className="h-3 w-12 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
};

export const PostDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-4 w-24 bg-slate-100 rounded" />
      <div className="h-10 w-4/5 bg-slate-100 rounded" />
      <div className="flex items-center gap-4 py-4 border-y border-slate-100">
        <div className="w-10 h-10 rounded-full bg-slate-100" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="h-80 w-full bg-slate-100 rounded-2xl" />
      <div className="space-y-3 pt-4">
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
      </div>
    </div>
  );
};
