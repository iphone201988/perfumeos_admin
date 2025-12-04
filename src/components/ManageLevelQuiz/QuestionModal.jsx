// src/components/ManageLevelQuiz/QuestionModal.jsx
import React, { useState, useEffect } from 'react';

const QuestionModal = ({ isOpen, onClose, onSave, question, quizTitle }) => {
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || '',
        options: question.options || ['', '', '', ''],
        correctAnswer: question.correctAnswer || ''
      });
    } else {
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      });
    }
  }, [question, isOpen]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.question.trim()) {
      return;
    }
    
    const filledOptions = formData.options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }
    
    if (!formData.correctAnswer || !filledOptions.includes(formData.correctAnswer)) {
      alert('Please select a correct answer from the options');
      return;
    }

    onSave({
      question: formData.question,
      options: filledOptions,
      correctAnswer: formData.correctAnswer
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {question ? 'Edit Question' : 'Add Question'}
              </h3>
              {quizTitle && (
                <p className="text-sm text-gray-600 mt-1">Quiz: {quizTitle}</p>
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#352AA4] focus:border-transparent"
              placeholder="Enter question"
              rows="3"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-8">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#352AA4] focus:border-transparent"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#352AA4] focus:border-transparent"
              required
            >
              <option value="">Select correct answer</option>
              {formData.options
                .filter(opt => opt.trim() !== '')
                .map((option, index) => (
                  <option key={index} value={option}>
                    {String.fromCharCode(65 + index)}. {option}
                  </option>
                ))}
            </select>
          </div>

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
              className="px-6 py-2.5 bg-[#352AA4] text-white rounded-full hover:bg-[#2a2183] transition-all font-medium"
            >
              {question ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
