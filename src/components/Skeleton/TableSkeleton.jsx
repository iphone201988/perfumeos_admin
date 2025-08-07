// src/components/Skeleton/TableSkeleton.jsx
import React from 'react';

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="overflow-x-auto mt-[24px] max-sm:mt-[16px]">
      <table className="min-w-full">
        {/* Header Skeleton */}
        <thead className="text-[#352AA4] text-[14px] font-medium max-sm:text-[12px]">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-4 py-3 max-lg:p-[12px]">
                <div className="h-4 bg-gray-200 rounded animate-pulse max-sm:h-3"></div>
              </th>
            ))}
            <th className="px-4 py-3 text-right max-lg:p-[12px]">
              <div className="h-4 bg-gray-200 rounded animate-pulse max-sm:h-3 ml-auto w-16"></div>
            </th>
          </tr>
        </thead>

        {/* Body Skeleton */}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-[rgba(21,201,201,0.50)]">
              {/* Serial Number */}
              <td className="px-4 py-6 max-lg:p-[12px] max-sm:px-2 max-sm:py-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-8 max-sm:h-3 max-sm:w-6"></div>
              </td>

              {/* User with Image */}
              <td className="px-4 py-6 max-lg:p-[12px] max-sm:px-2 max-sm:py-4">
                <div className="flex items-center gap-3 max-sm:gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse max-sm:w-8 max-sm:h-8"></div>
                  <div className="flex flex-col gap-1 max-sm:min-w-0">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24 max-sm:h-3 max-sm:w-20"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32 sm:hidden max-sm:w-24"></div>
                  </div>
                </div>
              </td>

              {/* Email (Hidden on mobile) */}
              <td className="px-4 py-6 max-lg:p-[12px] max-sm:hidden">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
              </td>

              {/* Status */}
              <td className="px-4 py-6 max-lg:p-[12px] max-sm:px-2 max-sm:py-4">
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16 max-sm:h-5 max-sm:w-12"></div>
              </td>

              {/* Joined Date (Hidden on mobile) */}
              <td className="px-4 py-6 max-lg:p-[12px] max-sm:hidden">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </td>

              {/* Actions */}
              <td className="px-4 py-6 max-lg:p-[12px] text-right max-sm:px-2 max-sm:py-4">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse ml-auto max-sm:h-5 max-sm:w-5"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
