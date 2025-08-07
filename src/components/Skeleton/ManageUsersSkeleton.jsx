// src/components/Skeleton/ManageUsersSkeleton.jsx
import React from 'react';
import SearchBarSkeleton from './SearchBarSkeleton';
import TableSkeleton from './TableSkeleton';
import PaginationSkeleton from './PaginationSkeleton';

const ManageUsersSkeleton = () => {
  return (
    <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px] max-sm:rounded-[20px] max-sm:py-[16px] max-sm:px-[16px]">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6 max-sm:mb-4">
        <div className="flex justify-between items-start max-sm:flex-col max-sm:gap-3">
          <div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-40 max-sm:h-5 max-sm:w-32"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24 mt-2 max-sm:h-2 max-sm:w-20"></div>
          </div>
          
          {/* Search Bar Skeleton */}
          <div className="max-sm:w-full">
            <SearchBarSkeleton />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={5} columns={5} />

      {/* Pagination Skeleton */}
      <PaginationSkeleton />
    </div>
  );
};

export default ManageUsersSkeleton;
