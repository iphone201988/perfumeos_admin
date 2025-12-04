// src/components/ManageLevelQuiz/QuestionList.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import edit_icon from '../../assets/icons/edit-icon.svg';
import delete_icon from '../../assets/icons/delete-icon.svg';

const QuestionList = ({
  questions,
  selectedQuiz,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-[20px] font-bold text-[#352AA4]">
              {selectedQuiz ? 'Questions' : 'Select a Quiz'}
            </h2>
            {selectedQuiz && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedQuiz.title} • {total || questions.length} question(s)
              </p>
            )}
          </div>
          {selectedQuiz && (
            <button
              onClick={onAddQuestion}
              className="bg-[#352AA4] text-white px-4 py-2 rounded-full hover:bg-[#2a2183] transition-all font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          )}
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="overflow-y-auto p-6 pt-4"
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        {!selectedQuiz ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">Select a quiz</p>
            <p className="text-sm text-gray-400 mt-1">to view questions</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#352AA4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No questions yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Question" to create one</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question._id}
                  className="bg-white rounded-xl p-5 border-2 border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#FF6B9D] text-white text-sm font-bold px-2.5 py-1 rounded">
                          Q{question.questionNo}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-3">{question.question}</h3>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {question.options?.map((option, idx) => (
                          <div
                            key={idx}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              option === question.correctAnswer
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            <span className="font-bold mr-1">{String.fromCharCode(65 + idx)}.</span>
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditQuestion(question)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit question"
                      >
                        <img src={edit_icon} alt="Edit" className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDeleteQuestion(question)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete question"
                      >
                        <img src={delete_icon} alt="Delete" className="w-5 h-5" />
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

            {!hasMore && questions.length > 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                All questions loaded
              </div>
            )}

            {questions.length > 0 && (
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-green-100 border border-green-300"></span>
                  <span className="text-xs text-gray-600">Correct Answer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></span>
                  <span className="text-xs text-gray-600">Wrong Options</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionList;
