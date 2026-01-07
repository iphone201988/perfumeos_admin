import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetBrandByIdQuery, useGetPerfumeQuery } from '../../api';
import Loader from '../Loader/Loader';
import Table from '../Table/Table';
import view_icon from '../../assets/icons/view-icon.svg';
import SearchBar from '../Table/SearchBar';
import Pagination from '../Table/Pagination';

const BrandDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const itemsPerPage = 10;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Brand Details
    const { data: brandData, isLoading: brandLoading } = useGetBrandByIdQuery(id);
    const brand = brandData?.data;

    // Fetch Related Perfumes
    const { data: perfumesResponse, isLoading: perfumesLoading } = useGetPerfumeQuery({
        page: currentPage,
        limit: itemsPerPage,
        brandId: id || '',
        search: debouncedSearchTerm,
    });

    if (brandLoading) return <Loader message="Loading Brand Details..." />;
    if (!brand) return <div className="p-8 text-center text-gray-500">Brand not found</div>;

    const perfumes = perfumesResponse?.data?.perfumes || [];
    const totalPerfumes = perfumesResponse?.data?.pagination?.totalCount || 0;
    const totalPages = perfumesResponse?.data?.pagination?.totalPage || 1;

    // Map perfumes for table
    const relatedPerfumes = perfumes.map((perfume, index) => ({
        ...perfume,
        sno: (currentPage - 1) * itemsPerPage + index + 1,
        image: perfume?.image ? (perfume?.image.startsWith('http') ? perfume?.image : `${import.meta.env.VITE_BASE_URL}${perfume?.image}`) : null,
        gender: perfume.intendedFor?.join(', ') || 'Unknown',
        brandName: perfume.brand?.name || perfume.brand || 'N/A' // Handle populated or unpopulated brand
    }));

    const columns = [
        { label: '#', accessor: 'sno' },
        { label: 'Image', accessor: 'image', type: 'image' },
        { label: 'Name', accessor: 'name' },
        { label: 'Brand', accessor: 'brandName' },
        { label: 'Gender', accessor: 'gender', className: 'capitalize' },
    ];

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[30px] shadow-sm">
                <div className="flex items-center gap-4">
                    {brand.image && (
                        <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                            <img
                                src={brand.image.startsWith('http') ? brand.image : `${import.meta.env.VITE_BASE_URL}${brand.image}`}
                                alt={brand.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-[#352AA4]">{brand.name}</h1>
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                            {brand.website}
                        </a>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/brands')}
                        className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => navigate(`/brands/${id}/edit`)}
                        className="px-5 py-2.5 rounded-full bg-[#352AA4] text-white hover:bg-[#2a2183] font-medium"
                    >
                        Edit Brand
                    </button>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-[30px] shadow-sm">
                        <h3 className="text-lg font-bold text-[#352AA4] mb-4">About the Brand</h3>
                        <div className="prose max-w-none text-gray-600">
                            <h4 className="font-semibold text-gray-800">Description</h4>
                            <p className="mb-4">{brand.description || 'No description available.'}</p>

                            {brand.foundingInfo && (
                                <>
                                    <h4 className="font-semibold text-gray-800">Founding Info</h4>
                                    <p className="mb-4">{brand.foundingInfo}</p>
                                </>
                            )}

                            {brand.generalInfo && (
                                <>
                                    <h4 className="font-semibold text-gray-800">General Info</h4>
                                    <p>{brand.generalInfo}</p>
                                </>
                            )}
                        </div>
                    </div>


                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[30px] shadow-sm">
                        <h3 className="text-lg font-bold text-[#352AA4] mb-4">Quick Facts</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Founder</label>
                                <p className="text-gray-800 font-medium">{brand.founder || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Founding Year</label>
                                <p className="text-gray-800 font-medium">{brand.foundingYear || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Country</label>
                                <p className="text-gray-800 font-medium">{brand.country || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Related Perfumes Table */}
            <div className="bg-[#E1F8F8] p-6 rounded-[30px] shadow-sm">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h3 className="text-lg font-bold text-[#352AA4]">Related Perfumes ({totalPerfumes})</h3>
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={handleSearch}
                        placeholder="Search perfumes..."
                        loader={searchTerm !== debouncedSearchTerm}
                        // Hide sort for now as it wasn't explicitly requested and adds complexity with limited space
                        hideSort
                    />
                </div>

                {perfumesLoading ? (
                    <div className="text-center py-4">Loading perfumes...</div>
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={relatedPerfumes}
                            renderActions={(row) => (
                                <button onClick={() => navigate(`/perfumes/${row._id}`)} className="ml-auto cursor-pointer" title={`View ${row.name}`}>
                                    <img src={view_icon} alt="View" />
                                </button>
                            )}
                        />
                        {totalPages > 1 && (
                            <div className="mt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
                {relatedPerfumes.length === 0 && !perfumesLoading && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No related perfumes found.</p>
                        {searchTerm && (
                            <p className="text-gray-400 text-sm mt-1">Try changing your search term.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandDetails;
