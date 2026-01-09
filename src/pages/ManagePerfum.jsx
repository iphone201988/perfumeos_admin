import React, { useEffect, useState } from 'react'
import search_icon from '../assets/icons/search-icon.svg'
import view_icon from '../assets/icons/view-icon.svg'
import perfume_icon from '../assets/icons/perfume-icon.svg'
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination';
import { useGetPerfumeQuery } from '../api';
import { useNavigate } from 'react-router-dom';
import ManageUsersSkeleton from '../components/Skeleton/ManageUsersSkeleton';
import Loader from '../components/Loader/Loader';

const ManagePerfum = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('createdAt_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const navigate = useNavigate();
  const itemsPerPage = 20;
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  const {
    data: perfumesResponse,
    error,
    isLoading,
    refetch
  } = useGetPerfumeQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchTerm,
    sort: sortValue
  });
  if (isLoading) {
    return <Loader message="Fetching Perfumes" />;
  }

  // Process users data and add serial numbers
  const rawPerfumes = perfumesResponse?.data?.perfumes || [];
  const totalPerfumes = perfumesResponse?.data?.pagination?.totalCount || 0;
  const totalPages = perfumesResponse?.data?.pagination?.totalPage || 1;
  const perfumes = rawPerfumes.map((perfume, index) => ({
    ...perfume,
    sno: (currentPage - 1) * itemsPerPage + index + 1,
    status: perfume.isDeleted ? 'Suspended' : 'Active',
    joinedOn: perfume.createdAt
      ? new Date(perfume.createdAt).toLocaleDateString()
      : perfume.joinedOn,
    image: perfume?.image ? perfume?.image.startsWith('http') ? perfume?.image
      : `${import.meta.env.VITE_BASE_URL}${perfume?.image}`
      : perfume_icon,
    gender:
      perfume.intendedFor?.includes('men') &&
        perfume.intendedFor?.includes('women')
        ? 'Unisex'
        : perfume.intendedFor?.join(', ') || 'Unknown',
  }));




  const columns = [
    { label: '#', accessor: 'sno' },
    { label: 'Name', accessor: 'name', type: 'imageWithName' },
    // { label: 'Name', accessor: 'name' },
    { label: 'Brand', accessor: 'brand' },
    { label: 'Gender ', accessor: 'gender', className: 'capitalize' },
    { label: 'Reviews', accessor: 'reviewCount' },
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
    navigate(`/perfumes/${id}`);
  };

  return (
    <>
      <div className="mb-[24px] flex">
        <button onClick={() => navigate("/perfumes/add")} className='btn-pri ml-auto'>Add Perfum</button>
      </div>
      <div className='bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]'>
        <div className="flex justify-between items-center flex-wrap max-md:gap-[12px]">
          <div>
            <h6 className="text-[20px] font-semibold text-[#352AA4]">
              All Perfumes ({totalPerfumes})
            </h6>
            {/* Show search indicator */}
            {searchTerm !== debouncedSearchTerm && (
              <p className="text-sm text-gray-500 mt-1">Searching...</p>
            )}
          </div>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            sortValue={sortValue}
            onSortChange={handleSortChange}
            placeholder="Search perfumes..."
            loader={searchTerm !== debouncedSearchTerm}
          />
        </div>
        {/* table */}
        <Table
          columns={columns}
          data={perfumes}
          renderActions={(row) => (
            <button onClick={() => handleView(row._id)} className="ml-auto cursor-pointer" title={`View ${row.name}`}>
              <img src={view_icon} alt="View" />
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

        {/* Show empty state when no perfumes found */}
        {perfumes.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No perfumes found</p>
            {searchTerm && (
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        )}
      </div>

    </>
  )
}

export default ManagePerfum
