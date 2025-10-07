import React, { useEffect, useRef, useState } from 'react';
import cross_icon from '../../../assets/icons/cross-icon.svg';
import addpic_icon from '../../../assets/icons/addpic-icon.svg';
import InputField from '../../Form/InputField';
import { toast } from 'react-toastify';

const GuessTheBottlePopup = ({ open, onClose, onSubmit, initialData = null, subTab }) => {
  const [image, setImage] = useState(null);
  const [correct, setCorrect] = useState('');
  const [question, setQuestion] = useState('');
  const [wrongs, setWrongs] = useState(['', '', '']);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const fileInput = useRef();

  // Validation rules
  const validateField = (fieldName, value, index = null) => {
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
        if (!value || value.trim() === '') {
          error = 'Correct answer is required';
        } else if (value.trim().length < 2) {
          error = 'Answer must be at least 2 characters';
        } else if (value.trim().length > 100) {
          error = 'Answer must be less than 100 characters';
        }
        break;
      
      case 'wrong':
        if (index !== null && index < 2) { // First 2 wrong answers are required
          if (!value || value.trim() === '') {
            error = 'This wrong answer is required';
          } else if (value.trim().length < 2) {
            error = 'Answer must be at least 2 characters';
          } else if (value.trim().length > 100) {
            error = 'Answer must be less than 100 characters';
          }
        } else if (value && value.trim()) { // Optional fields still need validation if filled
          if (value.trim().length < 2) {
            error = 'Answer must be at least 2 characters';
          } else if (value.trim().length > 100) {
            error = 'Answer must be less than 100 characters';
          }
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
    
    // Validate question
    newErrors.question = validateField('question', question);
    
    // Validate correct answer
    newErrors.correct = validateField('correct', correct);
    
    // Validate wrong answers
    wrongs.forEach((wrong, index) => {
      const error = validateField('wrong', wrong, index);
      if (error) {
        newErrors[`wrong_${index}`] = error;
      }
    });
    
    // Check for at least 2 filled wrong answers
    const filledWrongs = wrongs.filter(w => w.trim() !== '');
    if (filledWrongs.length < 2) {
      newErrors.wrongs = 'At least 2 wrong answers are required';
    }
    
    // Check for duplicate answers
    const allAnswers = [correct.trim(), ...wrongs.map(w => w.trim())].filter(Boolean);
    const uniqueAnswers = new Set(allAnswers.map(a => a.toLowerCase()));
    if (allAnswers.length !== uniqueAnswers.size) {
      newErrors.duplicate = 'All answers must be unique';
    }
    
    // Image validation
    if (!image && !initialData?.image) {
      newErrors.image = 'Image is required for Guess the Bottle question';
    }
    
    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    return newErrors;
  };

  // Handle field changes with validation
  const handleFieldChange = (fieldName, value, index = null) => {
    // Update field value
    switch (fieldName) {
      case 'question':
        setQuestion(value);
        break;
      case 'correct':
        setCorrect(value);
        break;
      case 'wrong':
        if (index !== null) {
          const newWrongs = [...wrongs];
          newWrongs[index] = value;
          setWrongs(newWrongs);
        }
        break;
      default:
        break;
    }
    
    // Mark as touched
    const touchedKey = index !== null ? `${fieldName}_${index}` : fieldName;
    setTouched(prev => ({ ...prev, [touchedKey]: true }));
    
    // Validate and update errors
    const error = validateField(fieldName, value, index);
    const errorKey = index !== null ? `${fieldName}_${index}` : fieldName;
    setErrors(prev => ({ 
      ...prev, 
      [errorKey]: error,
      // Clear related errors
      wrongs: '',
      duplicate: ''
    }));
  };

  // Handle blur events
  const handleBlur = (fieldName, index = null) => {
    const touchedKey = index !== null ? `${fieldName}_${index}` : fieldName;
    setTouched(prev => ({ ...prev, [touchedKey]: true }));
    
    let value;
    switch (fieldName) {
      case 'question':
        value = question;
        break;
      case 'correct':
        value = correct;
        break;
      case 'wrong':
        value = wrongs[index];
        break;
      default:
        return;
    }
    
    const error = validateField(fieldName, value, index);
    const errorKey = index !== null ? `${fieldName}_${index}` : fieldName;
    setErrors(prev => ({ 
      ...prev, 
      [errorKey]: error 
    }));
  };

  // To handle initial edit data
  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.questionText || '');
      setCorrect(initialData.correctAnswer || '');
      
      const wrongOptions = (initialData.options || []).filter(opt => opt !== initialData.correctAnswer);
      
      if (wrongOptions.length === 0) {
        setWrongs(['', '', '']);
      } else if (wrongOptions.length < 3) {
        setWrongs([...wrongOptions, ...Array(3 - wrongOptions.length).fill('')]);
      } else {
        setWrongs(wrongOptions);
      }
      
      if (initialData.image && typeof initialData.image === 'string') {
        setImage(initialData?.image ? `${import.meta.env.VITE_BASE_URL}${initialData?.image}` : null);
        setFile(null);
      } else {
        setImage(null);
        setFile(null);
      }
    } else {
      setQuestion('');
      setCorrect('');
      setWrongs(['', '', '']);
      setImage(null);
      setFile(null);
    }
    
    // Reset validation states
    setErrors({});
    setTouched({});
  }, [initialData, open]);

  const handleAddWrongOption = () => {
    if (wrongs.length < 8) {
      setWrongs([...wrongs, '']);
    }
  };

  const handleRemoveWrongOption = (index) => {
    if (wrongs.length > 2) {
      const newWrongs = wrongs.filter((_, i) => i !== index);
      setWrongs(newWrongs);
      
      // Remove error for removed field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`wrong_${index}`];
        return newErrors;
      });
      
      // Remove touched state for removed field
      setTouched(prev => {
        const newTouched = { ...prev };
        delete newTouched[`wrong_${index}`];
        return newTouched;
      });
    }
  };

  const handleWrongChange = (index, value) => {
    handleFieldChange('wrong', value, index);
  };

  // Handle new image selection and preview
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        setTouched(prev => ({ ...prev, image: true }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        setTouched(prev => ({ ...prev, image: true }));
        return;
      }
      
      setImage(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, image: '' }));
      setTouched(prev => ({ ...prev, image: true }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate entire form
    const formErrors = validateForm();
    setErrors(formErrors);
    
    // Mark all fields as touched
    setTouched({
      question: true,
      correct: true,
      image: true,
      ...Object.fromEntries(wrongs.map((_, index) => [`wrong_${index}`, true]))
    });
    
    // If there are errors, don't submit
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const filteredWrongs = wrongs.filter(w => w.trim() !== '');

    onSubmit?.({
      image: file || null,
      correctAnswer: correct.trim(),
      wrongs: filteredWrongs,
      question: question.trim(),
    });
  };

  if (!open) return null;

  return (
    <div className='w-full p-[20px] overflow-auto h-full min-h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
      <form
        className="bg-white p-[32px] h-full overflow-auto rounded-[24px] max-w-[600px] w-full max-md:p-[16px] max-md:overflow-scroll max-md:max-h-[90vh]"
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
          {/* Image upload */}
          <div>
            <label className="text-[#7C7C7C] text-[14px] font-medium mb-2 block">
              Perfume Image <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex justify-center items-center border rounded-2xl p-[16px] h-[210px] cursor-pointer transition-colors ${
                errors.image && touched.image ? 'border-red-500 bg-red-50' : 'border-[#EFEFEF] hover:border-gray-300'
              }`}
              onClick={() => fileInput.current.click()}
            >
              {image ? (
                <div className="relative w-full h-full">
                  <img src={image} alt="perfume" className="object-contain max-h-full max-w-full mx-auto" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                      setFile(null);
                      if (fileInput.current) fileInput.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center text-center">
                  <img src={addpic_icon} alt="" className="mb-2" />
                  <p className='text-[#666666]'>Add Perfume Pic</p>
                  <p className='text-[#999999] text-xs mt-1'>Click to upload (Max 5MB)</p>
                </div>
              )}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>
            {errors.image && touched.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          {/* Question Field */}
          <div>
            <InputField
              label="Enter Question"
              placeholder="Enter your question here"
              value={question}
              onChange={e => handleFieldChange('question', e.target.value)}
              onBlur={() => handleBlur('question')}
              error={touched.question && errors.question}
            />
            {errors.question && touched.question && (
              <p className="text-red-500 text-sm mt-1">{errors.question}</p>
            )}
            <span className="text-gray-500 text-xs mt-1">
              {question.length}/500 characters
            </span>
          </div>

          {/* Correct answer */}
          <div>
            <InputField
              label="Enter Correct Answer"
              placeholder="Enter the correct answer"
              value={correct}
              onChange={e => handleFieldChange('correct', e.target.value)}
              onBlur={() => handleBlur('correct')}
              error={touched.correct && errors.correct}
            />
            {errors.correct && touched.correct && (
              <p className="text-red-500 text-sm mt-1">{errors.correct}</p>
            )}
            <span className="text-gray-500 text-xs mt-1">
              {correct.length}/100 characters
            </span>
          </div>

          {/* Wrong Options Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[#7C7C7C] text-[14px] font-medium">
                Wrong Answers ({wrongs.length} options) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddWrongOption}
                disabled={wrongs.length >= 8}
                className={`text-sm px-3 py-1 rounded-md transition-colors ${
                  wrongs.length >= 8 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                + Add Wrong Option
              </button>
            </div>

            <div className="space-y-3">
              {wrongs.map((wrong, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <InputField
                      label={`Wrong Answer ${index + 1} ${index < 2 ? '*' : ''}`}
                      placeholder={`Enter wrong answer ${index + 1}`}
                      value={wrong}
                      onChange={e => handleWrongChange(index, e.target.value)}
                      onBlur={() => handleBlur('wrong', index)}
                      error={touched[`wrong_${index}`] && errors[`wrong_${index}`]}
                    />
                    <span className="text-gray-500 text-xs mt-1">
                      {wrong.length}/100 characters
                    </span>
                  </div>
                  
                  {wrongs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWrongOption(index)}
                      className="mt-8 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove this option"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Error messages */}
            {errors.wrongs && (
              <p className="text-red-500 text-sm mt-2">{errors.wrongs}</p>
            )}
            {errors.duplicate && (
              <p className="text-red-500 text-sm mt-2">{errors.duplicate}</p>
            )}

            <p className="text-gray-500 text-xs mt-2">
              At least 2 wrong answers are required. You can add up to 8 options total.
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

export default GuessTheBottlePopup;
