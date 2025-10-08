import React, { useEffect, useState } from 'react';
import cross_icon from '../../../assets/icons/cross-icon.svg';
import InputField from '../../Form/InputField';
import { toast } from 'react-toastify';

const ScentOrNotPopup = ({ open, onClose, onSubmit, initialData = null, subTab }) => {
  const [question, setQuestion] = useState('');
  const [correct, setCorrect] = useState('True');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const validateField = (fieldName, value) => {
    let error = '';
    
    switch (fieldName) {
      case 'question':
        if (!value || value.trim() === '') {
          error = 'Question is required';
        } else if (value.trim().length < 10) {
          error = 'Question must be at least 10 characters';
        } else if (value.trim().length > 500) {
          error = 'Question must be less than 500 characters';
        }
        break;
      
      case 'correct':
        if (!value) {
          error = 'Please select the correct answer';
        } else if (!['True', 'False'].includes(value)) {
          error = 'Answer must be either True or False';
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    
    newErrors.question = validateField('question', question);
    newErrors.correct = validateField('correct', correct);
    
    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    return newErrors;
  };

  // Handle field changes with validation
  const handleFieldChange = (fieldName, value) => {
    // Update field value
    switch (fieldName) {
      case 'question':
        setQuestion(value);
        break;
      case 'correct':
        setCorrect(value);
        break;
      default:
        break;
    }
    
    // Mark as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate and update errors
    const error = validateField(fieldName, value);
    setErrors(prev => ({ 
      ...prev, 
      [fieldName]: error 
    }));
  };

  // Handle blur events
  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    let value;
    switch (fieldName) {
      case 'question':
        value = question;
        break;
      case 'correct':
        value = correct;
        break;
      default:
        return;
    }
    
    const error = validateField(fieldName, value);
    setErrors(prev => ({ 
      ...prev, 
      [fieldName]: error 
    }));
  };

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.questionText || '');
      setCorrect(initialData.correctAnswer || 'True');
    } else {
      setQuestion('');
      setCorrect('True');
    }
    
    // Reset validation states
    setErrors({});
    setTouched({});
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate entire form
    const formErrors = validateForm();
    setErrors(formErrors);
    
    // Mark all fields as touched
    setTouched({
      question: true,
      correct: true
    });
    
    // If there are errors, don't submit
    if (Object.keys(formErrors).length > 0) {
      // toast.error('Please fix all validation errors before submitting');
      return;
    }

    onSubmit?.({ 
      question: question.trim(), 
      correctAnswer: correct 
    });
  };

  if (!open) return null;

  return (
    <div className='w-full p-[20px] overflow-auto h-full min-h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
      <form
        className="bg-white p-[32px] rounded-[24px] max-w-[600px] w-full max-md:p-[16px] max-md:overflow-scroll max-md:max-h-[90vh]"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between">
          <h5 className='text-[20px] text-[#352AA4] font-semibold'>
            {initialData ? 'Edit Question' : 'Add Question'}( {initialData?.questionType || subTab} )
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
              onChange={e => handleFieldChange('question', e.target.value)}
              onBlur={() => handleBlur('question')}
              
              error={touched.question && errors.question}
            />
            <div className='flex flex-col'>
              
            <span className="text-gray-500 text-xs mt-1">
              {question.length}/500 characters - Make it clear what users need to identify as true or false
            </span>
            {touched.question && errors.question && (
              <span className="text-red-500 text-xs mt-1">{errors.question}</span>
            )}
            </div>
          </div>

          {/* Correct Answer Field */}
          <div>
            <label className='flex flex-col w-full'>
              <span className='text-[#7C7C7C] text-[14px] font-medium mb-2'>
                Correct Answer <span className="text-red-500">*</span>
              </span>
              <select
                className={`border rounded-2xl py-[14px] px-[18px] transition-colors ${
                  errors.correct && touched.correct ? 'border-red-500 bg-red-50' : 'border-[#EEEEEE] hover:border-gray-300'
                }`}
                value={correct}
                onChange={e => handleFieldChange('correct', e.target.value)}
                onBlur={() => handleBlur('correct')}
                
              >
                <option value="">Select correct answer</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </label>
            {errors.correct && touched.correct && (
              <p className="text-red-500 text-sm mt-1">{errors.correct}</p>
            )}
          </div>

          {/* Question Type Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h6 className="text-blue-800 font-medium text-sm mb-1">Question Type: Scent or Not?</h6>
            <p className="text-blue-700 text-xs">
              This is a True/False question where users need to determine if something is scent-related or not.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
          <button type="button" onClick={onClose} className='btn-sec'>
            Cancel
          </button>
          <button 
            type="submit" 
            className='btn-pri disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={Object.keys(errors).some(key => errors[key])}
          >
            {initialData ? 'Save Changes' : 'Add Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScentOrNotPopup;
