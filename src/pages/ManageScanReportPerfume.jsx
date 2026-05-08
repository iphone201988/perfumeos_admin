import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import AsyncSelect from 'react-select/async';
import {
    useGetScanReportsQuery,
    useMarkScanReportReadMutation,
    useDeleteScanReportMutation,
    useLazyGetUsersOptionalQuery,
} from '../api';
import Table from '../components/Table/Table';
import SearchBar from '../components/Table/SearchBar';
import Pagination from '../components/Table/Pagination';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import Loader from '../components/Loader/Loader';
import ViewScanReportModal from '../components/Modal/ViewScanReportModal';
import user_icon from '../assets/user-img.png';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FILTER_OPTIONS = [
    { value: '', label: 'All Reports' },
    { value: 'false', label: 'Unread' },
    { value: 'true', label: 'Read' },
];

const ManageScanReportPerfume = () => {
    const [isReadFilter, setIsReadFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [sortValue, setSortValue] = useState('createdAt_desc');
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewReportData, setViewReportData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Generic debounce for AsyncSelect loadOptions
    const useDebouncedLoadOptions = (fetchFunction, delay = 300) => {
        const timeoutRef = useRef(null);
        return (inputValue) => {
            return new Promise((resolve) => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(async () => {
                    const result = await fetchFunction(inputValue);
                    resolve(result);
                }, delay);
            });
        };
    };

    const [triggerUserOptions] = useLazyGetUsersOptionalQuery();

    const fetchUserOptions = async (inputValue) => {
        try {
            const { data } = await triggerUserOptions({
                search: inputValue,
                page: 1,
                limit: 100
            });
            const usersList = data?.users || [];

            if (Array.isArray(usersList)) {
                return usersList.map(user => ({
                    value: user._id,
                    label: `${user.firstName || ''} ${user.lastName || ''} (${user.email || 'No Email'})`.trim()
                }));
            }
            return [];
        } catch (error) {
            console.error("Failed to load user options:", error);
            return [];
        }
    };
    const loadUserOptions = useDebouncedLoadOptions(fetchUserOptions, 300);
    console.log('selectedUser', selectedUser);
    // API Hooks
    const { data: reportData, isLoading, isFetching } = useGetScanReportsQuery({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isRead: isReadFilter,
        search: debouncedSearchTerm,
        sort: sortValue,
        userId: selectedUser ? selectedUser.value : '',
    });

    const [markScanReportRead, { isLoading: markReadLoading }] = useMarkScanReportReadMutation();
    const [deleteScanReport, { isLoading: deleteLoading }] = useDeleteScanReportMutation();

    const rawReports = reportData?.data || [];
    const pagination = reportData?.pagination || {};
    const total = pagination.total || 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;
    const isOperationLoading = markReadLoading || deleteLoading;

    // Format data for table
    const reports = rawReports.map((report, index) => ({
        ...report,
        sno: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
        userEmail: report.reportBy?.email || 'Unknown User',
        firstName: report.reportBy?.firstName || 'Unknown',
        lastName: report.reportBy?.lastName || 'User',
        userName: report.reportBy?.firstName ? `${report.reportBy.firstName} ${report.reportBy.lastName || ''}` : report.reportBy?.email ? report.reportBy.email.split('@')[0] : 'Unknown User',
        image: report.reportBy?.profileImage ? `${BASE_URL}${report.reportBy.profileImage}` : user_icon,
        perfumeImageFull: report.perfumeImage ? `${BASE_URL}${report.perfumeImage}` : null,
        formattedDate: report.createdAt
            ? new Date(report.createdAt).toLocaleString()
            : '-',
        status: report.isRead ? 'Read' : 'Unread',
    }));

    // Table columns
    const columns = [
        { label: '#', accessor: 'sno' },
        {
            label: 'Reported By',
            accessor: 'userName',
            type: 'imageWithName',
        },
        {
            label: 'Perfume Name',
            accessor: 'perfumeName',
        },
        // {
        //     label: 'Brand',
        //     accessor: 'perfumeBrand',
        // },
        {
            label: 'Perfume Image',
            accessor: 'perfumeImageFull',
            render: (value) => (
                value ? (
                    <img
                        src={value}
                        alt="Perfume"
                        className="w-12 h-12 object-cover rounded shadow-sm border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                            setSelectedImage(value);
                            setImageModalOpen(true);
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                )
            ),
        },
        { label: 'Date', accessor: 'formattedDate' },
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
    ];

    // Handlers
    const handleMarkRead = async (reportId) => {
        try {
            await markScanReportRead(reportId).unwrap();
            toast.success('Report marked as read!');
        } catch (error) {
            console.error('Mark read error:', error);
            toast.error(error?.data?.message || 'Failed to mark report as read');
        }
    };

    const handleDeleteReport = (report) => {
        setDeleteConfirmation({
            item: report,
            title: 'Delete Report',
            message: `Are you sure you want to delete this report for "${report.perfumeName}"?`,
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;

        try {
            await deleteScanReport(deleteConfirmation.item._id).unwrap();
            toast.success('Report deleted successfully!');
            setDeleteConfirmation(null);
            if (reports.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error?.data?.message || 'Failed to delete report');
        }
    };

    const handleFilterChange = (value) => {
        setIsReadFilter(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (isLoading) {
        return <Loader message="Loading Scan Reports..." />;
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
            <div className="flex justify-between items-start xl:items-center flex-col xl:flex-row max-md:gap-[12px] mb-6 gap-4">
                <div className="shrink-0">
                    <h6 className="text-[20px] font-bold text-[#352AA4] whitespace-nowrap">
                        Scan Reported Perfumes ({total})
                    </h6>
                    {(searchTerm !== debouncedSearchTerm || isFetching) && (
                        <p className="text-sm text-gray-500 mt-1">Loading...</p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 flex-wrap bg-white/50 p-2 rounded-[24px] border border-white/60 shadow-sm w-full xl:w-auto">
                    {/* Read Status Dropdown */}
                    <div className="w-[140px] sm:w-[160px] flex-shrink-0">
                        <select
                            value={isReadFilter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="w-full h-[40px] px-4 py-2 rounded-[20px] text-sm font-medium bg-[#352AA4] text-white outline-none cursor-pointer appearance-none shadow-none"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                backgroundSize: '16px'
                            }}
                        >
                            {FILTER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value} className="bg-white text-[#374151]">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-[180px] sm:w-[220px] flex-shrink-0">
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadUserOptions}
                            value={selectedUser}
                            onChange={(opt) => {
                                setSelectedUser(opt);
                                setCurrentPage(1);
                            }}
                            placeholder="All Users"
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
                                    opacity: 0.9,
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

                    <div className="flex-shrink-0">
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearchChange={(e) => setSearchTerm(e.target.value)}
                            sortValue={sortValue}
                            onSortChange={(e) => { setSortValue(e.target.value); setCurrentPage(1); }}
                            placeholder="Search..."
                            loader={searchTerm !== debouncedSearchTerm || isFetching}
                            options={[
                                { value: "createdAt_desc", label: "Newest" },
                                { value: "createdAt_asc", label: "Oldest" },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={reports}
                renderActions={(row) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setViewReportData(row);
                                setViewModalOpen(true);
                            }}
                            className="p-2 text-[#352AA4] hover:bg-[#352AA4]/10 rounded-lg transition-all duration-200"
                            title="View Report"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        {!row.isRead && (
                            <button
                                onClick={() => handleMarkRead(row._id)}
                                className="p-2 text-[#352AA4] hover:bg-[#352AA4]/10 rounded-lg transition-all duration-200"
                                title="Mark as Read"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={() => handleDeleteReport(row)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete Report"
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
            {reports.length === 0 && !isLoading && (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No reports found</p>
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

            {/* Image Viewer Modal */}
            {imageModalOpen && selectedImage && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setImageModalOpen(false)}
                >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"
                            onClick={() => setImageModalOpen(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
                        />
                    </div>
                </div>
            )}

            <ViewScanReportModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                reportData={viewReportData}
                onMarkRead={handleMarkRead}
                onImageClick={(imgSrc) => {
                    setSelectedImage(imgSrc);
                    setImageModalOpen(true);
                }}
            />
        </div>
    );
};

export default ManageScanReportPerfume;
