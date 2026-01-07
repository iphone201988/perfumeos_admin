import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import view_icon from '../assets/icons/view-icon.svg';
import user_icon from '../assets/icons/user-icon.svg';
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination';
import Loader from '../components/Loader/Loader';
import { useGetBrandsQuery, useDeleteBrandMutation } from '../api';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/Modal/ConfirmationModal';

const ManageBrands = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortValue, setSortValue] = useState('createdAt_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Delete Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();
    const itemsPerPage = 20;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const {
        data: brandsResponse,
        error,
        isLoading,
        refetch
    } = useGetBrandsQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        sort: sortValue
    });

    const [deleteBrand] = useDeleteBrandMutation();

    if (isLoading) {
        return <Loader message="Fetching Brands..." />;
    }

    const rawBrands = brandsResponse?.data?.brands || [];
    const totalBrands = brandsResponse?.data?.pagination?.totalCount || 0;
    const totalPages = brandsResponse?.data?.pagination?.totalPage || 1;
    const getImageUrl = (imagePath) => {
        if (!imagePath) return user_icon
        return imagePath.startsWith('http')
            ? imagePath
            : `${import.meta.env.VITE_BASE_URL}${imagePath}`
    }
    const brands = rawBrands.map((brand, index) => ({
        ...brand,
        sno: (currentPage - 1) * itemsPerPage + index + 1,
        image: getImageUrl(brand?.image),
    }));

    const columns = [
        { label: '#', accessor: 'sno' },
        { label: 'Logo', accessor: 'image', type: 'image' },
        { label: 'Name', accessor: 'name' },
        {
            label: 'Description',
            accessor: 'description',
            render: (text) => (
                <div className="truncate max-w-[200px]" title={text}>
                    {text}
                </div>
            )
        },
        { label: 'Country', accessor: 'country' },
        { label: 'Perfumes', accessor: 'totalPerfumes' },
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

    const handleView = (id) => {
        navigate(`/brands/${id}`);
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeleting(true);
            await deleteBrand(itemToDelete).unwrap();
            toast.success("Brand deleted successfully");
            setItemToDelete(null);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete brand");
        } finally {
            setModalOpen(false);
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="mb-[24px] flex">
                <button onClick={() => navigate("/brands/add")} className='btn-pri ml-auto'>Add Brand</button>
            </div>
            <div className='bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]'>
                <div className="flex justify-between items-center flex-wrap max-md:gap-[12px]">
                    <div>
                        <h6 className="text-[20px] font-semibold text-[#352AA4]">
                            All Brands ({totalBrands})
                        </h6>
                        {searchTerm !== debouncedSearchTerm && (
                            <p className="text-sm text-gray-500 mt-1">Searching...</p>
                        )}
                    </div>
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={handleSearch}
                        sortValue={sortValue}
                        onSortChange={handleSortChange}
                        placeholder="Search brands..."
                        loader={searchTerm !== debouncedSearchTerm}
                    />
                </div>

                <Table
                    columns={columns}
                    data={brands}
                    renderActions={(row) => (
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleView(row._id)} className="cursor-pointer" title={`View ${row.name}`}>
                                <img src={view_icon} alt="View" />
                            </button>
                            <button onClick={() => handleDelete(row._id)} className="cursor-pointer p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200" title={`Delete ${row.name}`}>
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

                {brands.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No brands found</p>
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
                message="Are you sure you want to delete this brand?"
                isLoading={isDeleting}
            />
        </>
    );
};

export default ManageBrands;
