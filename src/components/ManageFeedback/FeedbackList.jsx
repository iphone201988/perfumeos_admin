import React from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) {
        return `${BASE_URL}${url}`;
    }
    return url;
};

const FeedbackList = ({
    feedbacks = [],
    onMarkRead,
    onDelete,
    isLoading,
    isFetching,
    hasMore,
    onLoadMore,
    total,
}) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <svg
                key={index}
                className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    if (feedbacks.length === 0 && !isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Feedback Found</h3>
                <p className="text-gray-500">There are no feedback entries matching your filter.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#352AA4] to-[#5c4ec9] rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Feedback List</h2>
                            <p className="text-sm text-gray-500">{total} feedback{total !== 1 ? 's' : ''} total</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {feedbacks.map((feedback) => (
                    <div
                        key={feedback._id}
                        className={`p-6 transition-all duration-200 hover:bg-gray-50 ${!feedback.isRead ? 'bg-blue-50/30 border-l-4 border-l-[#352AA4]' : ''
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* User Avatar */}
                            <div className="flex-shrink-0">
                                {feedback.userId?.profileImage ? (
                                    <img
                                        src={getImageUrl(feedback.userId.profileImage)}
                                        alt={feedback.userId.email}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#352AA4] to-[#5c4ec9] flex items-center justify-center ring-2 ring-white shadow-md">
                                        <span className="text-white font-semibold text-lg">
                                            {feedback.userId?.email?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Feedback Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                                {feedback.userId?.email || 'Unknown User'}
                                            </h3>
                                            {!feedback.isRead && (
                                                <span className="px-2 py-0.5 bg-[#352AA4] text-white text-xs font-medium rounded-full">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mb-2">
                                            {renderStars(feedback.rating)}
                                            <span className="ml-2 text-sm text-gray-500">({feedback.rating}/5)</span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{feedback.message}</p>
                                        <div className="mt-3 text-xs text-gray-400">
                                            {formatDate(feedback.createdAt)}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!feedback.isRead && (
                                            <button
                                                onClick={() => onMarkRead(feedback._id)}
                                                className="p-2 text-[#352AA4] hover:bg-[#352AA4]/10 rounded-lg transition-all duration-200 group"
                                                title="Mark as Read"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDelete(feedback)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                            title="Delete Feedback"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="p-6 border-t border-gray-100">
                    <button
                        onClick={onLoadMore}
                        disabled={isFetching}
                        className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isFetching ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Load More
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackList;
