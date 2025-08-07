// src/components/Skeleton/PaginationSkeleton.jsx
import React from 'react';

const PaginationSkeleton = () => {
  return (
    <div className="flex items-center justify-between mt-6 max-sm:mt-4">
      <div className="text-sm text-gray-600 hidden sm:block">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
      </div>

      <nav className="inline-flex items-center gap-1 mx-auto sm:mx-0">
        {/* Previous Button */}
        <div className="px-3 py-2 rounded-md bg-gray-200 animate-pulse">
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
        </div>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-3 py-2 rounded-md bg-gray-200 animate-pulse">
              <div className="h-4 w-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>

        {/* Mobile: current page indicator */}
        <div className="sm:hidden px-3 py-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
        </div>

        {/* Next Button */}
        <div className="px-3 py-2 rounded-md bg-gray-200 animate-pulse">
          <div className="h-4 w-12 bg-gray-300 rounded"></div>
        </div>
      </nav>
    </div>
  );
};

export default PaginationSkeleton;
