import React, { useEffect, useState } from 'react';
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination';
import view_icon from '../assets/icons/view-icon.svg';
import user_icon from '../assets/user-img.png';
import { useUsersDetailsQuery } from '../api';
import ManageUsersSkeleton from '../components/Skeleton/ManageUsersSkeleton';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader';

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const navigate = useNavigate();
  const itemsPerPage = 5;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: usersResponse,
    error,
    isLoading,
    refetch
  } = useUsersDetailsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchTerm,
    sort: sortValue
  });
  if (isLoading) {
     return <Loader message="Fetching Users" />;
  }

  // Process users data and add serial numbers
  const rawUsers = usersResponse?.data?.users || [];
  const totalUsers = usersResponse?.data?.pagination?.totalCount || 0;
  const totalPages = usersResponse?.data?.pagination?.totalPage || 1;

  // Add serial numbers and format data
  const users = rawUsers.map((user, index) => ({
    ...user,
    sno: (currentPage - 1) * itemsPerPage + index + 1,
    status: user.isDeleted ? 'Suspended' : 'Active',
    joinedOn: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : user.joinedOn,
    image: user?.profileImage ? `${import.meta.env.VITE_BASE_URL}${user?.profileImage}` : user_icon
  }));

  const columns = [
    { label: '#', accessor: 'sno' },
    {
      label: 'User',
      accessor: 'fullname',
      type: 'imageWithName' // Show image with name
    },
    { label: 'Email', accessor: 'email' },
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
  const handleViewRedirect = (userId) => {
    navigate(`/users/${userId}`);
  };

  // Error state
  if (error) {
    return (
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">
              Error loading users: {error?.data?.message || error.message}
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

  return (
    <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
      <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-4">
        <div>
          <h6 className="text-[20px] font-semibold text-[#352AA4]">
            All Users ({totalUsers})
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
        />
      </div>

      <Table
        columns={columns}
        data={users}
        renderActions={(row) => (
          <button
            className="ml-auto cursor-pointer p-2 hover:bg-gray-100 rounded"
            title={`View ${row.fullname}`}
            onClick={() => {
              handleViewRedirect(row._id);
              console.log('View user:', row);
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

      {/* Show empty state when no users found */}
      {users.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No users found</p>
          {searchTerm && (
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search criteria
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
