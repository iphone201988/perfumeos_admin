import React, { useEffect, useState } from 'react';
import cross_icon from '../../../assets/icons/cross-icon.svg';
import InputField from '../../Form/InputField';

const ScentOrNotPopup = ({ open, onClose, onSubmit, initialData = null }) => {
  const [question, setQuestion] = useState('');
  const [correct, setCorrect] = useState('True');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.questionText || '');
      setCorrect(initialData.correctAnswer || 'True');
    } else {
      setQuestion('');
      setCorrect('True');
    }
    setErrors({}); // Clear errors when popup opens/closes
  }, [initialData, open]);

  // ✅ Enhanced validation
  const validateForm = () => {
    const newErrors = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    } else if (question.trim().length < 10) {
      newErrors.question = 'Question should be at least 10 characters long';
    }

    if (!correct) {
      newErrors.correct = 'Please select the correct answer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit?.({ 
      question: question.trim(), 
      correctAnswer: correct 
    });
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    // Clear error when user starts typing
    if (errors.question) {
      setErrors(prev => ({ ...prev, question: '' }));
    }
  };

  const handleCorrectChange = (e) => {
    setCorrect(e.target.value);
    // Clear error when user selects
    if (errors.correct) {
      setErrors(prev => ({ ...prev, correct: '' }));
    }
  };

  if (!open) return null;

  return (
    <div className='w-full min-h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
      <form
        className="bg-white p-[32px] rounded-[24px] max-w-[600px] w-full max-md:p-[16px] max-md:overflow-scroll max-md:max-h-[90vh]"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between">
          <h5 className='text-[20px] text-[#352AA4] font-semibold'>
            {initialData ? 'Edit Question' : 'Add Question'}
          </h5>
          <button type="button" onClick={onClose} className='cursor-pointer hover:opacity-70'>
            <img src={cross_icon} alt="Close" />
          </button>
        </div>

        <div className="mt-[20px] flex flex-col gap-[16px]">
          {/* Question Field */}
          <div>
            <InputField
              label="Enter Question"
              placeholder="Enter a true/false question about scents or perfumes"
              value={question}
              onChange={handleQuestionChange}
              required
            />
            {errors.question && (
              <p className="text-red-500 text-sm mt-1">{errors.question}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Make it clear what users need to identify as true or false
            </p>
          </div>

          {/* Correct Answer Field */}
          <div>
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px] font-medium mb-2'>
                Correct Answer <span className="text-red-500">*</span>
              </span>
              <select
                className={`border rounded-2xl py-[14px] px-[18px] transition-colors ${
                  errors.correct ? 'border-red-500 bg-red-50' : 'border-[#EEEEEE] hover:border-gray-300'
                }`}
                value={correct}
                onChange={handleCorrectChange}
                required
              >
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </label>
            {errors.correct && (
              <p className="text-red-500 text-sm mt-1">{errors.correct}</p>
            )}
          </div>

          {/* Question Type Info */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h6 className="text-blue-800 font-medium text-sm mb-1">Question Type: Scent or Not?</h6>
            <p className="text-blue-700 text-xs">
              This is a True/False question where users need to determine if something is scent-related or not.
            </p>
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
          <button type="button" onClick={onClose} className='btn-sec'>
            Cancel
          </button>
          <button type="submit" className='btn-pri'>
            {initialData ? 'Save Changes' : 'Add Question'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ScentOrNotPopup;
