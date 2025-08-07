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
  const fileInput = useRef();

  // To handle initial edit data
  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.questionText || '');
      setCorrect(initialData.correctAnswer || '');
      setWrongs(
        (initialData.options || []).filter(opt => opt !== initialData.correctAnswer).length
          ? (initialData.options || []).filter(opt => opt !== initialData.correctAnswer)
          : ['', '', '']
      );
      // For image, if value is a string URL, show directly; clear file input
      if (initialData.image && typeof initialData.image === 'string') {
        setImage(initialData?.image? `${import.meta.env.VITE_BASE_URL}${initialData?.image}`:null);
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
  }, [initialData, open]);

  // Handle new image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      image: file || (typeof image === 'string' ? image : null),
      correctAnswer: correct,
      wrongs,
      question,
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
          {/* Image upload */}
          <div
            className="flex justify-center items-center border border-[#EFEFEF] rounded-2xl p-[16px] h-[210px] cursor-pointer"
            onClick={() => fileInput.current.click()}
          >
            {image ? (
              <img src={image} alt="perfume" className="object-contain max-h-full max-w-full" />
            ) : (
              <div className="flex flex-col justify-center items-center">
                <img src={addpic_icon} alt="" />
                <p className='text-[#666666]'>Add Perfume Pic</p>
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

          <InputField
            label="Enter Question"
            placeholder="Enter here"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />
          {/* Correct answer */}
          <InputField
            label="Enter Correct Answer"
            placeholder="Enter here"
            value={correct}
            onChange={e => setCorrect(e.target.value)}
            required
          />
          {/* Wrong answers */}
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

export default GuessTheBottlePopup;
