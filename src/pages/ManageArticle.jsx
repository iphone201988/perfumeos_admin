import React, { useEffect, useState } from 'react'
import search_icon from '../assets/icons/search-icon.svg'
import view_icon from '../assets/icons/view-icon.svg'
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import { useCreateArticleMutation, useDeleteArticleMutation, useGetArticlesQuery, useUpdateArticleMutation } from '../api';
import ManageUsersSkeleton from '../components/Skeleton/ManageUsersSkeleton';
import AddArticle from '../components/ManageArticle/AddArticle';
import ViewArticle from '../components/ManageArticle/ViewArticle ';

const columns = [
  { label: '#', accessor: 'sno' },
  { label: 'Title', accessor: 'title' },
  { label: 'Added on', accessor: 'joinedOn' },
];
const ManageArticle = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [addArticlePopup, setAddArticlePopup] = useState(false);
  const [viewArticlePopup, setViewArticlePopup] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editArticlePopup, setEditArticlePopup] = useState(false);

  const [addArticle] = useCreateArticleMutation();
  const [updateArticle] = useUpdateArticleMutation();
  const [deleteArticle] = useDeleteArticleMutation();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortValue(e.target.value);
    setCurrentPage(1);
  };
  const handleDeleteArticle = async (id) => {
    if(selectedArticle === null) return
    await deleteArticle(selectedArticle._id).unwrap();
    setViewArticlePopup(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  const itemsPerPage = 8;

  const {
    data: articlesResponse,
    error,
    isLoading,
    refetch
  } = useGetArticlesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchTerm,
    sort: sortValue
  });
  console.log("sortValue", sortValue)
  if (isLoading) {
    return <ManageUsersSkeleton />;
  }
  console.log("articlesResponse", articlesResponse);

  // Process articles data and add serial numbers
  const rawUsers = articlesResponse?.data?.articles || [];
  const totalCount = articlesResponse?.data?.pagination?.totalCount || 0;
  const totalPages = articlesResponse?.data?.pagination?.totalPage || 1;

  // Add serial numbers and format data
  const articles = rawUsers.map((article, index) => ({
    ...article,
    sno: (currentPage - 1) * itemsPerPage + index + 1,
    joinedOn: article.createdAt ? new Date(article.createdAt).toLocaleDateString() : article.createdAt,
    image: article?.image ? `${import.meta.env.VITE_BASE_URL}${article?.image}` : user_icon
  }));
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleAddArticle = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);

    if (data.image) {
      formData.append('file', data.image);
    }
    if (editArticlePopup) {
      console.log("editArticlePopup", data);
      await updateArticle({ id: selectedArticle._id, formData }).unwrap();
      setEditArticlePopup(false);
    } else {
      await addArticle(formData).unwrap();
      setAddArticlePopup(false);
    }
  };

  if (error) {
    return (
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">
              Error loading articles: {error?.data?.message || error.message}
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
      <div className='bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]'>
        <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-4">
          <div>
            <h6 className="text-[20px] font-semibold text-[#352AA4]">
              All Articles ({totalCount})
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
        {/* table */}
        <Table
          columns={columns}
          data={articles}
          renderActions={(row) => (
            <button
              className="ml-auto cursor-pointer p-2 hover:bg-gray-100 rounded"
              title={`View ${row.fullname}`}
              onClick={() => {
                setSelectedArticle(row);
                setViewArticlePopup(true);

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

        {/* Show empty state when no articles found */}
        {articles.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No articles found</p>
            {searchTerm && (
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-[24px] flex">
        <button onClick={() => setAddArticlePopup(true)} className='btn-pri ml-auto'>Add Article</button>
      </div>
      {addArticlePopup && <AddArticle open={addArticlePopup} onClose={() => setAddArticlePopup(false)} onSubmit={handleAddArticle} />}
      {viewArticlePopup && <ViewArticle open={viewArticlePopup} onClose={() => setViewArticlePopup(false)} data={selectedArticle} onEdit={() => {
        setEditArticlePopup(true);
        setViewArticlePopup(false);
      }} onRemove={() => handleDeleteArticle(selectedArticle._id)} />}
      {editArticlePopup && <AddArticle open={editArticlePopup} onClose={() => setEditArticlePopup(false)} data={selectedArticle} onSubmit={handleAddArticle} initialData={selectedArticle} />}
    </>
  )
}

export default ManageArticle
