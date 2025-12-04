// src/pages/ManageFAQ.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useGetFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
  useToggleFAQStatusMutation
} from '../api';
import FAQList from '../components/ManageFAQ/FAQList';
import FAQModal from '../components/ManageFAQ/FAQModal';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import Loader from '../components/Loader/Loader';

const FAQ_TYPES = ['General', 'Account', 'Services', "Subscription"];

const ManageFAQ = () => {
  const [selectedType, setSelectedType] = useState('General');
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // API Hooks
  const { data: faqsData, isLoading, isFetching } = useGetFAQsQuery({
    type: selectedType,
    page,
    limit: ITEMS_PER_PAGE
  });

  const [createFAQ, { isLoading: createLoading }] = useCreateFAQMutation();
  const [updateFAQ, { isLoading: updateLoading }] = useUpdateFAQMutation();
  const [deleteFAQ, { isLoading: deleteLoading }] = useDeleteFAQMutation();
  const [toggleFAQStatus] = useToggleFAQStatusMutation();

  const faqs = faqsData?.data || [];
  const total = faqsData?.total || 0;
  const hasMore = faqs.length < total;
  const isOperationLoading = createLoading || updateLoading || deleteLoading;

  // Handlers
  const handleAddFAQ = () => {
    setEditingFAQ(null);
    setShowFAQModal(true);
  };

  const handleEditFAQ = (faq) => {
    setEditingFAQ(faq);
    setShowFAQModal(true);
  };

  const handleDeleteFAQ = (faq) => {
    setDeleteConfirmation({
      item: faq,
      title: 'Delete FAQ',
      message: `Are you sure you want to delete this FAQ: "${faq.question}"?`
    });
  };

  const handleSaveFAQ = async (faqData) => {
    try {
      if (editingFAQ) {
        await updateFAQ({ id: editingFAQ._id, data: faqData }).unwrap();
        toast.success('FAQ updated successfully!');
      } else {
        await createFAQ(faqData).unwrap();
        toast.success('FAQ created successfully!');
        setPage(1);
      }
      setShowFAQModal(false);
      setEditingFAQ(null);
    } catch (error) {
      console.error('Save FAQ error:', error);
      toast.error(error?.data?.message || 'Failed to save FAQ');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      await deleteFAQ(deleteConfirmation.item._id).unwrap();
      toast.success('FAQ deleted successfully!');
      setDeleteConfirmation(null);
      setPage(1);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error?.data?.message || 'Failed to delete FAQ');
    }
  };

  const handleToggleStatus = async (faqId, currentStatus) => {
    try {
      await toggleFAQStatus({ id: faqId, isActive: !currentStatus }).unwrap();
      toast.success(`FAQ ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error?.data?.message || 'Failed to toggle FAQ status');
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (isLoading) {
    return <Loader message="Loading FAQs..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Operation Loading Overlay */}
      {isOperationLoading && (
        <Loader
          message={
            createLoading ? 'Creating...' :
            updateLoading ? 'Updating...' :
            'Deleting...'
          }
          isVisible={true}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
            <h1 className="text-[24px] font-bold text-[#352AA4]">Manage FAQs</h1>
          </div>
          <button
            onClick={handleAddFAQ}
            disabled={isOperationLoading}
            className="bg-[#352AA4] text-white px-6 py-2.5 rounded-full hover:bg-[#2a2183] transition-all font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add FAQ
          </button>
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#352AA4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Filter by Type</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          {FAQ_TYPES.map((type) => {
            const typeCount = faqsData?.typeCounts?.[type] || 0;
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedType === type
                    ? 'bg-[#352AA4] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                  {typeCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ List */}
      <FAQList
        faqs={faqs}
        selectedType={selectedType}
        onEdit={handleEditFAQ}
        onDelete={handleDeleteFAQ}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
        isFetching={isFetching}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        total={total}
      />

      {/* FAQ Modal */}
      <FAQModal
        isOpen={showFAQModal}
        onClose={() => {
          setShowFAQModal(false);
          setEditingFAQ(null);
        }}
        onSave={handleSaveFAQ}
        faq={editingFAQ}
        defaultType={selectedType}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleConfirmDelete}
        title={deleteConfirmation?.title}
        message={deleteConfirmation?.message}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default ManageFAQ;
