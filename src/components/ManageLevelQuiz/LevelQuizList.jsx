// src/components/ManageLevelQuiz/LevelQuizList.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import edit_icon from '../../assets/icons/edit-icon.svg';
import delete_icon from '../../assets/icons/delete-icon.svg';

const LevelQuizList = ({
  quizzes,
  selectedCategory,
  selectedQuiz,
  onSelectQuiz,
  onAddQuiz,
  onEditQuiz,
  onDeleteQuiz,
  isLoading,
  isFetching,
  hasMore,
  onLoadMore,
  total
}) => {
  const scrollContainerRef = useRef(null);
  const observerTarget = useRef(null);

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
      <div className="p-6 border-b border-white/50">
        {/* <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-[20px] font-bold text-[#352AA4]">
              {selectedCategory ? 'Level Quizzes' : 'Select a Category'}
            </h2>
            {selectedCategory && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedCategory.name}
              </p>
            )}
          </div>
           <span className="bg-[#352AA4] text-white px-3 py-1 rounded-full text-sm font-medium">
            {total || quizzes.length}
          </span> */}
          {/* {selectedCategory && (
            <button
              onClick={onAddQuiz}
              className="bg-[#352AA4] text-white px-4 py-2 rounded-full hover:bg-[#2a2183] transition-all font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Quiz
            </button>
          )} */}
        {/* </div> */}
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-y-auto p-6 pt-4"
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        {!selectedCategory ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg">Select a category</p>
            <p className="text-sm text-gray-400 mt-1">to view quizzes</p>
          </div>
        ) : (isLoading || (isFetching && quizzes.length ===0  )) ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#352AA4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No quizzes yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Quiz" to create one</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className={`bg-white rounded-xl p-4 cursor-pointer transition-all ${selectedQuiz?._id === quiz._id
                      ? 'border-2 border-[#352AA4] shadow-md'
                      : 'border-2 border-transparent hover:border-gray-300'
                    }`}
                  onClick={() => onSelectQuiz(quiz)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#4896FF] text-white text-xs font-bold px-2 py-1 rounded">
                          Quiz {quiz.quizNo}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ({quiz.questions?.length || 0} questions)
                        </span>
                        <span className="text-gray-500 text-xs">
                          {quiz.isPromotionQuiz ? 'Promotion Quiz' : 'Normal Quiz'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditQuiz(quiz);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit quiz"
                      >
                        <img src={edit_icon} alt="Edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteQuiz(quiz);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete quiz"
                      >
                        <img src={delete_icon} alt="Delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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

            {!hasMore && quizzes.length > 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                All quizzes loaded
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LevelQuizList;
