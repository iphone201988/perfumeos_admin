import React, { useEffect, useState } from 'react';
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination';
import view_icon from '../assets/icons/view-icon.svg';
import user_icon from '../assets/user-img.png';
import {
    useCreatePerfumerMutation,
    useDeletePerfumerMutation,
    useGetAllPerfumesQuery,
    useUpdatePerfumerMutation,
} from '../api';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import { toast } from 'react-toastify';
import AddPerfumer from '../components/ManagePerfumers/AddPerfumer';
import ViewPerfumer from '../components/ManagePerfumers/ViewPerfumer';

const ManagePerfumers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortValue, setSortValue] = useState('date_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [addPerfumersPopup, setAddPerfumersPopup] = useState(false);
    const [viewPerfumersPopup, setViewPerfumersPopup] = useState(false);
    const [selectedPerfumers, setSelectedPerfumers] = useState(null);
    const [editPerfumersPopup, setEditPerfumersPopup] = useState(false);

    const navigate = useNavigate();
    const itemsPerPage = 20;
    const [addPerfumers, { isLoading: isAdding, error: addError }] = useCreatePerfumerMutation();
    const [updatePerfumers, { isLoading: isUpdating, error: updateError }] = useUpdatePerfumerMutation();
    const [deletePerfumers, { isLoading: isDeleting, error: deleteError }] = useDeletePerfumerMutation();
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
    } = useGetAllPerfumesQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        sort: sortValue
    });
    if (isLoading) {
        return <Loader message="Fetching Perfumers" />;
    }

    // Process Perfumers data and add serial numbers
    const rawPerfumers = badgesResponse?.data?.perfumers || [];
    const totalPerfumers = badgesResponse?.data?.pagination?.totalCount || 0;
    const totalPages = badgesResponse?.data?.pagination?.totalPage || 1;

    // Add serial numbers and format data
    const Perfumers = rawPerfumers.map((perfumer, index) => ({
        ...perfumer,
        sno: (currentPage - 1) * itemsPerPage + index + 1,
        descriptionOuter: perfumer.description?.length > 50 ? `${perfumer.description.slice(0, 50)}...` : perfumer.description,
        joinedOn: perfumer.createdAt ? new Date(perfumer.createdAt).toLocaleDateString() : perfumer.joinedOn,
        image: perfumer?.bigImage ? perfumer?.bigImage?.startsWith('http')
            ? perfumer?.bigImage
            : `${import.meta.env.VITE_BASE_URL}${perfumer?.bigImage}` : user_icon
    }));

    const columns = [
        { label: '#', accessor: 'sno' },
        {
            label: 'Perfumer Name',
            accessor: 'name',
            type: 'imageWithName'
        },
        { label: 'Description', accessor: 'descriptionOuter' },
        { label: 'Created on', accessor: 'joinedOn' },
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

    const handleAddPerfumers = async (data) => {
        try {

            if (editPerfumersPopup && selectedPerfumers) {
                await updatePerfumers({ id: selectedPerfumers._id, data }).unwrap();
                toast.success('Perfumers updated successfully!');
                setEditPerfumersPopup(false);
            } else {
                await addPerfumers(data).unwrap();
                toast.success('Perfumers added successfully!');
                setAddPerfumersPopup(false);
            }

            setSelectedPerfumers(null);
            refetch();
        } catch (error) {
            console.error('Save error:', error);
            const errorMessage = error?.data?.message ||
                (editPerfumersPopup ? 'Failed to update perfumer' : 'Failed to add perfumer');
            toast.error(errorMessage);
        }
    };
    const deletePerfumersHandler = async (id, type) => {
        try {
            setViewPerfumersPopup(false);
            await deletePerfumers({ id: id, data: { type } }).unwrap();
            setSelectedPerfumers(null);
            setEditPerfumersPopup(false);
            setAddPerfumersPopup(false);
            toast.success('Perfumers deleted successfully!');
            refetch();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error?.data?.message || 'Failed to delete perfumer');
        }
    }
    // Error state
    if (error) {
        return (
            <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-4">
                            Error loading Perfumers: {error?.data?.message || error.message}
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
        { label: "Newest", value: "date_desc" },
        { label: "Oldest", value: "date_asc" },
        { label: "A-Z", value: "name_asc" },
        { label: "Z-A", value: "name_desc" }
    ];
    return (
        <>
            <div className="mb-[24px] flex">
                <button onClick={() => setAddPerfumersPopup(true)} className='btn-pri ml-auto'>Add Perfumers</button>
            </div>
            <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
                <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-4">
                    <div>
                        <h6 className="text-[20px] font-semibold text-[#352AA4]">
                            All Perfumers ({totalPerfumers})
                        </h6>

                    </div>
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={handleSearch}
                        sortValue={sortValue}
                        onSortChange={handleSortChange}
                        placeholder="Search Perfumers..."
                        loader={searchTerm !== debouncedSearchTerm}
                        options={options}
                    />
                </div>

                <Table
                    columns={columns}
                    data={Perfumers}
                    renderActions={(row) => (
                        <button
                            className="ml-auto cursor-pointer p-2 hover:bg-gray-100 rounded"
                            title={`View ${row.name}`}
                            onClick={() => {
                                setSelectedPerfumers(row);
                                setViewPerfumersPopup(true);
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

                {/* Show empty state when no Perfumers found */}
                {Perfumers.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No Perfumers found</p>
                        {searchTerm && (
                            <p className="text-gray-400 text-sm mt-2">
                                Try adjusting your search criteria
                            </p>
                        )}
                    </div>
                )}
            </div>
            {/* Modals */}
            {addPerfumersPopup && (
                <AddPerfumer
                    open={addPerfumersPopup}
                    onClose={() => setAddPerfumersPopup(false)}
                    onSubmit={handleAddPerfumers}
                />
            )}
            {editPerfumersPopup && selectedPerfumers && (
                <AddPerfumer
                    open={editPerfumersPopup}
                    onClose={() => setEditPerfumersPopup(false)}
                    onSubmit={handleAddPerfumers}
                    initialData={selectedPerfumers}
                />
            )}
            {viewPerfumersPopup && selectedPerfumers && (
                <ViewPerfumer
                    open={viewPerfumersPopup}
                    onClose={() => setViewPerfumersPopup(false)}
                    perfumerData={selectedPerfumers}
                    onEdit={() => {
                        setViewPerfumersPopup(false);
                        setEditPerfumersPopup(true);
                    }}
                    onRemove={deletePerfumersHandler}
                />
            )}
        </>
    );
};

export default ManagePerfumers;
