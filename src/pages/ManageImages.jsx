import React, { useEffect, useState } from 'react';
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination';
import Loader from '../components/Loader/Loader';
import { useGetImagesQuery, useUpdateImageStatusMutation, useDeleteImageMutation } from '../api';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import { toast } from 'react-toastify';
import select_icon from "../assets/icons/user-icon.svg";
import cross_icon from "../assets/icons/cross-icon.svg";

const sortOptions = [
    { label: 'Newest First', value: 'createdAt_desc' },
    { label: 'Oldest First', value: 'createdAt_asc' },
];
const ManageImages = () => {
    const [sortValue, setSortValue] = useState('createdAt_desc');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    // Mutations
    const [updateStatus, { isLoading: isUpdating }] = useUpdateImageStatusMutation();
    const [deleteImage, { isLoading: isDeleting }] = useDeleteImageMutation();
    const {
        data: imagesResponse,
        error,
        isLoading,
        refetch
    } = useGetImagesQuery({
        page: currentPage,
        limit: itemsPerPage,
        sort: sortValue,
        status: statusFilter,
        type: typeFilter
    });

    const handleSortChange = (e) => {
        setSortValue(e.target.value);
        setCurrentPage(1);
    };
    const handlePageChange = (page) => setCurrentPage(page);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateStatus({ id, status: newStatus }).unwrap();
            toast.success(`Image ${newStatus} successfully`);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedImageId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedImageId) return;
        try {
            await deleteImage(selectedImageId).unwrap();
            toast.success('Image deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to delete image');
        }
    };

    if (isLoading) return <Loader message="Loading Images..." />;

    const rawImages = imagesResponse?.data?.images || [];
    const totalImages = imagesResponse?.data?.pagination?.totalCount || 0;
    const totalPages = imagesResponse?.data?.pagination?.totalPage || 1;

    const images = rawImages.map((img, index) => ({
        ...img,
        sno: (currentPage - 1) * itemsPerPage + index + 1,
        uploadedBy: img.userId?.firstName || 'Unknown',
        targetName: img.noteId?.name || img.perfumerId?.name || img.perfumeId?.name || 'N/A',
        formattedDate: new Date(img.createdAt).toLocaleDateString()
    }));

    const columns = [
        { label: '#', accessor: 'sno' },
        {
            label: 'Image',
            accessor: 'url',
            render: (value) => {
                const imageUrl = value.startsWith('http') ? value : `${import.meta.env.VITE_BASE_URL}${value}`;
                return (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img
                            src={imageUrl}
                            alt="Content"
                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => setSelectedImageUrl(imageUrl)}
                        />
                    </div>
                );
            }
        },
        { label: 'Type', accessor: 'type', render: (val) => <span className="capitalize px-2 py-1 bg-gray-100 rounded-md text-sm">{val}</span> },
        { label: 'Related To', accessor: 'targetName' },
        { label: 'Uploaded By', accessor: 'uploadedBy' },
        {
            label: 'Status',
            accessor: 'status',
            render: (val) => {
                const colors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    approved: 'bg-green-100 text-green-800',
                    rejected: 'bg-red-100 text-red-800'
                };
                return <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${colors[val] || 'bg-gray-100'}`}>{val}</span>;
            }
        },
        { label: 'Date', accessor: 'formattedDate' },
    ];

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-xl">
                <p className="text-red-500 mb-4">Error loading images: {error?.data?.message || 'Unknown error'}</p>
                <button onClick={refetch} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Retry</button>
            </div>
        );
    }

    return (
        <div className="bg-[#E1F8F8] rounded-[30px] p-[32px] max-lg:p-[16px] min-h-[80vh]">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-[24px] font-bold text-[#352AA4]">Manage Images ({totalImages})</h2>

                <div className="flex gap-4 flex-wrap items-center">
                    {/* Filters */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#352AA4] text-white px-4 py-2 rounded-[20px] cursor-pointer pr-10"
                        >
                            <option className="bg-white text-black" value="">All Status</option>
                            <option className="bg-white text-black" value="pending">Pending</option>
                            <option className="bg-white text-black" value="approved">Approved</option>
                            <option className="bg-white text-black" value="rejected">Rejected</option>
                        </select>


                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-[#352AA4] text-white px-4 py-2 rounded-[20px]  cursor-pointer pr-10"
                        >
                            <option className="bg-white text-black" value="">All Types</option>
                            <option className="bg-white text-black" value="note">Note</option>
                            {/* <option className="bg-white text-black" value="perfumer">Perfumer</option> */}
                            <option className="bg-white text-black" value="perfume">Perfume</option>
                        </select>

                    {/* Sort Dropdown */}
                    <div className="flex text-white bg-[#352AA4] px-[10px] py-[8px] rounded-[20px] gap-[8px] items-center max-sm:flex-shrink-0">
                        <span className="font-light max-sm:text-sm max-sm:hidden">Sort by:</span>
                        <span className="font-light max-sm:text-sm sm:hidden">Sort:</span>
                        <select
                            value={sortValue}
                            onChange={handleSortChange}
                            className="font-semibold bg-[#352AA4] outline-none text-white cursor-pointer max-sm:text-sm"
                        >
                            {sortOptions.map((option) => (
                                <option className="bg-white text-black" key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <Table
                columns={columns}
                data={images}
                renderActions={(row) => (
                    <div className="flex gap-2 justify-end">
                        {row.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => handleStatusUpdate(row._id, 'approved')}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                                    title="Approve"
                                    disabled={isUpdating}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(row._id, 'rejected')}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="Reject"
                                    disabled={isUpdating}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => handleDeleteClick(row._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            />

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this image? This action cannot be undone."
                title="Delete Image"
            />

            {/* Image Modal */}
            {selectedImageUrl && (
                <div
                    className="fixed inset-0 bg-opacity-70 flex justify-center items-center z-[999999] backdrop-blur-sm"
                    onClick={() => setSelectedImageUrl(null)}
                >
                    <div
                        className="bg-white rounded-2xl relative max-w-4xl max-h-[90vh] overflow-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-3xl font-bold text-gray-500 hover:text-gray-700 cursor-pointer bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                            onClick={() => setSelectedImageUrl(null)}
                            aria-label="Close modal"
                        >
                            <img src={cross_icon} alt="Close" className="w-5 h-5" />
                        </button>
                        <img
                            src={selectedImageUrl}
                            alt="Enlarged image"
                            className="max-w-full max-h-[80vh] rounded-xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageImages;
