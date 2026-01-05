// src/pages/LevelQuizzes.jsx
import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    useGetLevelQuizzesByCategoryQuery,
    useCreateLevelQuizMutation,
    useUpdateLevelQuizMutation,
    useDeleteLevelQuizMutation
} from '../api';
import LevelQuizList from '../components/ManageLevelQuiz/LevelQuizList';
import QuizModal from '../components/ManageLevelQuiz/QuizModal';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import Loader from '../components/Loader/Loader';

const LevelQuizzes = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams();
    const location = useLocation();
    const { categoryName, levelNo } = location.state || {};

    const [showQuizModal, setShowQuizModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [quizPage, setQuizPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // API Hooks
    const { data: quizzesData, isLoading: quizzesLoading, isFetching: quizzesFetching } =
        useGetLevelQuizzesByCategoryQuery(
            { categoryId, page: quizPage, limit: ITEMS_PER_PAGE },
            { skip: !categoryId }
        );

    // Mutations
    const [createQuiz, { isLoading: createQuizLoading }] = useCreateLevelQuizMutation();
    const [updateQuiz, { isLoading: updateQuizLoading }] = useUpdateLevelQuizMutation();
    const [deleteQuiz, { isLoading: deleteQuizLoading }] = useDeleteLevelQuizMutation();

    const quizzes = quizzesData?.data || [];
    const quizTotal = quizzesData?.total || 0;
    const quizHasMore = quizzes.length < quizTotal;

    const isOperationLoading = createQuizLoading || updateQuizLoading || deleteQuizLoading;

    // Get loader message
    const getLoaderMessage = () => {
        if (createQuizLoading) return { message: 'Creating Quiz', title: 'Please wait...' };
        if (updateQuizLoading) return { message: 'Updating Quiz', title: 'Saving changes...' };
        if (deleteQuizLoading) return { message: 'Deleting Quiz', title: 'Please wait...' };
        return { message: 'Processing...', title: 'Please wait...' };
    };

    // Quiz Handlers
    const handleAddQuiz = () => {
        setEditingQuiz(null);
        setShowQuizModal(true);
    };

    const handleEditQuiz = (quiz) => {
        setEditingQuiz(quiz);
        setShowQuizModal(true);
    };

    const handleDeleteQuiz = (quiz) => {
        setDeleteConfirmation({
            item: quiz,
            title: 'Delete Quiz',
            message: `Are you sure you want to delete "${quiz.title}"? This will delete all questions in this quiz.`
        });
    };

    const handleSaveQuiz = async (quizData) => {
        try {
            const payload = {
                ...quizData,
                levelCategoryId: categoryId
            };

            if (editingQuiz) {
                await updateQuiz({ id: editingQuiz._id, data: payload }).unwrap();
                toast.success('Quiz updated successfully!');
            } else {
                await createQuiz(payload).unwrap();
                toast.success('Quiz created successfully!');
                setQuizPage(1);
            }
            setShowQuizModal(false);
            setEditingQuiz(null);
        } catch (error) {
            console.error('Save quiz error:', error);
            toast.error(error?.data?.message || 'Failed to save quiz');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;

        try {
            await deleteQuiz(deleteConfirmation.item._id).unwrap();
            toast.success('Quiz deleted successfully!');
            setQuizPage(1);
            setDeleteConfirmation(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error?.data?.message || 'Failed to delete');
        }
    };

    const handleLoadMoreQuizzes = () => {
        if (!quizzesFetching && quizHasMore) {
            setQuizPage(prev => prev + 1);
        }
    };

    const handleSelectQuiz = (quiz) => {
        navigate(`/level-quiz/${categoryId}/quizzes/${quiz._id}/questions`, {
            state: { categoryName, levelNo, quizTitle: quiz.title, quizNo: quiz.quizNo }
        });
    };

    const handleBackToCategories = () => {
        navigate('/level-quiz');
    };

    if (quizzesLoading) {
        return <Loader message="Loading Quizzes..." />;
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

            {/* Header with Back Button */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBackToCategories}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to Categories"
                        >
                            <svg className="w-6 h-6 text-[#352AA4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                        <div>
                            <h1 className="text-[24px] font-bold text-[#352AA4]">Level Quizzes</h1>
                            {categoryName && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {categoryName} {levelNo && `(Level ${levelNo})`}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddQuiz}
                            disabled={isOperationLoading || quizzesData?.isPromotionQuizAdded}
                            className="bg-[#352AA4] text-white px-6 py-2.5 rounded-full hover:bg-[#2a2183] transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Quiz
                        </button>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            {/* <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                    <button
                        onClick={handleBackToCategories}
                        className="text-gray-600 hover:text-[#352AA4] transition-colors"
                    >
                        Level Categories
                    </button>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[#352AA4] font-medium">{categoryName || 'Quizzes'}</span>
                </div>
            </div> */}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    <LevelQuizList
                        quizzes={quizzes}
                        selectedCategory={{ _id: categoryId, name: categoryName }}
                        selectedQuiz={null}
                        onSelectQuiz={handleSelectQuiz}
                        onAddQuiz={handleAddQuiz}
                        onEditQuiz={handleEditQuiz}
                        onDeleteQuiz={handleDeleteQuiz}
                        isLoading={quizzesLoading}
                        isFetching={quizzesFetching}
                        hasMore={quizHasMore}
                        onLoadMore={handleLoadMoreQuizzes}
                        total={quizTotal}
                    />
                </div>
            </div>

            {/* Modals */}
            <QuizModal
                isOpen={showQuizModal}
                onClose={() => {
                    setShowQuizModal(false);
                    setEditingQuiz(null);
                }}
                onSave={handleSaveQuiz}
                quiz={editingQuiz}
                categoryName={categoryName}
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

export default LevelQuizzes;
