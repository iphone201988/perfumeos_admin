import React, { useEffect, useState, useCallback } from 'react';
import search_icon from '../assets/icons/search-icon.svg';
import view_icon from '../assets/icons/view-icon.svg';
import user_icon from '../assets/icons/user-icon.svg'; // Added missing import
import SearchBar from '../components/Table/SearchBar';
import Table from '../components/Table/Table';
import Pagination from '../components/Table/Pagination'; // Added missing import
import { useCreateArticleMutation, useDeleteArticleMutation, useGetArticlesQuery, useUpdateArticleMutation } from '../api';
import ManageUsersSkeleton from '../components/Skeleton/ManageUsersSkeleton';
import AddArticle from '../components/ManageArticle/AddArticle';
import ViewArticle from '../components/ManageArticle/ViewArticle ';
import Loader from '../components/Loader/Loader';
import { toast } from 'react-toastify';

const columns = [
  { label: '#', accessor: 'sno' },
  { label: 'Title', accessor: 'title' },
  { label: 'Added on', accessor: 'joinedOn' },
];

const DEBOUNCE_DELAY = 500; // Reduced from 2000ms
const ITEMS_PER_PAGE = 20;

const ManageArticle = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [addArticlePopup, setAddArticlePopup] = useState(false);
  const [viewArticlePopup, setViewArticlePopup] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editArticlePopup, setEditArticlePopup] = useState(false);

  // API hooks
  const [addArticle, { isLoading: isAdding, error: addError }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: isUpdating, error: updateError }] = useUpdateArticleMutation();
  const [deleteArticle, { isLoading: isDeleting, error: deleteError }] = useDeleteArticleMutation();

  const {
    data: articlesResponse,
    error,
    isLoading,
    refetch
  } = useGetArticlesQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearchTerm,
    sort: sortValue
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortValue(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleDeleteArticle = useCallback(async (id, type) => {
    if (!selectedArticle) {
      toast.error('No article selected');
      return;
    }

    try {
      await deleteArticle({ id: id, data: { type } }).unwrap();
      toast.success('Article deleted successfully!');
      setViewArticlePopup(false);
      setSelectedArticle(null);
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error?.data?.message || 'Failed to delete article');
    }
  }, [selectedArticle, deleteArticle, refetch]);

  const handleAddArticle = useCallback(async (data) => {
    if (!data.title?.trim() || !data.content?.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title.trim());
    formData.append('content', data.content.trim());

    if (data.image) {
      formData.append('file', data.image);
    }

    try {
      if (editArticlePopup && selectedArticle) {
        await updateArticle({ id: selectedArticle._id, formData }).unwrap();
        toast.success('Article updated successfully!');
        setEditArticlePopup(false);
      } else {
        await addArticle(formData).unwrap();
        toast.success('Article added successfully!');
        setAddArticlePopup(false);
      }

      setSelectedArticle(null);
      refetch();
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error?.data?.message ||
        (editArticlePopup ? 'Failed to update article' : 'Failed to add article');
      toast.error(errorMessage);
    }
  }, [editArticlePopup, selectedArticle, updateArticle, addArticle, refetch]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleViewArticle = useCallback((article) => {
    setSelectedArticle(article);
    setViewArticlePopup(true);
  }, []);

  const handleEditClick = useCallback(() => {
    setEditArticlePopup(true);
    setViewArticlePopup(false);
  }, []);

  const handleCloseAdd = useCallback(() => {
    setAddArticlePopup(false);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewArticlePopup(false);
    setSelectedArticle(null);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditArticlePopup(false);
    setSelectedArticle(null);
  }, []);

  // Process articles data
  const rawArticles = articlesResponse?.data?.articles || [];
  const totalCount = articlesResponse?.data?.pagination?.totalCount || 0;
  const totalPages = articlesResponse?.data?.pagination?.totalPage || 1;

  // Add serial numbers and format data
  const articles = rawArticles.map((article, index) => ({
    ...article,
    sno: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
    joinedOn: article.createdAt
      ? new Date(article.createdAt).toLocaleDateString()
      : 'N/A',
    image: article?.image
      ? `${import.meta.env.VITE_BASE_URL}${article.image}`
      : user_icon
  }));

  if (isLoading && currentPage === 1 && !debouncedSearchTerm) {
    return <Loader message="Fetching Articles" isVisible={true} />;
  }

  if (error) {
    return (
      <div className="bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4 font-semibold">
              Error loading articles
            </div>
            <div className="text-gray-600 mb-4">
              {error?.data?.message || error.message || 'Something went wrong'}
            </div>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-[#352AA4] text-white rounded hover:bg-[#2a217a] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOperationLoading = isAdding || isUpdating || isDeleting;

  return (
    <>
      {/* ✅ Operation loading overlay */}
      {isOperationLoading && (
        <Loader
          message={
            isDeleting ? 'Deleting article...' :
              isUpdating ? 'Updating article...' :
                'Adding article...'
          }
          isVisible={true}
        />
      )}

      {/* ✅ Enhanced add button section */}
      <div className="mb-[24px] flex">
        <button
          onClick={() => setAddArticlePopup(true)}
          className={`btn-pri ml-auto ${isOperationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isOperationLoading}
        >
          Add Article
        </button>
      </div>

      <div className='bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]'>
        <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-4">
          <div>
            <h6 className="text-[20px] font-semibold text-[#352AA4]">
              All Articles ({totalCount})
            </h6>
          </div>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            sortValue={sortValue}
            onSortChange={handleSortChange}
            placeholder="Search articles..."
            loader={searchTerm !== debouncedSearchTerm}

          />
        </div>

        {/* ✅ Loading indicator for subsequent pages */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center">
              <span className="animate-spin inline-block w-4 h-4 border border-blue-500 border-t-transparent rounded-full mr-2"></span>
              Loading articles...
            </div>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          data={articles}
          renderActions={(row) => (
            <button
              className="ml-auto cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors"
              title={`View ${row.title}`}
              onClick={() => handleViewArticle(row)}
              disabled={isOperationLoading}
            >
              <img src={view_icon} alt="View" className="w-5 h-5" />
            </button>
          )}
        />

        {/* ✅ Enhanced pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* ✅ Enhanced empty state */}
        {articles.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <p className="text-gray-500 text-lg mb-2">
              {debouncedSearchTerm ? 'No articles found' : 'No articles yet'}
            </p>
            {debouncedSearchTerm ? (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">
                  Try adjusting your search criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDebouncedSearchTerm('');
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Click "Add Article" to create your first article
              </p>
            )}
          </div>
        )}
      </div>


      {/* Modals */}
      {addArticlePopup && (
        <AddArticle
          open={addArticlePopup}
          onClose={handleCloseAdd}
          onSubmit={handleAddArticle}
        />
      )}

      {viewArticlePopup && selectedArticle && (
        <ViewArticle
          open={viewArticlePopup}
          onClose={handleCloseView}
          data={selectedArticle}
          onEdit={handleEditClick}
          onRemove={handleDeleteArticle}
        />
      )}

      {editArticlePopup && selectedArticle && (
        <AddArticle
          open={editArticlePopup}
          onClose={handleCloseEdit}
          data={selectedArticle}
          onSubmit={handleAddArticle}
          initialData={selectedArticle}
        />
      )}
    </>
  );
};

export default ManageArticle;
