import React, { useState, useEffect, useCallback } from 'react';
import edit_icon from '../assets/icons/edit-icon.svg';
import delete_icon from '../assets/icons/delete-icon.svg';
import ClassicTriviaPopup from '../components/ManageQuiz/ClassicTriviaPopup/ClassicTriviaPopup';
import ScentOrNotPopup from '../components/ManageQuiz/ScentOrNotPopup/ScentOrNotPopup';
import GuessTheBottlePopup from '../components/ManageQuiz/GuessTheBottlePopup/GuessTheBottlePopup';
import { useAddQuestionMutation, useUpdateQuestionMutation, useDeleteQuestionMutation, useQuestionsQuery } from '../api';
import Pagination from '../components/Table/Pagination';
import Loader from '../components/Loader/Loader';
import ConfirmationModal from '../components/Modal/ConfirmationModal';
import { toast } from 'react-toastify';

const QUESTION_TYPES = {
  TRIVIA: 'trivia',
  SCENT: 'scent',
  GUESS: 'guess'
};
const SUB_TAB_TYPES = {
  QUICK: 'quick',
  RANkED: 'ranked'
};

const ITEMS_PER_PAGE = 20;

const ManageQuiz = () => {
  const [tab, setTab] = useState(QUESTION_TYPES.TRIVIA);
  const [subTab, setSubTab] = useState(SUB_TAB_TYPES.QUICK);
  const [popup, setPopup] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // API hooks
  const [addQuestion, { isLoading: addLoading }] = useAddQuestionMutation();
  const [updateQuestion, { isLoading: updateLoading }] = useUpdateQuestionMutation();
  const [deleteQuestion, { isLoading: deleteLoading }] = useDeleteQuestionMutation();
  const {
    data,
    isLoading: queryLoading,
    error: queryError,
    refetch
  } = useQuestionsQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    type: tab,
    questionType: subTab
  });

  const questions = data?.data?.questions || [];
  const totalPages = data?.data?.pagination?.totalPage || 0;
  const isOperationLoading = addLoading || updateLoading || deleteLoading;

  // Reset page when changing tabs
  const handleTabChange = useCallback((newTab) => {
    if (newTab === tab) return;

    setTab(newTab);
    setCurrentPage(1);
    setEditingQuestion(null);
    setPopup(null);
    setDeleteConfirmation(null);
  }, [tab]);

  const handleSubTabChange = useCallback((newSubTab) => {
    setSubTab(newSubTab);
    setCurrentPage(1);
  }, [subTab]);

  const handleAdd = useCallback((type) => {
    setEditingQuestion(null);
    setPopup(type);
  }, []);

  const handleEdit = useCallback((question) => {
    setEditingQuestion({ type: tab, data: question });
    setPopup(tab);
  }, [tab]);

  const handleDeleteClick = useCallback((question) => {
    setDeleteConfirmation({
      question,
      title: 'Delete Question',
      message: `Are you sure you want to delete this question? This action cannot be undone.`,
      questionText: question.questionText
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmation?.question) return;

    try {
      await deleteQuestion(deleteConfirmation.question._id).unwrap();
      toast.success('Question deleted successfully!');

      if (questions.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }

      await refetch();
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Failed to delete question:', error);
      const errorMessage = error?.data?.message || 'Failed to delete question. Please try again.';
      toast.error(errorMessage);
    }
  }, [deleteConfirmation, deleteQuestion, refetch, questions.length, currentPage]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmation(null);
  }, []);

  const handleClosePopup = useCallback(() => {
    setPopup(null);
    setEditingQuestion(null);
  }, []);

  const handleSaveQuestion = useCallback(async (type, questionType, questionData) => {
    try {
      const formData = new FormData();
      formData.append('questionText', questionData.question);
      formData.append('correctAnswer', questionData.correctAnswer);

      questionData.options.forEach((opt, i) => {
        formData.append(`options[${i}]`, opt);
      });

      if (questionData.image) {
        formData.append('file', questionData.image);
      }

      if (editingQuestion) {
        await updateQuestion({
          id: editingQuestion.data._id,
          formData
        }).unwrap();
        toast.success('Question updated successfully!');
      } else {
        formData.append('type', type);
        formData.append('questionType', questionType);
        await addQuestion(formData).unwrap();
        toast.success('Question added successfully!');
      }

      await refetch();
      handleClosePopup();
    } catch (error) {
      console.error('Failed to save question:', error);
      const errorMessage = error?.data?.message || 'Failed to save question. Please try again.';
      toast.error(errorMessage);
    }
  }, [editingQuestion, addQuestion, updateQuestion, refetch, handleClosePopup]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleImageClick = useCallback((imageSrc) => {
    setSelectedImage(imageSrc);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const getTabDisplayName = (tabType) => {
    switch (tabType) {
      case QUESTION_TYPES.TRIVIA:
        return 'Classic Trivia Questions';
      case QUESTION_TYPES.SCENT:
        return 'Scent Or Not? Questions';
      case QUESTION_TYPES.GUESS:
        return 'Guess The Bottle Questions';
      default:
        return 'Questions';
    }
  };

  const renderQuestionOptions = (question, questionIndex) => {
    const baseClasses = 'text-[16px] font-medium px-4 py-2 rounded-lg';

    switch (tab) {
      case QUESTION_TYPES.TRIVIA:
      case QUESTION_TYPES.SCENT:
        return question.options?.map((option, i) => (
          <div
            key={i}
            className={`${baseClasses} ${
              option === question.correctAnswer 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {option}
          </div>
        ));

      case QUESTION_TYPES.GUESS:
        return (
          <div className="flex items-center gap-4 flex-wrap">
            {question.image && (
              <img
                src={`${import.meta.env.VITE_BASE_URL}${question.image}`}
                alt={`Question ${questionIndex + 1} image`}
                className="w-[80px] h-[80px] border-2 border-[#352AA4] rounded-xl object-cover cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300"
                onClick={() => handleImageClick(question.image)}
              />
            )}
            <div className="flex gap-2 flex-wrap flex-1">
              {question.options?.map((option, i) => (
                <div
                  key={i}
                  className={`${baseClasses} ${
                    question.correctAnswer === option 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Error state
  if (queryError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-500 text-lg font-semibold mb-2">Error loading questions</p>
          <p className="text-gray-600 mb-4">{queryError?.data?.message || 'Something went wrong'}</p>
          <button onClick={() => refetch()} className="bg-[#352AA4] text-white px-6 py-2.5 rounded-full hover:bg-[#2a2183] transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Operation Loading Overlay */}
      {isOperationLoading && (
        <Loader
          message={
            deleteLoading ? 'Deleting question...' :
            editingQuestion ? 'Updating question...' :
            'Adding question...'
          }
          isVisible={true}
        />
      )}

      {/* Header Section with Tabs */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
            <h1 className="text-[24px] font-bold text-[#352AA4]">Manage Quiz Questions</h1>
          </div>
          <button
            className="bg-[#352AA4] text-white px-6 py-2.5 rounded-full hover:bg-[#2a2183] transition-all duration-300 hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={() => handleAdd(tab)}
            disabled={isOperationLoading}
          >
            <span className="text-lg">+</span>
            Add Question
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-[16px] mb-4 flex-wrap">
          <button
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              tab === QUESTION_TYPES.TRIVIA
                ? 'bg-[#352AA4] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleTabChange(QUESTION_TYPES.TRIVIA)}
            disabled={isOperationLoading}
          >
            🎯 Classic Trivia
          </button>
          <button
            className={`hidden px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              tab === QUESTION_TYPES.SCENT
                ? 'bg-[#352AA4] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleTabChange(QUESTION_TYPES.SCENT)}
            disabled={isOperationLoading}
          >
            👃 Scent or Not?
          </button>
          <button
            className={`hidden px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              tab === QUESTION_TYPES.GUESS
                ? 'bg-[#352AA4] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleTabChange(QUESTION_TYPES.GUESS)}
            disabled={isOperationLoading}
          >
            🍾 Guess the Bottle
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="hidden flex justify-center gap-[16px] bg-gray-50 rounded-xl p-2">
          <button
            className={`px-8 py-2 rounded-lg font-medium transition-all duration-300 ${
              subTab === SUB_TAB_TYPES.QUICK
                ? 'bg-white text-[#352AA4] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleSubTabChange(SUB_TAB_TYPES.QUICK)}
            disabled={isOperationLoading}
          >
            ⚡ Quick Mode
          </button>
          <button
            className={`px-8 py-2 rounded-lg font-medium transition-all duration-300 ${
              subTab === SUB_TAB_TYPES.RANkED
                ? 'bg-white text-[#352AA4] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => handleSubTabChange(SUB_TAB_TYPES.RANkED)}
            disabled={isOperationLoading}
          >
            🏆 Ranked Mode
          </button>
        </div>
      </div>

      {/* Loading State */}
      {queryLoading && (
        <Loader message={`Fetching ${getTabDisplayName(tab)}`} isVisible={true} />
      )}

      {/* Questions List */}
      {!queryLoading && (
        <div className="bg-gradient-to-br from-[#E1F8F8] to-[#D4E8F8] rounded-[30px] shadow-lg overflow-hidden">
          <div className="bg-white/60 backdrop-blur-sm rounded-[30px] p-[32px] max-lg:p-[20px] m-[2px]">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-[#352AA4] to-[#5c4ec9] rounded-full"></div>
                <h2 className="text-[20px] font-bold text-[#352AA4]">
                  {getTabDisplayName(tab)}
                  <span className="ml-2 text-sm bg-[#352AA4] text-white px-3 py-1 rounded-full">
                    {questions.length}
                  </span>
                </h2>
              </div>

              {/* Legend */}
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex items-center gap-[8px] bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  <span className="w-[20px] h-[20px] rounded-full bg-red-500"></span>
                  <p className="text-[14px] font-medium text-red-700">Wrong Answer</p>
                </div>
                <div className="flex items-center gap-[8px] bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  <span className="w-[20px] h-[20px] rounded-full bg-green-500"></span>
                  <p className="text-[14px] font-medium text-green-700">Correct Answer</p>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {questions.length > 0 ? (
                questions.map((question, idx) => (
                  <div
                    key={question._id || question.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <span className="bg-[#4896FF] text-white font-bold px-3 py-1 rounded-lg text-sm flex-shrink-0">
                            Q{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                          </span>
                          <p className="text-[18px] font-medium text-gray-800 leading-relaxed">
                            {question.questionText}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleEdit(question)}
                          disabled={isOperationLoading}
                          title="Edit question"
                        >
                          {edit_icon ? (
                            <img src={edit_icon} alt="Edit" className="w-4 h-4" />
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          )}
                          <span className="font-medium text-sm">Edit</span>
                        </button>

                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDeleteClick(question)}
                          disabled={isOperationLoading}
                          title="Delete question"
                        >
                          {delete_icon ? (
                            <img src={delete_icon} alt="Delete" className="w-4 h-4" />
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="font-medium text-sm">Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="flex gap-3 flex-wrap ml-[52px] max-md:ml-0">
                      {renderQuestionOptions(question, idx)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-500 mb-2">No questions yet</p>
                  <p className="text-sm text-gray-400">Click the "Add Question" button to create your first question</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[999999] backdrop-blur-sm"
          onClick={handleCloseImageModal}
        >
          <div
            className="bg-white p-6 rounded-2xl relative max-w-4xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-3xl font-bold text-gray-500 hover:text-gray-700 cursor-pointer bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
              onClick={handleCloseImageModal}
              aria-label="Close modal"
            >
              ×
            </button>
            <img
              src={`${import.meta.env.VITE_BASE_URL}${selectedImage}`}
              alt="Enlarged question image"
              className="max-w-full max-h-[80vh] rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={deleteConfirmation?.title}
        message={deleteConfirmation?.message}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      >
        {deleteConfirmation?.questionText && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-gray-700">
              <strong className="text-red-700">Question:</strong> {deleteConfirmation.questionText}
            </p>
          </div>
        )}
      </ConfirmationModal>

      {/* Question Popups */}
      <ClassicTriviaPopup
        open={popup === QUESTION_TYPES.TRIVIA}
        onClose={handleClosePopup}
        initialData={editingQuestion?.type === QUESTION_TYPES.TRIVIA ? editingQuestion.data : null}
        onSubmit={data => handleSaveQuestion(QUESTION_TYPES.TRIVIA, subTab, {
          question: data.question,
          options: [...data.wrongs, data.correctAnswer],
          correctAnswer: data.correctAnswer
        })}
        subTab={subTab}
      />

      <ScentOrNotPopup
        open={popup === QUESTION_TYPES.SCENT}
        onClose={handleClosePopup}
        initialData={editingQuestion?.type === QUESTION_TYPES.SCENT ? editingQuestion.data : null}
        onSubmit={data => handleSaveQuestion(QUESTION_TYPES.SCENT, subTab, {
          question: data.question,
          correctAnswer: data.correctAnswer,
          options: [data.correctAnswer, data.correctAnswer === 'True' ? 'False' : 'True']
        })}
        subTab={subTab}
      />

      <GuessTheBottlePopup
        open={popup === QUESTION_TYPES.GUESS}
        onClose={handleClosePopup}
        initialData={editingQuestion?.type === QUESTION_TYPES.GUESS ? editingQuestion.data : null}
        onSubmit={data => handleSaveQuestion(QUESTION_TYPES.GUESS, subTab, {
          question: data.question,
          correctAnswer: data.correctAnswer,
          image: data.image,
          options: [data.correctAnswer, ...data.wrongs]
        })}
        subTab={subTab}
      />
    </div>
  );
};

export default ManageQuiz;
