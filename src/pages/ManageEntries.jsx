import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import user_icon from '../assets/icons/user-icon.svg';
import AsyncSelect from 'react-select/async';
import SearchBar from '../components/Table/SearchBar';
import Pagination from '../components/Table/Pagination';
import moment from 'moment';
import Loader from '../components/Loader/Loader';
import { useGetEntriesQuery, useDeleteEntryMutation, useLazyGetPerfumeOptionsQuery, useLazyGetUsersOptionalQuery } from '../api';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import ViewEntryModal from '../components/Modal/ViewEntryModal';

const MOOD_MAPPING = {
    1: "Floral 🌸",
    2: "Fresh/Citrus 🍋",
    3: "Woody 🌳",
    4: "Sweet/Gourmand 🍬",
    5: "Amber/Oriental 🔥",
    6: "Aromatic/Herbal 🌿"
};

const OCCASION_MAPPING = {
    1: "Work 💼",
    2: "Everyday Wear 👕",
    3: "Date ❤️",
    4: "Gym 🏋️",
    5: "Special Events 🌟",
    6: "Just for me 🧑"
};


const ManageEntries = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortValue, setSortValue] = useState('createdAt_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedPerfume, setSelectedPerfume] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    // Delete Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // View Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [itemToView, setItemToView] = useState(null);

    const navigate = useNavigate();
    const itemsPerPage = 21; // Match ManageReviews itemsPerPage

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

    // Trigger for lazy loading perfume options
    const [triggerPerfumeOptions] = useLazyGetPerfumeOptionsQuery();

    const fetchPerfumeOptions = async (inputValue) => {
        try {
            const { data } = await triggerPerfumeOptions({
                search: inputValue,
                page: 1,
                limit: 100
            });
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
    const loadPerfumeOptions = useDebouncedLoadOptions(fetchPerfumeOptions, 300);

    // Trigger for lazy loading user options
    const [triggerUserOptions] = useLazyGetUsersOptionalQuery();

    const fetchUserOptions = async (inputValue) => {
        try {
            const { data } = await triggerUserOptions({
                search: inputValue,
                page: 1,
                limit: 100
            });
            // data from triggerUserOptions usually has { data: [...] } structure based on SUCCESS helper
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

    const {
        data: entriesResponse,
        isLoading,
        isFetching,
        refetch
    } = useGetEntriesQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        sort: sortValue,
        perfumeId: selectedPerfume ? selectedPerfume.value : '',
        userId: selectedUser ? selectedUser.value : ''
    });

    const [deleteEntry] = useDeleteEntryMutation();

    if (isLoading) {
        return <Loader message="Fetching Entries..." />;
    }

    const rawEntries = entriesResponse?.data || [];
    const totalEntries = entriesResponse?.total || 0;
    const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return user_icon;
        return imagePath.startsWith('http')
            ? imagePath
            : `${import.meta.env.VITE_BASE_URL}${imagePath}`;
    };

    const entries = rawEntries.map((entry, index) => ({
        ...entry,
        sno: (currentPage - 1) * itemsPerPage + index + 1,
        authorImage: getImageUrl(entry.userId?.profileImage),
        formattedDate: entry.createdAt ? moment(entry.createdAt).format('DD MMM, YYYY') : 'N/A',
        perfumeName: entry.perfumeId?.name || 'Unknown Perfume'
    }));
    console.log("entries", entries);

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

    const handleDelete = (id) => {
        setItemToDelete(id);
        setModalOpen(true);
    };

    const handleView = (entry) => {
        setItemToView(entry);
        setViewModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeleting(true);
            await deleteEntry(itemToDelete).unwrap();
            toast.success("Entry deleted successfully");
            setModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete entry");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className='bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]'>
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                    <div className="shrink-0">
                        <h6 className="text-[20px] font-bold text-[#352AA4] whitespace-nowrap">
                            All Entries ({totalEntries})
                        </h6>
                        {(searchTerm !== debouncedSearchTerm || isFetching) && (
                            <p className="text-sm text-gray-500 mt-1">Loading...</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 flex-wrap bg-white/50 p-2 rounded-[24px] border border-white/60 shadow-sm w-full xl:w-auto">
                        <div className="w-[180px] sm:w-[200px] flex-shrink-0">
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
                        <div className="w-[180px] sm:w-[200px] flex-shrink-0">
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={loadPerfumeOptions}
                                value={selectedPerfume}
                                onChange={(opt) => {
                                    setSelectedPerfume(opt);
                                    setCurrentPage(1);
                                }}
                                placeholder="All Perfumes"
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
                                onSearchChange={handleSearch}
                                sortValue={sortValue}
                                onSortChange={handleSortChange}
                                placeholder="Search entries..."
                                loader={searchTerm !== debouncedSearchTerm || isFetching}
                                options={[
                                    { value: "createdAt_desc", label: "Newest" },
                                    { value: "createdAt_asc", label: "Oldest" },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {isFetching ? (
                   <Loader message='Loading Entries...' title='Please wait...'/>
                ) : entries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {entries.map((entry) => (
                            <div key={entry._id} className="group bg-white rounded-[20px] p-5 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 h-[360px] flex flex-col relative overflow-hidden">

                                {/* Hover Gradient Overlay */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#352AA4] to-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="relative">
                                            <img
                                                src={entry.authorImage}
                                                alt={entry.userId?.firstName || 'User'}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate">{entry.userId?.firstName || 'Anonymous'}</h4>
                                            <p className="text-xs text-gray-500 font-medium">{entry.formattedDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {/* Top right badge removed to avoid redundancy and clutter */}
                                    </div>
                                </div>

                                {/* Entry Title & Perfume */}
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 truncate">
                                        <span className="opacity-70 text-[#352AA4]">Entry for:</span>
                                        <Link to={`/perfumes/${entry.perfumeId?._id}`} className="text-gray-700 font-semibold truncate hover:text-[#352AA4] transition-colors">{entry.perfumeName}</Link>
                                    </p>
                                </div>

                                {/* Attributes Tags */}
                                <div className="flex flex-col gap-2 mb-4">
                                    <div className="flex items-center justify-between gap-2 bg-[#FFF9E6] px-3 py-2 rounded-xl border border-[#FDE68A]">
                                        <span className="text-[11px] text-[#B45309]/70 font-bold uppercase tracking-widest">Mood</span>
                                        <span className="text-sm font-extrabold text-[#B45309]">
                                            {entry.mood ? (MOOD_MAPPING[entry.mood] || entry.mood) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 bg-[#E1F8F8] px-3 py-2 rounded-xl border border-[#A5F3FC]">
                                        <span className="text-[11px] text-[#0891B2]/70 font-bold uppercase tracking-widest">Occasion</span>
                                        <span className="text-sm font-extrabold text-[#0891B2]">
                                            {entry.occasion ? (OCCASION_MAPPING[entry.occasion] || entry.occasion) : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Content Preview */}
                                <div className="flex-1 overflow-hidden min-h-0 relative mb-1 flex gap-3">
                                    {entry.image && (
                                        <img 
                                            src={getImageUrl(entry.image)} 
                                            alt="Entry" 
                                            className="w-20 h-20 object-cover rounded-xl border border-gray-100 shrink-0 shadow-sm" 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = user_icon;
                                                e.target.className = "w-20 h-20 object-contain p-4 rounded-xl border border-gray-100 shrink-0 bg-gray-50 opacity-40";
                                            }}
                                        />
                                    )}
                                    <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                                        {entry.thoughts || "No thoughts provided."}
                                    </p>
                                </div>

                                {/* Card Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 ">
                                    <button
                                        onClick={() => handleView(entry)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-[#352AA4] hover:bg-[#352AA4]/5 rounded-lg transition-colors group/btn"
                                    >
                                        <span>View Details</span>
                                        <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(entry._id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Entry"
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
                ) : (
                    <div className="text-center py-16 bg-white/40 rounded-[20px] border border-white/60">
                        <p className="text-gray-500 text-lg">No entries found</p>
                        {searchTerm && (
                            <p className="text-gray-400 text-sm mt-2">
                                Try adjusting your search criteria
                            </p>
                        )}
                    </div>
                )}

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this entry?"
                isLoading={isDeleting}
            />

            <ViewEntryModal
                isOpen={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setItemToView(null);
                }}
                entry={itemToView}
            />
        </>
    );
};

export default ManageEntries;
