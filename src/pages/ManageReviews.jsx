import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import user_icon from '../assets/icons/user-icon.svg';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import SearchBar from '../components/Table/SearchBar';
import Pagination from '../components/Table/Pagination';
import moment from 'moment';
import Loader from '../components/Loader/Loader';
import { useGetReviewsQuery, useDeleteReviewMutation, useLazyGetPerfumeOptionsQuery } from '../api';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import EditReviewModal from '../components/Modal/EditReviewModal';
import ViewReviewModal from '../components/Modal/ViewReviewModal';

const ManageReviews = () => {
    // ... (existing state) ...
    const [searchTerm, setSearchTerm] = useState('');
    const [sortValue, setSortValue] = useState('createdAt_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedPerfume, setSelectedPerfume] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);

    // Delete Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // View Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [itemToView, setItemToView] = useState(null);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    const navigate = useNavigate();
    const itemsPerPage = 21;

    // Trigger for lazy loading perfume options
    const [triggerPerfumeOptions] = useLazyGetPerfumeOptionsQuery();

    const loadPerfumeOptions = async (inputValue) => {
        try {
            const { data } = await triggerPerfumeOptions({
                search: inputValue,
                page: 1,
                limit: 100
            });
            // Map the data to react-select options format
            // Backend returns { data: { data: [...], pagination: {...} } }
            const perfumesList = data?.data || [];

            if (Array.isArray(perfumesList)) {
                return perfumesList.map(perfume => ({
                    value: perfume._id,
                    label: perfume.name
                }));
            }
            return [];
        } catch (error) {
            console.error("Failed to load perfume options:", error);
            return [];
        }
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const {
        data: reviewsResponse,
        error,
        isLoading,
        refetch
    } = useGetReviewsQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        sort: sortValue,
        perfumeId: selectedPerfume ? selectedPerfume.value : '',
        rating: selectedRating ? selectedRating.value : ''
    });

    const [deleteReview] = useDeleteReviewMutation();

    if (isLoading) {
        return <Loader message="Fetching Reviews..." />;
    }

    const rawReviews = reviewsResponse?.data?.reviews || [];
    const totalReviews = reviewsResponse?.data?.pagination?.totalCount || 0;
    const totalPages = reviewsResponse?.data?.pagination?.totalPage || 1;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return user_icon
        return imagePath.startsWith('http')
            ? imagePath
            : `${import.meta.env.VITE_BASE_URL}${imagePath}`
    }

    const reviews = rawReviews.map((review, index) => ({
        ...review,
        sno: (currentPage - 1) * itemsPerPage + index + 1,
        authorImage: getImageUrl(review?.authorImage),
        reviewTitle: review?.title || 'No Title',
        formattedDate: review.createdAt ? moment(review.createdAt).format('DD MMM, YYYY') : 'N/A',
        perfumeName: review.perfumeId?.name || 'Unknown Perfume'
    }));


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortValue(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleEdit = (review) => {
        setItemToEdit(review);
        setEditModalOpen(true);
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setModalOpen(true);
    };

    const handleView = (review) => {
        setItemToView(review);
        setViewModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeleting(true);
            await deleteReview(itemToDelete).unwrap();
            toast.success("Review deleted successfully");
            setModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete review");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* <div className="mb-[24px] flex">
                <h1 className="text-[24px] font-bold text-[#352AA4]">Manage Reviews</h1>
            </div> */}
            <div className='bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]'>
                <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                    <div>
                        <h6 className="text-[20px] font-bold text-[#352AA4]">
                            All Reviews ({totalReviews})
                        </h6>
                        {searchTerm !== debouncedSearchTerm && (
                            <p className="text-sm text-gray-500 mt-1">Searching...</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap flex-1 justify-end">
                        <div className="w-[180px] max-w-full">
                            <Select
                                options={[
                                    { value: 5, label: '5 Stars' },
                                    { value: 4, label: '4 Stars' },
                                    { value: 3, label: '3 Stars' },
                                    { value: 2, label: '2 Stars' },
                                    { value: 1, label: '1 Star' }
                                ]}
                                value={selectedRating}
                                onChange={(opt) => {
                                    setSelectedRating(opt);
                                    setCurrentPage(1);
                                }}
                                placeholder="Rating"
                                isClearable
                                className="text-sm font-medium"
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '20px',
                                        minHeight: '40px',
                                        border: 'none',
                                        backgroundColor: '#352AA4',
                                        paddingLeft: '4px',
                                        boxShadow: 'none',
                                        cursor: 'pointer',
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: 'white',
                                        opacity: 1,
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: 'white',
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        color: 'white',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        zIndex: 100,
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        marginTop: '4px'
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isSelected ? '#352AA4' : state.isFocused ? '#F3F4F6' : 'white',
                                        color: state.isSelected ? 'white' : '#374151',
                                        ':active': {
                                            backgroundColor: '#352AA4',
                                            color: 'white'
                                        }
                                    }),
                                    indicatorSeparator: () => ({ display: 'none' }),
                                    dropdownIndicator: (base) => ({
                                        ...base,
                                        color: 'white',
                                        ':hover': { color: 'white' }
                                    }),
                                    clearIndicator: (base) => ({
                                        ...base,
                                        color: 'white',
                                        ':hover': { color: 'white' }
                                    })
                                }}
                            />
                        </div>
                        <div className="w-[220px] max-w-full">
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={loadPerfumeOptions}
                                value={selectedPerfume}
                                onChange={(opt) => {
                                    setSelectedPerfume(opt);
                                    setCurrentPage(1);
                                }}
                                placeholder="Perfume"
                                isClearable
                                className="text-sm font-medium"
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '20px',
                                        minHeight: '40px',
                                        border: 'none',
                                        backgroundColor: '#352AA4',
                                        paddingLeft: '4px',
                                        boxShadow: 'none',
                                        cursor: 'pointer',
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: 'white',
                                        opacity: 1,
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: 'white',
                                    }),
                                    input: (base) => ({
                                        ...base,
                                        color: 'white',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        zIndex: 100,
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        marginTop: '4px'
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isSelected ? '#352AA4' : state.isFocused ? '#F3F4F6' : 'white',
                                        color: state.isSelected ? 'white' : '#374151',
                                        ':active': {
                                            backgroundColor: '#352AA4',
                                            color: 'white'
                                        }
                                    }),
                                    indicatorSeparator: () => ({ display: 'none' }),
                                    dropdownIndicator: (base) => ({
                                        ...base,
                                        color: 'white',
                                        ':hover': { color: 'white' }
                                    }),
                                    clearIndicator: (base) => ({
                                        ...base,
                                        color: 'white',
                                        ':hover': { color: 'white' }
                                    })
                                }}
                            />
                        </div>
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearchChange={handleSearch}
                            sortValue={sortValue}
                            onSortChange={handleSortChange}
                            placeholder="Search..."
                            loader={searchTerm !== debouncedSearchTerm}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="group bg-white rounded-[20px] p-5 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 h-[360px] flex flex-col relative overflow-hidden">

                            {/* Hover Gradient Overlay */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#352AA4] to-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="relative">
                                        <img
                                            src={getImageUrl(review.userId?.profileImage)}
                                            alt={review.userId?.firstName}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 truncate">{review.userId?.firstName || 'Anonymous'}</h4>
                                        <p className="text-xs text-gray-500 font-medium">{review.formattedDate}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 bg-[#FFF9E6] px-2.5 py-1 rounded-lg border border-[#FDE68A]">
                                        <span className="text-yellow-500 text-xs">★</span>
                                        <span className="text-sm font-extrabold text-[#B45309]">{review.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                                        <span className="text-red-500 text-xs">♥</span>
                                        <span className="text-sm font-extrabold text-red-700">{review.reviewLikesCount || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Review Title & Perfume */}
                            <div className="mb-3">
                                {/* <h3 className="text-base font-bold text-[#352AA4] mb-1 truncate leading-tight group-hover:text-[#2a2185] transition-colors">{review.reviewTitle}</h3> */}
                                <p className="text-xs text-gray-500 font-medium flex items-center gap-1 truncate">
                                    <span className="opacity-70 text-[#352AA4]">Review for:</span>
                                    <span className="text-gray-700 font-semibold truncate">{review.perfumeName}</span>
                                </p>
                            </div>

                            {/* Attributes Visuals */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] text-gray-500 font-medium">Longevity</span>
                                        <span className="text-[10px] font-bold text-[#352AA4]">{Math.round((review.longevity || 0) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-[#352AA4] h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.round((review.longevity || 0) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] text-gray-500 font-medium">Sillage</span>
                                        <span className="text-[10px] font-bold text-[#352AA4]">{Math.round((review.sillage || 0) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-[#06B6D4] h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.round((review.sillage || 0) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] text-gray-500 font-medium">Price</span>
                                        <span className="text-[10px] font-bold text-[#352AA4]">{Math.round((review.price || 0) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-[#10B981] h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.round((review.price || 0) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card Content Preview */}
                            <div className="flex-1 overflow-hidden min-h-0 relative mb-1">
                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                    {review.review || "No content provided."}
                                </p>
                            </div>

                            {/* Card Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 ">
                                <button
                                    onClick={() => handleView(review)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-[#352AA4] hover:bg-[#352AA4]/5 rounded-lg transition-colors group/btn"
                                >
                                    <span>View Details</span>
                                    <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(review)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Edit Review"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Review"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                {reviews.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No reviews found</p>
                        {searchTerm && (
                            <p className="text-gray-400 text-sm mt-2">
                                Try adjusting your search criteria
                            </p>
                        )}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this review?"
                isLoading={isDeleting}
            />

            <EditReviewModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setItemToEdit(null);
                    refetch(); // Refetch list after edit
                }}
                reviewData={itemToEdit}
            />


            <ViewReviewModal
                isOpen={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setItemToView(null);
                }}
                review={itemToView}
            />
        </>
    );
};

export default ManageReviews;
