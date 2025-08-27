import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1 || !currentPage) {
    return null;
  }
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 1; 
    const range = [];
    const rangeWithDots = [];
    range.push(1);
    for (let i = Math.max(2, safePage - delta); i <= Math.min(totalPages - 1, safePage + delta); i++) {
      range.push(i);
    }
    if (totalPages > 1) {
      range.push(totalPages);
    }
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);
    let previous = 0;
    for (const page of uniqueRange) {
      if (page - previous > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      previous = page;
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages && page !== safePage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-600 max-md:hidden">
        Showing page {safePage} of {totalPages}
      </div>

      <nav className="inline-flex gap-1">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(safePage - 1)}
          disabled={safePage === 1}
          aria-label="Go to previous page"
          className={`px-3 py-1 rounded-[4px] text-sm ${
            safePage === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-white text-[#352AA4] cursor-pointer hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page, index) =>
          page === '...' ? (
            <span
              key={`${page}-${index}`}
              className="px-3 py-1 text-sm text-gray-500 cursor-default"
            >
              {page}
            </span>
          ) : (
            <button
              key={`${page}-${index}`}
              onClick={() => handlePageChange(page)}
              disabled={page === safePage}
              aria-current={page === safePage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
              className={`px-3 py-1 rounded-[4px] text-sm cursor-pointer min-w-[32px] ${
                page === safePage
                  ? 'bg-[#352AA4] text-white'
                  : 'bg-white text-[#352AA4] hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(safePage + 1)}
          disabled={safePage === totalPages}
          aria-label="Go to next page"
          className={`px-3 py-1 rounded-[4px] text-sm ${
            safePage === totalPages
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-white text-[#352AA4] cursor-pointer hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;