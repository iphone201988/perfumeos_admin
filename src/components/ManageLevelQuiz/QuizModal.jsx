// src/components/ManageLevelQuiz/QuizModal.jsx
import React, { useState, useEffect } from 'react';

const QuizModal = ({ isOpen, onClose, onSave, quiz, categoryName, isLoading=false }) => {
  const [formData, setFormData] = useState({
    title: '',
    isPromotionQuiz: false
  });

  useEffect(() => {
    if (quiz) {
      setFormData({ title: quiz.title || '' ,isPromotionQuiz: quiz.isPromotionQuiz || false});
    } else {
      setFormData({ title: '' });
    }
  }, [quiz, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {quiz ? 'Edit Quiz' : 'Add Quiz'}
              </h3>
              {categoryName && (
                <p className="text-sm text-gray-600 mt-1">Category: {categoryName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#352AA4] focus:border-transparent"
              placeholder="Enter quiz title"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Is Permotion Quiz</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#352AA4] focus:border-transparent"
              value={formData.isPromotionQuiz}
              onChange={(e) => setFormData({ ...formData, isPromotionQuiz: e.target.value === 'true' })}
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* {quiz && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Quiz Number:</strong> {quiz.quizNo}
              </p>
            </div>
          )} */}

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={"px-6 py-2.5 bg-[#352AA4] text-white rounded-full hover:bg-[#2a2183] transition-all font-medium" + (isLoading ? ' opacity-50 cursor-not-allowed' : '')}
              disabled={isLoading}
            >
              {quiz ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizModal;
