import React, { useEffect, useState } from 'react';
import cross_icon from '../../../assets/icons/cross-icon.svg';
import InputField from '../../Form/InputField';

const ClassicTriviaPopup = ({ open, onClose, onSubmit, initialData = null }) => {
  const [question, setQuestion] = useState('');
  const [correct, setCorrect] = useState('');
  const [wrongs, setWrongs] = useState(['', '', '']);

  // On open or initialData change, populate fields for editing
  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.questionText || '');
      setCorrect(initialData.correctAnswer || '');
      // assume wrong answers = options except correctAnswer
      const wrongOptions = (initialData.options || []).filter(opt => opt !== initialData.correctAnswer);
      // Fill with 3 wrongs or pad if less
      setWrongs([
        wrongOptions[0] || '',
        wrongOptions[1] || '',
        wrongOptions[2] || ''
      ]);
    } else {
      // Reset for adding new question
      setQuestion('');
      setCorrect('');
      setWrongs(['', '', '']);
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      question,
      correctAnswer: correct,
      wrongs,
    });
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
          <InputField
            label="Enter Correct Answer"
            placeholder="Enter here"
            value={correct}
            onChange={e => setCorrect(e.target.value)}
            required
          />
          {wrongs.map((w, i) => (
            <InputField
              key={i}
              label={`Enter Wrong answer`}
              placeholder="Enter here"
              value={w}
              onChange={e => {
                const newWrongs = [...wrongs];
                newWrongs[i] = e.target.value;
                setWrongs(newWrongs);
              }}
              required
            />
          ))}
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

export default ClassicTriviaPopup;
