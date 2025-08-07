import React, { useEffect, useState } from 'react';
import cross_icon from '../../../assets/icons/cross-icon.svg';
import InputField from '../../Form/InputField';

const ScentOrNotPopup = ({ open, onClose, onSubmit, initialData = null }) => {
  const [question, setQuestion] = useState('');
  const [correct, setCorrect] = useState('True');

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.questionText || '');
      setCorrect(initialData.correctAnswer || 'True');
    } else {
      setQuestion('');
      setCorrect('True');
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ question, correctAnswer: correct });
  };

  if (!open) return null;

  return (
    <div className='w-full min-h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
      <form
        className="bg-white p-[32px] rounded-[24px] max-w-[600px] w-full max-md:p-[16px] max-md:overflow-scroll max-md:h-[600px]"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between">
          <h5 className='text-[20px] text-[#352AA4] font-semibold'>
            {initialData ? 'Edit Question' : 'Add Question'}
          </h5>
          <button type="button" onClick={onClose} className='cursor-pointer'>
            <img src={cross_icon} alt="Close" />
          </button>
        </div>
        <div className="mt-[20px] flex flex-col gap-[16px]">
          <InputField
            label="Enter Question"
            placeholder="Enter here"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />
          <label className='flex flex-col w-full'>
            <span className='text-[#7C7C7C] text-[14px]'>Enter Correct Answer</span>
            <select
              className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]'
              value={correct}
              onChange={e => setCorrect(e.target.value)}
              required
            >
              <option value="True">True</option>
              <option value="False">False</option>
            </select>
          </label>
        </div>
        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
          <button type="submit" className='btn-pri'>
            {initialData ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScentOrNotPopup;
