// src/pages/LevelQuestions.jsx
import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    useGetQuestionsByQuizQuery,
    useCreateQuestionMutation,
    useUpdateQuestionLevelMutation,
    useDeleteQuestionLevelMutation
} from '../api';
import QuestionList from '../components/ManageLevelQuiz/QuestionList';
import QuestionModal from '../components/ManageLevelQuiz/QuestionModal';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import Loader from '../components/Loader/Loader';

const LevelQuestions = () => {
    const navigate = useNavigate();
    const { categoryId, quizId } = useParams();
    const location = useLocation();
    const { categoryName, levelNo, quizTitle, quizNo } = location.state || {};

    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [questionPage, setQuestionPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // API Hooks
    const { data: questionsData, isLoading: questionsLoading, isFetching: questionsFetching } =
        useGetQuestionsByQuizQuery(
            { quizId, page: questionPage, limit: ITEMS_PER_PAGE },
            { skip: !quizId }
        );

    // Mutations
    const [createQuestion, { isLoading: createQuestionLoading }] = useCreateQuestionMutation();
    const [updateQuestion, { isLoading: updateQuestionLoading }] = useUpdateQuestionLevelMutation();
    const [deleteQuestion, { isLoading: deleteQuestionLoading }] = useDeleteQuestionLevelMutation();

    const questions = questionsData?.data || [];
    const questionTotal = questionsData?.total || 0;
    const questionHasMore = questions.length < questionTotal;

    const isOperationLoading = createQuestionLoading || updateQuestionLoading || deleteQuestionLoading;

    // Get loader message
    const getLoaderMessage = () => {
        if (createQuestionLoading) return { message: 'Creating Question', title: 'Please wait...' };
        if (updateQuestionLoading) return { message: 'Updating Question', title: 'Saving changes...' };
        if (deleteQuestionLoading) return { message: 'Deleting Question', title: 'Please wait...' };
        return { message: 'Processing...', title: 'Please wait...' };
    };

    // Question Handlers
    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setShowQuestionModal(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setShowQuestionModal(true);
    };

    const handleDeleteQuestion = (question) => {
        setDeleteConfirmation({
            item: question,
            title: 'Delete Question',
            message: `Are you sure you want to delete this question?`
        });
    };

    const handleSaveQuestion = async (questionData) => {
        try {
            const payload = {
                ...questionData,
                levelQuizId: quizId
            };

            if (editingQuestion) {
                await updateQuestion({ id: editingQuestion._id, data: payload }).unwrap();
                toast.success('Question updated successfully!');
            } else {
                await createQuestion(payload).unwrap();
                toast.success('Question created successfully!');
                setQuestionPage(1);
            }
            setShowQuestionModal(false);
            setEditingQuestion(null);
        } catch (error) {
            console.error('Save question error:', error);
            toast.error(error?.data?.message || 'Failed to save question');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;

        try {
            await deleteQuestion(deleteConfirmation.item._id).unwrap();
            toast.success('Question deleted successfully!');
            setQuestionPage(1);
            setDeleteConfirmation(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error?.data?.message || 'Failed to delete');
        }
    };

    const handleLoadMoreQuestions = () => {
        if (!questionsFetching && questionHasMore) {
            setQuestionPage(prev => prev + 1);
        }
    };

    const handleBackToQuizzes = () => {
        navigate(`/level-quiz/${categoryId}/quizzes`, {
            state: { categoryName, levelNo }
        });
    };

    const handleBackToCategories = () => {
        navigate('/level-quiz');
    };

    if (questionsLoading) {
        return <Loader message="Loading Questions..." />;
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
                            onClick={handleBackToQuizzes}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to Quizzes"
                        >
                            <svg className="w-6 h-6 text-[#352AA4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                        <div>
                            <h1 className="text-[24px] font-bold text-[#352AA4]">Questions</h1>
                            {quizTitle && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {quizTitle} {quizNo && `(Quiz ${quizNo})`}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddQuestion}
                            disabled={isOperationLoading}
                            className="bg-[#352AA4] text-white px-6 py-2.5 rounded-full hover:bg-[#2a2183] transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Question
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
                    <button
                        onClick={handleBackToQuizzes}
                        className="text-gray-600 hover:text-[#352AA4] transition-colors"
                    >
                        {categoryName || 'Quizzes'}
                    </button>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[#352AA4] font-medium">{quizTitle || 'Questions'}</span>
                </div>
            </div> */}

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <QuestionList
                        questions={questions}
                        selectedQuiz={{ _id: quizId, title: quizTitle }}
                        onAddQuestion={handleAddQuestion}
                        onEditQuestion={handleEditQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        isLoading={questionsLoading}
                        isFetching={questionsFetching}
                        hasMore={questionHasMore}
                        onLoadMore={handleLoadMoreQuestions}
                        total={questionTotal}
                    />
                </div>
            </div>

            {/* Modals */}
            <QuestionModal
                isOpen={showQuestionModal}
                onClose={() => {
                    setShowQuestionModal(false);
                    setEditingQuestion(null);
                }}
                onSave={handleSaveQuestion}
                question={editingQuestion}
                quizTitle={quizTitle}
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
            />
        </div>
    );
};

export default LevelQuestions;
