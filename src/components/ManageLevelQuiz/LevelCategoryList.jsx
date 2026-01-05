// src/components/ManageLevelQuiz/LevelCategoryList.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import edit_icon from '../../assets/icons/edit-icon.svg';
import delete_icon from '../../assets/icons/delete-icon.svg';

const LevelCategoryList = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  isLoading,
  isFetching,
  hasMore,
  onLoadMore,
  total
}) => {
  const scrollContainerRef = useRef(null);
  const observerTarget = useRef(null);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !isFetching) {
      onLoadMore();
    }
  }, [hasMore, isFetching, onLoadMore]);

  useEffect(() => {
    const element = observerTarget.current;
    const option = {
      root: scrollContainerRef.current,
      rootMargin: '20px',
      threshold: 0
    };

    const observer = new IntersectionObserver(handleObserver, option);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  return (
    <div className="bg-gradient-to-br from-[#E1F8F8] to-[#D4E8F8] rounded-[30px] shadow-lg overflow-hidden">
      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto p-6 pt-4"
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#352AA4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No categories yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Category" to create one</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className={`bg-white rounded-xl p-4 cursor-pointer transition-all ${selectedCategory?._id === category._id
                      ? 'border-2 border-[#352AA4] shadow-md'
                      : 'border-2 border-transparent hover:border-gray-300'
                    }`}
                  onClick={() => onSelectCategory(category)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#352AA4] text-white text-xs font-bold px-2 py-1 rounded">
                          Level {category.levelNo}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ({category.levelQuizId?.length || 0} quizzes)
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800">{category.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCategory(category);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <img src={edit_icon} alt="Edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(category);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <img src={delete_icon} alt="Delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-4">
                {isFetching ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 border-2 border-[#352AA4] border-t-transparent rounded-full animate-spin"></div>
                    Loading more...
                  </div>
                ) : (
                  <button
                    onClick={onLoadMore}
                    className="text-sm text-[#352AA4] hover:underline font-medium"
                  >
                    Load More
                  </button>
                )}
              </div>
            )}

            {/* End of List Indicator */}
            {!hasMore && categories.length > 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                All categories loaded
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LevelCategoryList;
