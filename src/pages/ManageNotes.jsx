import React, { useEffect, useState } from 'react';
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination';
import view_icon from '../assets/icons/view-icon.svg';
import user_icon from '../assets/user-img.png';
import {
    useGetAllNotesQuery,
    useAddNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation
} from '../api';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import { toast } from 'react-toastify';
import ViewNote from '../components/ManageNotes/ViewNote';
import AddNote from '../components/ManageNotes/AddNote';

const ManageNotes = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortValue, setSortValue] = useState('createdAt_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [addNotesPopup, setAddNotesPopup] = useState(false);
    const [viewNotesPopup, setViewNotesPopup] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState(null);
    const [editNotesPopup, setEditNotesPopup] = useState(false);

    const navigate = useNavigate();
    const itemsPerPage = 20;
    const [addNotes, { isLoading: isAdding, error: addError }] = useAddNoteMutation();
    const [updateNotes, { isLoading: isUpdating, error: updateError }] = useUpdateNoteMutation();
    const [deleteNotes, { isLoading: isDeleting, error: deleteError }] = useDeleteNoteMutation();
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
    } = useGetAllNotesQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        sort: sortValue
    });
    if (isLoading) {
        return <Loader message="Fetching Notes" />;
    }

    // Process Notes data and add serial numbers
    const rawNotes = badgesResponse?.data?.notes || [];
    const totalNotes = badgesResponse?.data?.pagination?.totalCount || 0;
    const totalPages = badgesResponse?.data?.pagination?.totalPage || 1;

    // Add serial numbers and format data
    const Notes = rawNotes.map((note, index) => ({
        ...note,
        sno: (currentPage - 1) * itemsPerPage + index + 1,
        status: note.isDeleted ? 'Suspended' : 'Active',
        joinedOn: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : note.joinedOn,
        image: note?.image ? note?.image?.startsWith('http')
            ? note?.image
            : `${import.meta.env.VITE_BASE_URL}${note?.image}` : user_icon
    }));

    const columns = [
        { label: '#', accessor: 'sno' },
        {
            label: 'Notes Name',
            accessor: 'name',
            type: 'imageWithName'
        },
        { label: 'Scientific Name', accessor: 'scientificName' },
        { label: 'Group', accessor: 'group' },
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

    const handleAddNotes = async (data) => {
        try {

            if (editNotesPopup && selectedNotes) {
                await updateNotes({ id: selectedNotes._id, data }).unwrap();
                toast.success('Notes updated successfully!');
                setEditNotesPopup(false);
            } else {
                await addNotes(data).unwrap();
                toast.success('Notes added successfully!');
                setAddNotesPopup(false);
            }

            setSelectedNotes(null);
            refetch();
        } catch (error) {
            console.error('Save error:', error);
            const errorMessage = error?.data?.message ||
                (editNotesPopup ? 'Failed to update note' : 'Failed to add note');
            toast.error(errorMessage);
        }
    };
    const deleteNotesHandler = async (id, type) => {
        try {
            setViewNotesPopup(false);
            await deleteNotes({ id: id, data: { type } }).unwrap();
            setSelectedNotes(null);
            setEditNotesPopup(false);
            setAddNotesPopup(false);
            toast.success('Notes deleted successfully!');
            refetch();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error?.data?.message || 'Failed to delete note');
        }
    }
    // Error state
    if (error) {
        return (
            <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-4">
                            Error loading Notes: {error?.data?.message || error.message}
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
        { label: "Newest", value: "createdAt_desc" },
        { label: "Oldest", value: "createdAt_asc" },
        { label: "A-Z", value: "name_asc" },
        { label: "Z-A", value: "name_desc" }
    ];
    return (
        <>
            <div className="mb-[24px] flex">
                <button onClick={() => setAddNotesPopup(true)} className='btn-pri ml-auto'>Add Notes</button>
            </div>
            <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
                <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-4">
                    <div>
                        <h6 className="text-[20px] font-semibold text-[#352AA4]">
                            All Notes ({totalNotes})
                        </h6>
                    </div>
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={handleSearch}
                        sortValue={sortValue}
                        onSortChange={handleSortChange}
                        placeholder="Search Notes..."
                        loader={searchTerm !== debouncedSearchTerm}
                        options={options}
                    />
                </div>

                <Table
                    columns={columns}
                    data={Notes}
                    renderActions={(row) => (
                        <button
                            className="ml-auto cursor-pointer p-2 hover:bg-gray-100 rounded"
                            title={`View ${row.name}`}
                            onClick={() => {
                                setSelectedNotes(row);
                                setViewNotesPopup(true);
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

                {/* Show empty state when no Notes found */}
                {Notes.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No Notes found</p>
                        {searchTerm && (
                            <p className="text-gray-400 text-sm mt-2">
                                Try adjusting your search criteria
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {addNotesPopup && (
                <AddNote
                    open={addNotesPopup}
                    onClose={() => setAddNotesPopup(false)}
                    onSubmit={handleAddNotes}
                />
            )}
            {editNotesPopup && selectedNotes && (
                <AddNote
                    open={editNotesPopup}
                    onClose={() => setEditNotesPopup(false)}
                    onSubmit={handleAddNotes}
                    initialData={selectedNotes}
                />
            )}
            {viewNotesPopup && selectedNotes && (
                <ViewNote
                    open={viewNotesPopup}
                    onClose={() => setViewNotesPopup(false)}
                    noteData={selectedNotes}
                    onEdit={() => {
                        setViewNotesPopup(false);
                        setEditNotesPopup(true);
                    }}
                    onRemove={deleteNotesHandler}
                />
            )}
        </>
    );
};

export default ManageNotes;
