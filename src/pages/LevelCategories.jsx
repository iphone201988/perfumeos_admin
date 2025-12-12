// src/pages/LevelCategories.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    useGetLevelCategoriesQuery,
    useCreateLevelCategoryMutation,
    useUpdateLevelCategoryMutation,
    useDeleteLevelCategoryMutation
} from '../api';
import LevelCategoryList from '../components/ManageLevelQuiz/LevelCategoryList';
import CategoryModal from '../components/ManageLevelQuiz/CategoryModal';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import Loader from '../components/Loader/Loader';

const LevelCategories = () => {
    const navigate = useNavigate();
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [categoryPage, setCategoryPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // API Hooks
    const { data: categoriesData, isLoading: categoriesLoading, isFetching: categoriesFetching } =
        useGetLevelCategoriesQuery({ page: categoryPage, limit: ITEMS_PER_PAGE });

    // Mutations
    const [createCategory, { isLoading: createCategoryLoading }] = useCreateLevelCategoryMutation();
    const [updateCategory, { isLoading: updateCategoryLoading }] = useUpdateLevelCategoryMutation();
    const [deleteCategory, { isLoading: deleteCategoryLoading }] = useDeleteLevelCategoryMutation();

    const categories = categoriesData?.data || [];
    const categoryTotal = categoriesData?.total || 0;
    const categoryHasMore = categories.length < categoryTotal;

    const isOperationLoading = createCategoryLoading || updateCategoryLoading || deleteCategoryLoading;

    // Get loader message
    const getLoaderMessage = () => {
        if (createCategoryLoading) return { message: 'Creating Level Category', title: 'Please wait...' };
        if (updateCategoryLoading) return { message: 'Updating Level Category', title: 'Saving changes...' };
        if (deleteCategoryLoading) return { message: 'Deleting Level Category', title: 'Please wait...' };
        return { message: 'Processing...', title: 'Please wait...' };
    };

    // Category Handlers
    const handleAddCategory = () => {
        setEditingCategory(null);
        setShowCategoryModal(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setShowCategoryModal(true);
    };

    const handleDeleteCategory = (category) => {
        setDeleteConfirmation({
            item: category,
            title: 'Delete Level Category',
            message: `Are you sure you want to delete "${category.name}"? This will delete all quizzes and questions in this category.`
        });
    };

    const handleSaveCategory = async (categoryData) => {
        try {
            if (editingCategory) {
                await updateCategory({ id: editingCategory._id, data: categoryData }).unwrap();
                toast.success('Category updated successfully!');
            } else {
                await createCategory(categoryData).unwrap();
                toast.success('Category created successfully!');
                setCategoryPage(1);
            }
            setShowCategoryModal(false);
            setEditingCategory(null);
        } catch (error) {
            console.error('Save category error:', error);
            toast.error(error?.data?.message || 'Failed to save category');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;

        try {
            await deleteCategory(deleteConfirmation.item._id).unwrap();
            toast.success('Category deleted successfully!');
            setCategoryPage(1);
            setDeleteConfirmation(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error?.data?.message || 'Failed to delete');
        }
    };

    const handleLoadMoreCategories = () => {
        if (!categoriesFetching && categoryHasMore) {
            setCategoryPage(prev => prev + 1);
        }
    };

    const handleSelectCategory = (category) => {
        navigate(`/level-quiz/${category._id}/quizzes`, {
            state: { categoryName: category.name, levelNo: category.levelNo }
        });
    };

    if (categoriesLoading) {
        return <Loader message="Loading Level Categories..." />;
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Operation Loading Overlay */}
            {isOperationLoading && (
                <Loader
                    message={getLoaderMessage().message}
                    title={getLoaderMessage().title}
                    isVisible={true}
                />
            )}

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                        <h1 className="text-[24px] font-bold text-[#352AA4]">Level Categories</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddCategory}
                            disabled={isOperationLoading}
                            className="bg-[#352AA4] text-white px-6 py-2.5 rounded-full hover:bg-[#2a2183] transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Category
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <LevelCategoryList
                        categories={categories}
                        selectedCategory={null}
                        onSelectCategory={handleSelectCategory}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={handleDeleteCategory}
                        isLoading={categoriesLoading}
                        isFetching={categoriesFetching}
                        hasMore={categoryHasMore}
                        onLoadMore={handleLoadMoreCategories}
                        total={categoryTotal}
                    />
                </div>
            </div>

            {/* Modals */}
            <CategoryModal
                isOpen={showCategoryModal}
                onClose={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                }}
                onSave={handleSaveCategory}
                category={editingCategory}
                isLoading={isOperationLoading}
            />

            <ConfirmationModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={handleConfirmDelete}
                title={deleteConfirmation?.title}
                message={deleteConfirmation?.message}
                confirmText="Delete"
                cancelText="Cancel"
                confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
                isLoading={isOperationLoading}
            />
        </div>
    );
};

export default LevelCategories;
