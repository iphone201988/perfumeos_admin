import React, { useEffect, useState } from 'react';
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination';
import view_icon from '../assets/icons/view-icon.svg';
import user_icon from '../assets/user-img.png';
import { useCreateBadgeMutation, useDeleteBadgeMutation, useGetBadgesQuery, useUpdateBadgeMutation, } from '../api';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import AddBadge from '../components/ManageBadge/AddBadge';
import { toast } from 'react-toastify';
import ViewBadge from '../components/ManageBadge/ViewBadge';

const ManageBadge = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [addBadgePopup, setAddBadgePopup] = useState(false);
  const [viewBadgePopup, setViewBadgePopup] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [editBadgePopup, setEditBadgePopup] = useState(false);

  const navigate = useNavigate();
  const itemsPerPage = 5;
  const [addBadge, { isLoading: isAdding, error: addError }] = useCreateBadgeMutation();
  const [updateBadge, { isLoading: isUpdating, error: updateError }] = useUpdateBadgeMutation();
  const [deleteBadge, { isLoading: isDeleting, error: deleteError }] = useDeleteBadgeMutation();
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
  } = useGetBadgesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchTerm,
    sort: sortValue
  });
  console.log("sortValue", sortValue)
  if (isLoading) {
    return <Loader message="Fetching Badges" />;
  }
  console.log("badgesResponse", badgesResponse);

  // Process badges data and add serial numbers
  const rawBadges = badgesResponse?.data?.badges || [];
  const totalBadges = badgesResponse?.data?.pagination?.totalCount || 0;
  const totalPages = badgesResponse?.data?.pagination?.totalPage || 1;

  // Add serial numbers and format data
  const badges = rawBadges.map((badge, index) => ({
    ...badge,
    sno: (currentPage - 1) * itemsPerPage + index + 1,
    status: badge.isDeleted ? 'Suspended' : 'Active',
    joinedOn: badge.createdAt ? new Date(badge.createdAt).toLocaleDateString() : badge.joinedOn,
    image: badge?.image ? `${import.meta.env.VITE_BASE_URL}${badge?.image}` : user_icon
  }));

  const columns = [
    { label: '#', accessor: 'sno' },
    {
      label: 'Badge Name',
      accessor: 'name',
      type: 'imageWithName'
    },
    { label: 'Category', accessor: 'category', className: 'capitalize' },
    { label: 'Point Earned', accessor: 'pointEarned' },
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

  const handleAddBadge = async (data) => {
    try {
      const formData = new FormData();
      // Only append images if they are File objects (new uploads)
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      if (data.otherImage instanceof File) {
        formData.append('otherImage', data.otherImage);
      }

      // Append other fields...
      Object.keys(data).forEach(key => {
        if (key !== 'image' && key !== 'otherImage' && data[key] !== null && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      if (editBadgePopup && selectedBadge) {
        await updateBadge({ id: selectedBadge._id, formData }).unwrap();
        toast.success('Badge updated successfully!');
        setEditBadgePopup(false);
      } else {
        await addBadge(formData).unwrap();
        toast.success('Badge added successfully!');
        setAddBadgePopup(false);
      }

      setSelectedBadge(null);
      refetch();
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error?.data?.message ||
        (editBadgePopup ? 'Failed to update badge' : 'Failed to add badge');
      toast.error(errorMessage);
    }
  };
  const deleteBadgeHandler = async (id, type) => {
    try {
      console.log("id", id, type);
      await deleteBadge({ id: id, data: { type } }).unwrap();
      setSelectedBadge(null);
      setEditBadgePopup(false);
      setAddBadgePopup(false);
      setViewBadgePopup(false);
      toast.success('Badge deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error?.data?.message || 'Failed to delete badge');
    }
  }
  // Error state
  if (error) {
    return (
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">
              Error loading badges: {error?.data?.message || error.message}
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
    <>
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-4">
          <div>
            <h6 className="text-[20px] font-semibold text-[#352AA4]">
              All Badges ({totalBadges})
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
            placeholder="Search badges..."
          />
        </div>

        <Table
          columns={columns}
          data={badges}
          renderActions={(row) => (
            <button
              className="ml-auto cursor-pointer p-2 hover:bg-gray-100 rounded"
              title={`View ${row.name}`}
              onClick={() => {
                setSelectedBadge(row);
                setViewBadgePopup(true);
                console.log('View badge:', row);
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

        {/* Show empty state when no badges found */}
        {badges.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No badges found</p>
            {searchTerm && (
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-[24px] flex">
        <button onClick={() => setAddBadgePopup(true)} className='btn-pri ml-auto'>Add Badge</button>
      </div>
      {/* Modals */}
      {addBadgePopup && (
        <AddBadge
          open={addBadgePopup}
          onClose={() => setAddBadgePopup(false)}
          onSubmit={handleAddBadge}
        />
      )}
      {editBadgePopup && selectedBadge && (
        <AddBadge
          open={editBadgePopup}
          onClose={() => setEditBadgePopup(false)}
          onSubmit={handleAddBadge}
          initialData={selectedBadge}
        />
      )}
      {viewBadgePopup && selectedBadge && (
        <ViewBadge
          open={viewBadgePopup}
          onClose={() => setViewBadgePopup(false)}
          badgeData={selectedBadge}
          onEdit={() => {
            setViewBadgePopup(false);
            setEditBadgePopup(true);
          }}
          onRemove={deleteBadgeHandler}
        />
      )}
    </>
  );
};

export default ManageBadge;
