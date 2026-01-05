// src/pages/ManageFeedback.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
    useGetFeedbackQuery,
    useMarkFeedbackReadMutation,
    useDeleteFeedbackMutation,
} from '../api';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import Loader from '../components/Loader/Loader';
import user_icon from '../assets/user-img.png';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FILTER_OPTIONS = [
    { value: '', label: 'All Feedback' },
    { value: 'false', label: 'Unread' },
    { value: 'true', label: 'Read' },
];

// Message Preview Component with expandable functionality
const MessageCell = ({ message }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 10;
    const isLong = message && message.length > MAX_LENGTH;

    if (!message) return <span className="text-gray-400">No message</span>;

    return (
        <div className="max-w-[200px]">
            {isExpanded ? (
                <div className="relative">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {message}
                    </p>
                    {isLong && (
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-[#352AA4] text-xs font-medium hover:underline mt-1"
                        >
                            Show less
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                        {isLong ? `${message.substring(0, MAX_LENGTH)}...` : message}
                    </p>
                    {isLong && (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="text-[#352AA4] text-xs font-medium hover:underline mt-1"
                        >
                            Read more
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const ManageFeedback = () => {
    const [isReadFilter, setIsReadFilter] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [viewMessage, setViewMessage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // API Hooks
    const { data: feedbackData, isLoading, isFetching, refetch } = useGetFeedbackQuery({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isRead: isReadFilter,
    });

    const [markFeedbackRead, { isLoading: markReadLoading }] = useMarkFeedbackReadMutation();
    const [deleteFeedback, { isLoading: deleteLoading }] = useDeleteFeedbackMutation();

    const rawFeedbacks = feedbackData?.data?.feedback || [];
    const pagination = feedbackData?.data?.pagination || {};
    const total = pagination.totalCount || 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;
    const isOperationLoading = markReadLoading || deleteLoading;

    // Format data for table
    const feedbacks = rawFeedbacks.map((feedback, index) => ({
        ...feedback,
        sno: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
        userEmail: feedback.userId?.email || 'Unknown User',
        firstName: feedback.userId?.firstName || 'Unknown User',
        image: feedback.userId?.profileImage ? `${BASE_URL}${feedback.userId.profileImage}` : user_icon,
        formattedDate: feedback.createdAt
            ? new Date(feedback.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            : '-',
        shortMessage: feedback.message?.length > 100 ? `${feedback.message.slice(0, 100)}...` : feedback.message,
        status: feedback.isRead ? 'Read' : 'Unread',
    }));

    // Table columns
    const columns = [
        { label: '#', accessor: 'sno' },
        {
            label: 'User',
            accessor: 'firstName',
            type: 'imageWithName',
        },
        {
            label: 'Rating',
            accessor: 'rating',
            render: (value) => (
                <div className="flex items-center gap-1">
                    <span className="ml-1 text-sm text-gray-500">({value}/5)</span>
                </div>
            ),
        },
        {
            label: 'Message',
            accessor: 'shortMessage',
            render: (value) => <MessageCell message={value} />,
        },
        {
            label: 'Status',
            accessor: 'status',
            render: (value) => (
                <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${value === 'Read'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-blue-100 text-blue-700 border border-blue-300'
                        }`}
                >
                    {value}
                </span>
            ),
        },
        { label: 'Date', accessor: 'formattedDate' },
    ];

    // Handlers
    const handleMarkRead = async (feedbackId) => {
        try {
            await markFeedbackRead(feedbackId).unwrap();
            toast.success('Feedback marked as read!');
        } catch (error) {
            console.error('Mark read error:', error);
            toast.error(error?.data?.message || 'Failed to mark feedback as read');
        }
    };

    const handleDeleteFeedback = (feedback) => {
        setDeleteConfirmation({
            item: feedback,
            title: 'Delete Feedback',
            message: `Are you sure you want to delete this feedback from "${feedback.userEmail}"?`,
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;

        try {
            await deleteFeedback(deleteConfirmation.item._id).unwrap();
            toast.success('Feedback deleted successfully!');
            setDeleteConfirmation(null);
            if (feedbacks.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error?.data?.message || 'Failed to delete feedback');
        }
    };

    const handleFilterChange = (value) => {
        setIsReadFilter(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewMessage = (feedback) => {
        setViewMessage(feedback);
    };

    if (isLoading) {
        return <Loader message="Loading Feedback..." />;
    }

    return (
        <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
            {/* Operation Loading Overlay */}
            {isOperationLoading && (
                <Loader
                    message={markReadLoading ? 'Marking as read...' : 'Deleting...'}
                    isVisible={true}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-4">
                <div>
                    <h6 className="text-[20px] font-semibold text-[#352AA4]">
                        All Feedback ({total})
                    </h6>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {FILTER_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleFilterChange(option.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isReadFilter === option.value
                                ? 'bg-[#352AA4] text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={feedbacks}
                renderActions={(row) => (
                    <div className="flex items-center gap-2">
                        {/* View Message Button */}
                        <button
                            onClick={() => handleViewMessage(row)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="View Full Message"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        {/* {!row.isRead && (
                            <button
                                onClick={() => handleMarkRead(row._id)}
                                className="p-2 text-[#352AA4] hover:bg-[#352AA4]/10 rounded-lg transition-all duration-200"
                                title="Mark as Read"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        )} */}
                        <button
                            onClick={() => handleDeleteFeedback(row)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Feedback"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Empty State */}
            {feedbacks.length === 0 && !isLoading && (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No feedback found</p>
                    {isReadFilter && (
                        <p className="text-gray-400 text-sm mt-2">
                            Try adjusting your filter criteria
                        </p>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={handleConfirmDelete}
                title={deleteConfirmation?.title}
                message={deleteConfirmation?.message}
                confirmText="Delete"
                cancelText="Cancel"
                confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
            />

            {/* View Message Modal */}
            {viewMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#352AA4] to-[#5c4ec9] p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={viewMessage.image}
                                        alt={viewMessage.userEmail}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                                        onError={(e) => { e.target.src = user_icon; }}
                                    />
                                    <div>
                                        <h3 className="text-white font-semibold">{viewMessage.userEmail}</h3>
                                        <p className="text-white/70 text-sm">{viewMessage.formattedDate}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewMessage(null)}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {/* Rating */}
                            <div className="flex items-center gap-1 mt-4">
                                {Array.from({ length: 5 }, (_, index) => (
                                    <svg
                                        key={index}
                                        className={`w-5 h-5 ${index < viewMessage.rating ? 'text-yellow-400' : 'text-white/30'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="ml-2 text-white/80 text-sm">({viewMessage.rating}/5)</span>
                            </div>
                        </div>
                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            <h4 className="text-gray-500 text-sm font-medium mb-2">Feedback Message</h4>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {viewMessage.message}
                            </p>
                        </div>
                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 p-4 flex justify-end gap-3">
                            {!viewMessage.isRead && (
                                <button
                                    onClick={() => {
                                        handleMarkRead(viewMessage._id);
                                        setViewMessage(null);
                                    }}
                                    className="px-4 py-2 bg-[#352AA4] text-white rounded-lg hover:bg-[#2a2183] transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Mark as Read
                                </button>
                            )}
                            <button
                                onClick={() => setViewMessage(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFeedback;
