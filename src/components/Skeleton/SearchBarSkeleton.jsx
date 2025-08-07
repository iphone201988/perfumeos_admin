// src/components/Skeleton/SearchBarSkeleton.jsx
import React from 'react';

const SearchBarSkeleton = () => {
  return (
    <div className="flex gap-[16px] flex-wrap max-sm:gap-[8px] max-sm:w-full">
      {/* Search Input Skeleton */}
      <div className="flex bg-gray-200 px-[10px] py-[8px] rounded-[20px] gap-[8px] items-center max-sm:flex-1 max-sm:min-w-0 animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded flex-shrink-0"></div>
        <div className="h-4 bg-gray-300 rounded w-32 max-sm:w-20"></div>
      </div>
      
      {/* Sort Dropdown Skeleton */}
      <div className="flex bg-gray-200 px-[10px] py-[8px] rounded-[20px] gap-[8px] items-center max-sm:flex-shrink-0 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-16 max-sm:w-10"></div>
        <div className="h-4 bg-gray-300 rounded w-20 max-sm:w-16"></div>
      </div>
    </div>
  );
};

export default SearchBarSkeleton;
