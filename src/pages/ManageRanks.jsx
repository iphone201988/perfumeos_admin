import React, { useEffect, useState } from 'react';
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination';
import view_icon from '../assets/icons/view-icon.svg';
import user_icon from '../assets/user-img.png';
import {
    useGetRanksQuery,
    useCreateRankMutation,
    useUpdateRankMutation,
    useDeleteRankMutation
} from '../api';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import AddRanks from '../components/ManageRanks/AddRanks';
import { toast } from 'react-toastify';
import ViewRanks from '../components/ManageRanks/ViewRanks';

const ManageRanks = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortValue, setSortValue] = useState('date_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [addRanksPopup, setAddRanksPopup] = useState(false);
    const [viewRanksPopup, setViewRanksPopup] = useState(false);
    const [selectedRanks, setSelectedRanks] = useState(null);
    const [editRanksPopup, setEditRanksPopup] = useState(false);

    const navigate = useNavigate();
    const itemsPerPage = 20;
    const [addRanks, { isLoading: isAdding, error: addError }] = useCreateRankMutation();
    const [updateRanks, { isLoading: isUpdating, error: updateError }] = useUpdateRankMutation();
    const [deleteRanks, { isLoading: isDeleting, error: deleteError }] = useDeleteRankMutation();
    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 2000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const {
        data: badgesResponse,
        error,
        isLoading,
        refetch
    } = useGetRanksQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        sort: sortValue
    });
    if (isLoading) {
        return <Loader message="Fetching Ranks" />;
    }

    // Process Ranks data and add serial numbers
    const rawRanks = badgesResponse?.data?.ranks || [];
    const totalRanks = badgesResponse?.data?.pagination?.totalCount || 0;
    const totalPages = badgesResponse?.data?.pagination?.totalPage || 1;

    // Add serial numbers and format data
    const Ranks = rawRanks.map((rank, index) => ({
        ...rank,
        sno: (currentPage - 1) * itemsPerPage + index + 1,
        status: rank.isDeleted ? 'Suspended' : 'Active',
        joinedOn: rank.createdAt ? new Date(rank.createdAt).toLocaleDateString() : rank.joinedOn,
        image: rank?.image ? `${import.meta.env.VITE_BASE_URL}${rank?.image}` : user_icon
    }));

    const columns = [
        { label: '#', accessor: 'sno' },
        {
            label: 'Ranks Name',
            accessor: 'name',
            type: 'imageWithName'
        },
        { label: 'Min Point', accessor: 'min', },
        { label: 'Max Point', accessor: 'max' },
        {
            label: 'Status',
            accessor: 'status',
            render: (value, row) => (
                <span
                    className={
                        value === 'Active'
                            ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'
                            : 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'
                    }
                >
                    {value}
                </span>
            )
        },
        { label: 'Joined On', accessor: 'joinedOn' },
    ];

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

    const handleAddRanks = async (data) => {
        try {

            if (editRanksPopup && selectedRanks) {
                await updateRanks({ id: selectedRanks._id, data }).unwrap();
                toast.success('Ranks updated successfully!');
                setEditRanksPopup(false);
            } else {
                await addRanks(data).unwrap();
                toast.success('Ranks added successfully!');
                setAddRanksPopup(false);
            }

            setSelectedRanks(null);
            refetch();
        } catch (error) {
            console.error('Save error:', error);
            const errorMessage = error?.data?.message ||
                (editRanksPopup ? 'Failed to update rank' : 'Failed to add rank');
            toast.error(errorMessage);
        }
    };
    const deleteRanksHandler = async (id, type) => {
        try {
            await deleteRanks({ id: id, data: { type } }).unwrap();
            setSelectedRanks(null);
            setEditRanksPopup(false);
            setAddRanksPopup(false);
            setViewRanksPopup(false);
            toast.success('Ranks deleted successfully!');
            refetch();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error?.data?.message || 'Failed to delete rank');
        }
    }
    // Error state
    if (error) {
        return (
            <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-4">
                            Error loading Ranks: {error?.data?.message || error.message}
                        </div>
                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-[#352AA4] text-white rounded hover:bg-[#2a217a] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    const options = [
        { label: "Min to Max", value: "date_desc" },
        { label: "Max to Min", value: "date_asc" },
        { label: "A-Z", value: "name_asc" },
        { label: "Z-A", value: "name_desc" }
    ];
    return (
        <>
            <div className="mb-[24px] flex">
                <button onClick={() => setAddRanksPopup(true)} className='btn-pri ml-auto'>Add Ranks</button>
            </div>
            <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
                <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-4">
                    <div>
                        <h6 className="text-[20px] font-semibold text-[#352AA4]">
                            All Ranks ({totalRanks})
                        </h6>
                        
                    </div>
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={handleSearch}
                        sortValue={sortValue}
                        onSortChange={handleSortChange}
                        placeholder="Search Ranks..."
                        options={options}
                        loader={searchTerm !== debouncedSearchTerm}
                    />
                </div>

                <Table
                    columns={columns}
                    data={Ranks}
                    renderActions={(row) => (
                        <button
                            className="ml-auto cursor-pointer p-2 hover:bg-gray-100 rounded"
                            title={`View ${row.name}`}
                            onClick={() => {
                                setSelectedRanks(row);
                                setViewRanksPopup(true);
                                console.log('View rank:', row);
                            }}
                        >
                            <img src={view_icon} alt="View" className="w-5 h-5" />
                        </button>
                    )}
                />

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Show empty state when no Ranks found */}
                {Ranks.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No Ranks found</p>
                        {searchTerm && (
                            <p className="text-gray-400 text-sm mt-2">
                                Try adjusting your search criteria
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {addRanksPopup && (
                <AddRanks
                    open={addRanksPopup}
                    onClose={() => setAddRanksPopup(false)}
                    onSubmit={handleAddRanks}
                />
            )}
            {editRanksPopup && selectedRanks && (
                <AddRanks
                    open={editRanksPopup}
                    onClose={() => setEditRanksPopup(false)}
                    onSubmit={handleAddRanks}
                    initialData={selectedRanks}
                />
            )}
            {viewRanksPopup && selectedRanks && (
                <ViewRanks
                    open={viewRanksPopup}
                    onClose={() => setViewRanksPopup(false)}
                    rankData={selectedRanks}
                    onEdit={() => {
                        setViewRanksPopup(false);
                        setEditRanksPopup(true);
                    }}
                    onRemove={deleteRanksHandler}
                />
            )}
        </>
    );
};

export default ManageRanks;
