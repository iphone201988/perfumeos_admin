// src/components/ManageFAQ/FAQModal.jsx
import React, { useState, useEffect } from 'react';

const FAQ_TYPES = ['General', 'Account', 'Services', "Subscription"];

const FAQModal = ({ isOpen, onClose, onSave, faq, defaultType }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    type: defaultType || 'General',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        type: faq.type || 'General',
        isActive: faq.isActive !== undefined ? faq.isActive : true
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        type: defaultType || 'General',
        isActive: true
      });
    }
    setErrors({});
  }, [faq, isOpen, defaultType]);

  const validate = () => {
    const newErrors = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    } else if (formData.question.length < 10) {
      newErrors.question = 'Question must be at least 10 characters';
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    } else if (formData.answer.length < 20) {
      newErrors.answer = 'Answer must be at least 20 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">
              {faq ? 'Edit FAQ' : 'Add New FAQ'}
            </h3>
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
          {/* Question */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#352AA4] focus:border-transparent ${
                errors.question ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter FAQ question"
              rows="3"
            />
            {errors.question && (
              <p className="text-red-500 text-sm mt-1">{errors.question}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.question.length} / 500 characters
            </p>
          </div>

          {/* Answer */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#352AA4] focus:border-transparent ${
                errors.answer ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter FAQ answer"
              rows="5"
            />
            {errors.answer && (
              <p className="text-red-500 text-sm mt-1">{errors.answer}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.answer.length} / 1000 characters
            </p>
          </div>

          {/* Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#352AA4] focus:border-transparent ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {
              FAQ_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
            ))}
          </select>
            {
              errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )
            }
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-[#352AA4] rounded focus:ring-[#352AA4]"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Active</span>
                <p className="text-xs text-gray-500">FAQ will be visible to users</p>
              </div>
            </label>
          </div>

          {/* Preview */}
          {/* {formData.question && formData.answer && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview:</h4>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">Q: {formData.question}</p>
                <p className="text-gray-600 text-sm">A: {formData.answer}</p>
              </div>
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
              className="px-6 py-2.5 bg-[#352AA4] text-white rounded-full hover:bg-[#2a2183] transition-all font-medium"
            >
              {faq ? 'Update FAQ' : 'Create FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FAQModal;
