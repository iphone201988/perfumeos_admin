// src/components/ManageFAQ/FAQList.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import edit_icon from '../../assets/icons/edit-icon.svg';
import delete_icon from '../../assets/icons/delete-icon.svg';

const FAQList = ({
  faqs,
  selectedType,
  onEdit,
  onDelete,
  onToggleStatus,
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

  const getTypeColor = (type) => {
    const colors = {
      'General': 'bg-blue-100 text-blue-700 border-blue-300',
      'Account': 'bg-green-100 text-green-700 border-green-300',
      'Services': 'bg-purple-100 text-purple-700 border-purple-300',
      "Subscription": 'bg-yellow-100 text-yellow-700 border-yellow-300'
    };
    return colors[type] || colors.General;
  };

  return (
    <div className="bg-gradient-to-br from-[#E1F8F8] to-[#D4E8F8] rounded-[30px] shadow-lg overflow-hidden">
      <div className="p-6 border-b border-white/50">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#352AA4]">
            {selectedType} FAQs
          </h2>
          <span className="bg-[#352AA4] text-white px-3 py-1 rounded-full text-sm font-medium">
            {total || faqs.length}
          </span>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="overflow-y-auto p-6 pt-4"
        style={{ maxHeight: 'calc(100vh - 350px)' }}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#352AA4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No FAQs found</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add FAQ" to create one</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq._id}
                  className={`bg-white rounded-xl p-5 border-2 transition-all ${
                    faq.isActive 
                      ? 'border-transparent hover:border-gray-200' 
                      : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-[#352AA4] text-white text-xs font-bold px-2 py-1 rounded">
                          #{faq.order}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(faq.type)}`}>
                          {faq.type}
                        </span>
                        {!faq.isActive && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Question */}
                      <h3 className="font-bold text-gray-800 mb-2 text-lg">
                        Q: {faq.question}
                      </h3>

                      {/* Answer */}
                      <p className="text-gray-600 text-sm leading-relaxed">
                        A: {faq.answer}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>Created: {new Date(faq.createdAt).toLocaleDateString()}</span>
                        {faq.updatedAt !== faq.createdAt && (
                          <span>Updated: {new Date(faq.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onToggleStatus(faq._id, faq.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          faq.isActive 
                            ? 'hover:bg-yellow-50 text-yellow-600' 
                            : 'hover:bg-green-50 text-green-600'
                        }`}
                        title={faq.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {faq.isActive ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => onEdit(faq)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit FAQ"
                      >
                        <img src={edit_icon} alt="Edit" className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(faq)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete FAQ"
                      >
                        <img src={delete_icon} alt="Delete" className="w-5 h-5" />
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
            {!hasMore && faqs.length > 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                All FAQs loaded
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FAQList;
