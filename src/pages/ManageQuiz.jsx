import React, { useState, useEffect, useCallback } from 'react';
import edit_icon from '../assets/icons/edit-icon.svg';
import delete_icon from '../assets/icons/delete-icon.svg'; // Add delete icon
import ClassicTriviaPopup from '../components/ManageQuiz/ClassicTriviaPopup/ClassicTriviaPopup';
import ScentOrNotPopup from '../components/ManageQuiz/ScentOrNotPopup/ScentOrNotPopup';
import GuessTheBottlePopup from '../components/ManageQuiz/GuessTheBottlePopup/GuessTheBottlePopup';
import { useAddQuestionMutation, useUpdateQuestionMutation, useDeleteQuestionMutation, useQuestionsQuery } from '../api';
import Pagination from '../components/Table/Pagination';
import Loader from '../components/Loader/Loader';
import ConfirmationModal from '../components/Modal/ConfirmationModal'; // Add confirmation modal
import { toast } from 'react-toastify';

const QUESTION_TYPES = {
  TRIVIA: 'trivia',
  SCENT: 'scent',
  GUESS: 'guess'
};

const ITEMS_PER_PAGE = 5;

const ManageQuiz = () => {
  const [tab, setTab] = useState(QUESTION_TYPES.TRIVIA);
  const [popup, setPopup] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // For delete confirmation

  // API hooks
  const [addQuestion, { isLoading: addLoading }] = useAddQuestionMutation();
  const [updateQuestion, { isLoading: updateLoading }] = useUpdateQuestionMutation();
  const [deleteQuestion, { isLoading: deleteLoading }] = useDeleteQuestionMutation(); // Add delete mutation
  const { 
    data, 
    isLoading: queryLoading, 
    error: queryError,
    refetch 
  } = useQuestionsQuery({ 
    page: currentPage, 
    limit: ITEMS_PER_PAGE, 
    type: tab 
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
      
      // If we're on the last page and it becomes empty, go to previous page
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

  const handleSaveQuestion = useCallback(async (type, questionData) => {
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
        // Update existing question
        await updateQuestion({ 
          id: editingQuestion.data._id, 
          formData 
        }).unwrap();
        toast.success('Question updated successfully!');
      } else {
        // Add new question
        formData.append('type', type);
        await addQuestion(formData).unwrap();
        toast.success('Question added successfully!');
      }

      // Refresh data and close popup
      await refetch();
      handleClosePopup();
    } catch (error) {
      console.error('Failed to save question:', error);
      const errorMessage = error?.data?.message || 'Failed to save question. Please try again.';
      toast.error(errorMessage);
    }
  }, [editingQuestion, addQuestion, updateQuestion, refetch, handleClosePopup]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Handle image modal
  const handleImageClick = useCallback((imageSrc) => {
    setSelectedImage(imageSrc);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Get tab display name
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

  // Render question options based on type
  const renderQuestionOptions = (question, questionIndex) => {
    const baseClasses = 'text-[18px] font-medium';
    
    switch (tab) {
      case QUESTION_TYPES.TRIVIA:
      case QUESTION_TYPES.SCENT:
        return question.options?.map((option, i) => (
          <p 
            key={i} 
            className={`${baseClasses} ${
              option === question.correctAnswer ? 'text-[#0CDD39]' : 'text-[#F6595A]'
            }`}
          >
            {option}
          </p>
        ));
      
      case QUESTION_TYPES.GUESS:
        return (
          <>
            {question.image && (
              <img
                src={`${import.meta.env.VITE_BASE_URL}${question.image}`}
                alt={`Question ${questionIndex + 1} image`}
                className="w-[60px] h-[60px] inline-block border rounded-full object-cover mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(question.image)}
              />
            )}
            {question.options?.map((option, i) => (
              <p 
                key={i} 
                className={`${baseClasses} ${
                  question.correctAnswer === option ? 'text-[#0CDD39]' : 'text-[#F6595A]'
                }`}
              >
                {option}
              </p>
            ))}
          </>
        );
      
      default:
        return null;
    }
  };

  // Error state
  if (queryError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold mb-4">
            Error loading questions
          </p>
          <p className="text-gray-600 mb-4">
            {queryError?.data?.message || 'Something went wrong'}
          </p>
          <button 
            onClick={() => refetch()}
            className="btn-pri"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
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

      {/* Tabs */}
      <div className="tabs flex gap-[24px] mb-[16px] flex-wrap max-md:gap-[16px]">
        <button 
          className={tab === QUESTION_TYPES.TRIVIA ? 'btn-pri' : 'btn-sec'} 
          onClick={() => handleTabChange(QUESTION_TYPES.TRIVIA)}
          disabled={isOperationLoading}
        >
          Classic Trivia
        </button>
        <button 
          className={tab === QUESTION_TYPES.SCENT ? 'btn-pri' : 'btn-sec'} 
          onClick={() => handleTabChange(QUESTION_TYPES.SCENT)}
          disabled={isOperationLoading}
        >
          Scent or Not?
        </button>
        <button 
          className={tab === QUESTION_TYPES.GUESS ? 'btn-pri' : 'btn-sec'} 
          onClick={() => handleTabChange(QUESTION_TYPES.GUESS)}
          disabled={isOperationLoading}
        >
          Guess the Bottle
        </button>
        <button 
          className="btn-pri ml-auto" 
          onClick={() => handleAdd(tab)}
          disabled={isOperationLoading}
        >
          + Add
        </button>
      </div>

      {/* Loading State */}
      {queryLoading && (
        <Loader 
          message={`Fetching ${getTabDisplayName(tab)}`} 
          isVisible={true} 
        />
      )}

      {/* Questions List */}
      {!queryLoading && (
        <div className='bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]'>
          <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-3">
            <h6 className='text-[20px] font-semibold text-[#352AA4]'>
              {getTabDisplayName(tab)} ({questions.length})
            </h6>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex items-center gap-[6px]">
                <span className='w-[24px] h-[24px] rounded-full bg-[#F6595A]'></span>
                <p className='text-[18px] font-medium text-[#7C7C7C] max-md:text-[16px]'>Wrong Answer</p>
              </div>
              <div className="flex items-center gap-[6px]">
                <span className='w-[24px] h-[24px] rounded-full bg-[#0CDD39]'></span>
                <p className='text-[18px] font-medium text-[#7C7C7C] max-md:text-[16px]'>Correct Answer</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mt-[4px]">
            {questions.length > 0 ? (
              <>
                {questions.map((question, idx) => (
                  <div key={question._id || question.id} className="border-b border-[rgba(21,201,201,0.50)] py-[20px]">
                    <div className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-[10px]">
                      <p className='text-[20px] font-medium text-[#7C7C7C] flex-1 pr-4 max-lg:text-[16px]'>
                        <span className='text-[#4896FF]'>
                          Q{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}.
                        </span>
                        {' '}{question.questionText}
                      </p>
                      
                      {/* Action buttons container */}
                      <div className="flex items-center gap-[12px]">
                        {/* Edit button */}
                        <button
                          className="flex items-center gap-[6px] cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleEdit(question)}
                          disabled={isOperationLoading}
                          title="Edit question"
                        >
                          <img src={edit_icon} alt="Edit" className="w-5 h-5" />
                          <span className='text-[#352AA4]'>edit</span>
                        </button>

                        {/* Delete button */}
                        <button
                          className="flex items-center gap-[6px] cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleDeleteClick(question)}
                          disabled={isOperationLoading}
                          title="Delete question"
                        >
                          {/* ✅ Fixed: Use delete_icon if available, otherwise use SVG */}
                          {delete_icon ? (
                            <img src={delete_icon} alt="Delete" className="w-5 h-5" />
                          ) : (
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className='text-red-500'>delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-[24px] flex-wrap max-md:gap-[16px] mt-[12px] ml-[30px] max-md:ml-0">
                      {renderQuestionOptions(question, idx)}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <p className="text-lg mb-2">No questions yet.</p>
                <p className="text-sm">Click the "+ Add" button to create your first question.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.80)] bg-opacity-50 flex justify-center items-center z-[999999]" 
          onClick={handleCloseImageModal}
        >
          <div 
            className="bg-white p-4 rounded-lg text-center relative max-w-4xl max-h-[90vh] overflow-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-2xl font-bold text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-0 w-8 h-8 flex items-center justify-center"
              onClick={handleCloseImageModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <img
              src={`${import.meta.env.VITE_BASE_URL}${selectedImage}`}
              alt="Enlarged question image"
              className="max-w-full max-h-[80vh] mt-4"
            />
          </div>
        </div>
      )}

      {/* ✅ Fixed: ConfirmationModal usage */}
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
        {/* Optional: Show the question being deleted */}
        {deleteConfirmation?.questionText && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>Question:</strong> {deleteConfirmation.questionText}
            </p>
          </div>
        )}
      </ConfirmationModal>

      {/* Question Popups */}
      <ClassicTriviaPopup
        open={popup === QUESTION_TYPES.TRIVIA}
        onClose={handleClosePopup}
        initialData={editingQuestion?.type === QUESTION_TYPES.TRIVIA ? editingQuestion.data : null}
        onSubmit={data => handleSaveQuestion(QUESTION_TYPES.TRIVIA, {
          question: data.question,
          options: [...data.wrongs, data.correctAnswer],
          correctAnswer: data.correctAnswer
        })}
      />
      
      <ScentOrNotPopup
        open={popup === QUESTION_TYPES.SCENT}
        onClose={handleClosePopup}
        initialData={editingQuestion?.type === QUESTION_TYPES.SCENT ? editingQuestion.data : null}
        onSubmit={data => handleSaveQuestion(QUESTION_TYPES.SCENT, {
          question: data.question,
          correctAnswer: data.correctAnswer,
          options: [data.correctAnswer, data.correctAnswer === 'True' ? 'False' : 'True']
        })}
      />
      
      <GuessTheBottlePopup
        open={popup === QUESTION_TYPES.GUESS}
        onClose={handleClosePopup}
        initialData={editingQuestion?.type === QUESTION_TYPES.GUESS ? editingQuestion.data : null}
        onSubmit={data => handleSaveQuestion(QUESTION_TYPES.GUESS, {
          question: data.question,
          correctAnswer: data.correctAnswer,
          image: data.image,
          options: [data.correctAnswer, ...data.wrongs]
        })}
      />
    </div>
  );
};

export default ManageQuiz;
