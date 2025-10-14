import React, { useState } from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState('');

  if (!totalPages || totalPages <= 1 || !currentPage) {
    return null;
  }
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  const getVisiblePages = () => {
    const maxVisible = 7; // Maximum number of page buttons to show (excluding dots)
    
    // If total pages are less than or equal to maxVisible, show all pages
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const sidePages = 2; // Number of pages to show on each side of current page

    // Always show first page
    pages.push(1);

    if (safePage <= 4) {
      // Near the start: 1 2 3 4 5 ... last
      for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (safePage >= totalPages - 3) {
      // Near the end: 1 ... last-4 last-3 last-2 last-1 last
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        if (i > 1) pages.push(i);
      }
    } else {
      // In the middle: 1 ... current-1 current current+1 ... last
      pages.push('...');
      
      for (let i = safePage - 1; i <= safePage + 1; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages && page !== safePage) {
      onPageChange(page);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setInputPage(value);
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages && pageNum !== safePage) {
      onPageChange(pageNum);
      setInputPage('');
    } else if (pageNum === safePage) {
      setInputPage('');
    } else if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      // Invalid page number, clear input
      setInputPage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    } else if (e.key === 'Escape') {
      setInputPage('');
    }
  };

  return (
    <div className="flex items-center justify-between mt-6 gap-4 max-md:flex-col">
      <div className="text-sm text-gray-600 max-md:hidden">
        Showing page {safePage} of {totalPages}
      </div>

      <nav className="inline-flex gap-1 flex-wrap items-center justify-center">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(safePage - 1)}
          disabled={safePage === 1}
          aria-label="Go to previous page"
          className={`px-3 py-1 rounded-[4px] text-sm transition-colors ${
            safePage === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-white text-[#352AA4] cursor-pointer hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {"<"}
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page, index) =>
          page === '...' ? (
            <span
              key={`dots-${index}`}
              className="px-3 py-1 text-sm text-gray-500 cursor-default select-none"
            >
              {page}
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={page === safePage}
              aria-current={page === safePage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
              className={`px-3 py-1 rounded-[4px] text-sm min-w-[32px] transition-colors ${
                page === safePage
                  ? 'bg-[#352AA4] text-white cursor-default'
                  : 'bg-white text-[#352AA4] hover:bg-gray-50 border border-gray-300 cursor-pointer'
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
          className={`px-3 py-1 rounded-[4px] text-sm transition-colors ${
            safePage === totalPages
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-white text-[#352AA4] cursor-pointer hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {">"}
        </button>
      </nav>

      {/* Go to Page Input */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 whitespace-nowrap">Go to:</span>
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Page"
          aria-label="Go to page number"
          maxLength={totalPages.toString().length}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-[4px] text-center focus:outline-none focus:ring-1 focus:ring-[#352AA4] focus:border-[#352AA4] transition-all"
        />
        <button
          onClick={handleGoToPage}
          disabled={!inputPage}
          aria-label="Navigate to entered page"
          className={`px-3 py-1 rounded-[4px] text-sm whitespace-nowrap transition-colors ${
            !inputPage
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#352AA4] text-white cursor-pointer hover:bg-[#2a2183]'
          }`}
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default Pagination;
