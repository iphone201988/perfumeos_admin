import React, { useEffect, useRef, useState } from 'react';
import cross_icon from '../../../assets/icons/cross-icon.svg';
import addpic_icon from '../../../assets/icons/addpic-icon.svg';
import InputField from '../../Form/InputField';

const GuessTheBottlePopup = ({ open, onClose, onSubmit, initialData = null }) => {
  const [image, setImage] = useState(null);
  const [correct, setCorrect] = useState('');
  const [question, setQuestion] = useState('');
  const [wrongs, setWrongs] = useState(['', '', '']);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInput = useRef();

  // To handle initial edit data
  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.questionText || '');
      setCorrect(initialData.correctAnswer || '');
      
      // Get wrong answers from options (exclude correct answer)
      const wrongOptions = (initialData.options || []).filter(opt => opt !== initialData.correctAnswer);
      
      // Ensure at least 3 wrong options or use existing ones
      if (wrongOptions.length === 0) {
        setWrongs(['', '', '']);
      } else if (wrongOptions.length < 3) {
        // Pad with empty strings to have at least 3
        setWrongs([...wrongOptions, ...Array(3 - wrongOptions.length).fill('')]);
      } else {
        setWrongs(wrongOptions);
      }
      
      // For image, if value is a string URL, show directly; clear file input
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
    setErrors({});
  }, [initialData, open]);

  // ✅ Add new wrong option
  const handleAddWrongOption = () => {
    if (wrongs.length < 8) { // Limit to 8 wrong options max
      setWrongs([...wrongs, '']);
    }
  };

  // ✅ Remove wrong option (minimum 2 required)
  const handleRemoveWrongOption = (index) => {
    if (wrongs.length > 2) { // Keep at least 2 wrong options
      const newWrongs = wrongs.filter((_, i) => i !== index);
      setWrongs(newWrongs);
    }
  };

  // ✅ Update specific wrong option
  const handleWrongChange = (index, value) => {
    const newWrongs = [...wrongs];
    newWrongs[index] = value;
    setWrongs(newWrongs);
    
    // Clear error for this field
    if (errors[`wrong_${index}`]) {
      setErrors(prev => ({ ...prev, [`wrong_${index}`]: '' }));
    }
  };

  // Handle new image selection and preview
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }
      
      setImage(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  // ✅ Enhanced validation
  const validateForm = () => {
    const newErrors = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }

    if (!correct.trim()) {
      newErrors.correct = 'Correct answer is required';
    }

    // Check for at least 2 filled wrong answers
    const filledWrongs = wrongs.filter(w => w.trim() !== '');
    if (filledWrongs.length < 2) {
      newErrors.wrongs = 'At least 2 wrong answers are required';
    }

    // Check for duplicate answers
    const allAnswers = [correct.trim(), ...wrongs.map(w => w.trim())].filter(Boolean);
    const uniqueAnswers = new Set(allAnswers);
    if (allAnswers.length !== uniqueAnswers.size) {
      newErrors.duplicate = 'All answers must be unique';
    }

    // Image is required for guess the bottle
    if (!image && !initialData?.image) {
      newErrors.image = 'Image is required for Guess the Bottle question';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Filter out empty wrong answers
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
          {/* Image upload */}
          <div>
            <label className="text-[#7C7C7C] text-[14px] font-medium mb-2 block">
              Perfume Image <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex justify-center items-center border rounded-2xl p-[16px] h-[210px] cursor-pointer transition-colors ${
                errors.image ? 'border-red-500 bg-red-50' : 'border-[#EFEFEF] hover:border-gray-300'
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
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          {/* Question Field */}
          <div>
            <InputField
              label="Enter Question"
              placeholder="Enter your question here"
              value={question}
              onChange={e => {
                setQuestion(e.target.value);
                if (errors.question) setErrors(prev => ({ ...prev, question: '' }));
              }}
              required
            />
            {errors.question && (
              <p className="text-red-500 text-sm mt-1">{errors.question}</p>
            )}
          </div>

          {/* Correct answer */}
          <div>
            <InputField
              label="Enter Correct Answer"
              placeholder="Enter the correct answer"
              value={correct}
              onChange={e => {
                setCorrect(e.target.value);
                if (errors.correct) setErrors(prev => ({ ...prev, correct: '' }));
              }}
              required
            />
            {errors.correct && (
              <p className="text-red-500 text-sm mt-1">{errors.correct}</p>
            )}
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

            {/* Wrong Answer Fields */}
            <div className="space-y-3">
              {wrongs.map((wrong, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <InputField
                      label={`Wrong Answer ${index + 1}`}
                      placeholder={`Enter wrong answer ${index + 1}`}
                      value={wrong}
                      onChange={e => handleWrongChange(index, e.target.value)}
                      required={index < 2} // First 2 are required
                    />
                    {errors[`wrong_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`wrong_${index}`]}</p>
                    )}
                  </div>
                  
                  {/* Remove button (only show if more than 2 options) */}
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

            {/* Helper text */}
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
          <button type="submit" className='btn-pri'>
            {initialData ? 'Save Changes' : 'Add Question'}
          </button>
        </div>

      
      </form>
    </div>
  );
};

export default GuessTheBottlePopup;
