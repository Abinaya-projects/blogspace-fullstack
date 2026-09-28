import React from 'react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
  onClick?: () => void;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '', onClick }) => {
  if (onClick) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`text-xs font-semibold tracking-wider uppercase text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none ${className}`}
      >
        {category}
      </button>
    );
  }

  return (
    <span className={`text-xs font-semibold tracking-wider uppercase text-indigo-600 ${className}`}>
      {category}
    </span>
  );
};
