// src/pages/ManageLevelQuiz.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useGetLevelCategoriesQuery,
  useGetLevelQuizzesByCategoryQuery,
  useGetQuestionsByQuizQuery,
  useCreateLevelCategoryMutation,
  useUpdateLevelCategoryMutation,
  useDeleteLevelCategoryMutation,
  useCreateLevelQuizMutation,
  useUpdateLevelQuizMutation,
  useDeleteLevelQuizMutation,
  useCreateQuestionMutation,
  useUpdateQuestionLevelMutation,
  useDeleteQuestionLevelMutation
} from '../api';
import LevelCategoryList from '../components/ManageLevelQuiz/LevelCategoryList';
import LevelQuizList from '../components/ManageLevelQuiz/LevelQuizList';
import QuestionList from '../components/ManageLevelQuiz/QuestionList';
import CategoryModal from '../components/ManageLevelQuiz/CategoryModal';
import QuizModal from '../components/ManageLevelQuiz/QuizModal';
import QuestionModal from '../components/ManageLevelQuiz/QuestionModal';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import Loader from '../components/Loader/Loader';

const ManageLevelQuiz = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Pagination states
  const [categoryPage, setCategoryPage] = useState(1);
  const [quizPage, setQuizPage] = useState(1);
  const [questionPage, setQuestionPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // API Hooks
  const { data: categoriesData, isLoading: categoriesLoading, isFetching: categoriesFetching } = 
    useGetLevelCategoriesQuery({ page: categoryPage, limit: ITEMS_PER_PAGE });
  
  const { data: quizzesData, isLoading: quizzesLoading, isFetching: quizzesFetching } = 
    useGetLevelQuizzesByCategoryQuery(
      { categoryId: selectedCategory?._id, page: quizPage, limit: ITEMS_PER_PAGE },
      { skip: !selectedCategory }
    );

  const { data: questionsData, isLoading: questionsLoading, isFetching: questionsFetching } = 
    useGetQuestionsByQuizQuery(
      { quizId: selectedQuiz?._id, page: questionPage, limit: ITEMS_PER_PAGE },
      { skip: !selectedQuiz }
    );

  // Mutations
  const [createCategory, { isLoading: createCategoryLoading }] = useCreateLevelCategoryMutation();
  const [updateCategory, { isLoading: updateCategoryLoading }] = useUpdateLevelCategoryMutation();
  const [deleteCategory, { isLoading: deleteCategoryLoading }] = useDeleteLevelCategoryMutation();
  const [createQuiz, { isLoading: createQuizLoading }] = useCreateLevelQuizMutation();
  const [updateQuiz, { isLoading: updateQuizLoading }] = useUpdateLevelQuizMutation();
  const [deleteQuiz, { isLoading: deleteQuizLoading }] = useDeleteLevelQuizMutation();
  const [createQuestion, { isLoading: createQuestionLoading }] = useCreateQuestionMutation();
  const [updateQuestion, { isLoading: updateQuestionLoading }] = useUpdateQuestionLevelMutation();
  const [deleteQuestion, { isLoading: deleteQuestionLoading }] = useDeleteQuestionLevelMutation();

  const categories = categoriesData?.data || [];
  const categoryTotal = categoriesData?.total || 0;
  const categoryHasMore = categories.length < categoryTotal;

  const quizzes = quizzesData?.data || [];
  const quizTotal = quizzesData?.total || 0;
  const quizHasMore = quizzes.length < quizTotal;

  const questions = questionsData?.data || [];
  const questionTotal = questionsData?.total || 0;
  const questionHasMore = questions.length < questionTotal;

  const isOperationLoading = createCategoryLoading || updateCategoryLoading || deleteCategoryLoading ||
    createQuizLoading || updateQuizLoading || deleteQuizLoading ||
    createQuestionLoading || updateQuestionLoading || deleteQuestionLoading;

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
      type: 'category',
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

  // Quiz Handlers
  const handleAddQuiz = () => {
    if (!selectedCategory) {
      toast.warning('Please select a category first');
      return;
    }
    setEditingQuiz(null);
    setShowQuizModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleDeleteQuiz = (quiz) => {
    setDeleteConfirmation({
      type: 'quiz',
      item: quiz,
      title: 'Delete Quiz',
      message: `Are you sure you want to delete "${quiz.title}"? This will delete all questions in this quiz.`
    });
  };

  const handleSaveQuiz = async (quizData) => {
    try {
      const payload = {
        ...quizData,
        levelCategoryId: selectedCategory._id
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

  // Question Handlers
  const handleAddQuestion = () => {
    if (!selectedQuiz) {
      toast.warning('Please select a quiz first');
      return;
    }
    setEditingQuestion(null);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (question) => {
    setDeleteConfirmation({
      type: 'question',
      item: question,
      title: 'Delete Question',
      message: `Are you sure you want to delete this question?`
    });
  };

  const handleSaveQuestion = async (questionData) => {
    try {
      const payload = {
        ...questionData,
        levelQuizId: selectedQuiz._id
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

  // Delete Confirmation Handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      if (deleteConfirmation.type === 'category') {
        await deleteCategory(deleteConfirmation.item._id).unwrap();
        toast.success('Category deleted successfully!');
        if (selectedCategory?._id === deleteConfirmation.item._id) {
          setSelectedCategory(null);
          setSelectedQuiz(null);
        }
        setCategoryPage(1);
      } else if (deleteConfirmation.type === 'quiz') {
        await deleteQuiz(deleteConfirmation.item._id).unwrap();
        toast.success('Quiz deleted successfully!');
        if (selectedQuiz?._id === deleteConfirmation.item._id) {
          setSelectedQuiz(null);
        }
        setQuizPage(1);
      } else if (deleteConfirmation.type === 'question') {
        await deleteQuestion(deleteConfirmation.item._id).unwrap();
        toast.success('Question deleted successfully!');
        setQuestionPage(1);
      }
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error?.data?.message || 'Failed to delete');
    }
  };

  // Pagination handlers
  const handleLoadMoreCategories = () => {
    if (!categoriesFetching && categoryHasMore) {
      setCategoryPage(prev => prev + 1);
    }
  };

  const handleLoadMoreQuizzes = () => {
    if (!quizzesFetching && quizHasMore) {
      setQuizPage(prev => prev + 1);
    }
  };

  const handleLoadMoreQuestions = () => {
    if (!questionsFetching && questionHasMore) {
      setQuestionPage(prev => prev + 1);
    }
  };

  // Selection handlers
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedQuiz(null);
    setQuizPage(1);
    setQuestionPage(1);
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuestionPage(1);
  };

  if (categoriesLoading) {
    return <Loader message="Loading Level Categories..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Operation Loading Overlay */}
      {isOperationLoading && (
        <Loader
          message={
            createCategoryLoading || createQuizLoading || createQuestionLoading ? 'Creating...' :
            updateCategoryLoading || updateQuizLoading || updateQuestionLoading ? 'Updating...' :
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
            <h1 className="text-[24px] font-bold text-[#352AA4]">Manage Level Quiz</h1>
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

      {/* Breadcrumb */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Level Categories</span>
          {selectedCategory && (
            <>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#352AA4] font-medium">{selectedCategory.name}</span>
            </>
          )}
          {selectedQuiz && (
            <>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#352AA4] font-medium">{selectedQuiz.title}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-3">
          <LevelCategoryList
            categories={categories}
            selectedCategory={selectedCategory}
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

        {/* Quizzes List */}
        <div className="lg:col-span-4">
          <LevelQuizList
            quizzes={quizzes}
            selectedCategory={selectedCategory}
            selectedQuiz={selectedQuiz}
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

        {/* Questions List */}
        <div className="lg:col-span-5">
          <QuestionList
            questions={questions}
            selectedQuiz={selectedQuiz}
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
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => {
          setShowQuizModal(false);
          setEditingQuiz(null);
        }}
        onSave={handleSaveQuiz}
        quiz={editingQuiz}
        categoryName={selectedCategory?.name}
      />

      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        question={editingQuestion}
        quizTitle={selectedQuiz?.title}
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

export default ManageLevelQuiz;
