import React, { useEffect, useState } from 'react';
import cross_icon from '../../../assets/icons/cross-icon.svg';
import InputField from '../../Form/InputField';

const ClassicTriviaPopup = ({ open, onClose, onSubmit, initialData = null }) => {
  const [question, setQuestion] = useState('');
  const [correct, setCorrect] = useState('');
  const [wrongs, setWrongs] = useState(['', '', '']); // Start with 3 wrong options

  // On open or initialData change, populate fields for editing
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
    } else {
      // Reset for adding new question
      setQuestion('');
      setCorrect('');
      setWrongs(['', '', '']);
    }
  }, [initialData, open]);

  // Add new wrong option
  const handleAddWrongOption = () => {
    if (wrongs.length < 8) { // Limit to 8 wrong options max
      setWrongs([...wrongs, '']);
    }
  };

  // Remove wrong option (minimum 2 required)
  const handleRemoveWrongOption = (index) => {
    if (wrongs.length > 2) { // Keep at least 2 wrong options
      const newWrongs = wrongs.filter((_, i) => i !== index);
      setWrongs(newWrongs);
    }
  };

  // Update specific wrong option
  const handleWrongChange = (index, value) => {
    const newWrongs = [...wrongs];
    newWrongs[index] = value;
    setWrongs(newWrongs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty wrong answers before submitting
    const filteredWrongs = wrongs.filter(w => w.trim() !== '');
    
    onSubmit?.({
      question,
      correctAnswer: correct,
      wrongs: filteredWrongs,
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
            {initialData ? 'Edit Question' : 'Add Question'}
          </h5>
          <button type="button" onClick={onClose} className='cursor-pointer hover:opacity-70'>
            <img src={cross_icon} alt="Close" />
          </button>
        </div>
        
        <div className="mt-[20px] flex flex-col gap-[16px]">
          {/* Question Field */}
          <InputField
            label="Enter Question"
            placeholder="Enter your question here"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />
          
          {/* Correct Answer Field */}
          <InputField
            label="Enter Correct Answer"
            placeholder="Enter the correct answer"
            value={correct}
            onChange={e => setCorrect(e.target.value)}
            required
          />

          {/* Wrong Options Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[#7C7C7C] text-[14px] font-medium">
                Wrong Answers ({wrongs.length} options)
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
            {wrongs.map((wrong, index) => (
              <div key={index} className="flex items-start gap-2 mb-3">
                <div className="flex-1">
                  <InputField
                    label={`Wrong Answer ${index + 1}`}
                    placeholder={`Enter wrong answer ${index + 1}`}
                    value={wrong}
                    onChange={e => handleWrongChange(index, e.target.value)}
                    required={index < 2} // First 2 are required
                  />
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

            {/* Helper text */}
            <p className="text-gray-500 text-xs mt-2">
              At least 2 wrong answers are required. You can add up to 8 wrong options.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
          <button type="button" onClick={onClose} className='btn-sec'>
            Cancel
          </button>
          <button type="submit" className='btn-pri'>
            {initialData ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassicTriviaPopup;
