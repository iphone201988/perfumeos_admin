import React, { useState, useEffect } from 'react';
import edit_icon from '../assets/icons/edit-icon.svg';
import ClassicTriviaPopup from '../components/ManageQuiz/ClassicTriviaPopup/ClassicTriviaPopup';
import ScentOrNotPopup from '../components/ManageQuiz/ScentOrNotPopup/ScentOrNotPopup';
import GuessTheBottlePopup from '../components/ManageQuiz/GuessTheBottlePopup/GuessTheBottlePopup';
import { useAddQuestionMutation, useUpdateQuestionMutation, useQuestionsQuery } from '../api';
import Pagination from '../components/Table/Pagination';

const ManageQuiz = () => {
  const [tab, setTab] = useState('trivia');
  const [popup, setPopup] = useState(null); // 'trivia' | 'scent' | 'guess' or null
  const [loading, setLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // { type, data } or null
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const [addQuestion] = useAddQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const { data, isLoading, refetch } = useQuestionsQuery({ page: currentPage, limit: 5, type: tab });

  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    setLoading(isLoading);
    setQuestions(data?.data?.questions || []);
  }, [data, isLoading]);

  useEffect(() => {
    refetch();
  }, [tab, refetch, ]);

  const handleTabChange = (newTab) => {
    setLoading(true);
    setTab(newTab);
    setCurrentPage(1);
    setEditingQuestion(null);
  };

  const handleAdd = (type) => {
    setEditingQuestion(null);
    setPopup(type);
  };

  const handleEdit = (question) => {
    setEditingQuestion({ type: tab, data: question });
    setPopup(tab);
  };

  const handleClosePopup = () => {
    setPopup(null);
    setEditingQuestion(null);
  };

  const handleSaveQuestion = async (type, questionData) => {
    try {
      const formData = new FormData();
      formData.append('questionText', questionData.question);
      formData.append('correctAnswer', questionData.correctAnswer);

      questionData.options.forEach((opt, i) => {
        formData.append(`options[${i}]`, opt);
      });

      if (questionData.image) {
        formData.append('file', questionData.image);
      }

      if (editingQuestion) {
        console.log("editingQuestion", editingQuestion);
        await updateQuestion({ id: editingQuestion.data._id, formData }).unwrap();
      } else {
        formData.append('type', type);
        await addQuestion(formData).unwrap();
      }

      await refetch();
      handleClosePopup();
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  const totalPages = data?.data?.pagination?.totalPage || 10;
  console.log("totalPages", totalPages);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    refetch({ page, limit: 10, type: tab });
  };

  return (
    <div>
      {/* Tabs */}
      <div className="tabs flex gap-[24px] mb-[16px]">
        <button className={tab === 'trivia' ? 'btn-pri' : 'btn-sec'} onClick={() => handleTabChange('trivia')}>Classic Trivia</button>
        <button className={tab === 'scent' ? 'btn-pri' : 'btn-sec'} onClick={() => handleTabChange('scent')}>Scent or Not?</button>
        <button className={tab === 'guess' ? 'btn-pri' : 'btn-sec'} onClick={() => handleTabChange('guess')}>Guess the Bottle</button>
        <button className="btn-pri ml-auto" onClick={() => handleAdd(tab)}>+ Add</button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-[#352AA4] font-semibold py-4">Loading questions...</div>
      )}

      {/* Questions List */}
      {!loading && (
        <div className='bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]'>
          <div className="flex justify-between items-center flex-wrap max-md:gap-[12px] mb-3">
            <h6 className='text-[20px] font-semibold text-[#352AA4]'>
              {tab === 'trivia' && "Classic Trivia Questions"}
              {tab === 'scent' && "Scent Or Not? Questions"}
              {tab === 'guess' && "Guess The Bottle Questions"}
            </h6>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex items-center gap-[6px]">
                <span className='w-[24px] h-[24px] rounded-full bg-[#F6595A] flex'></span>
                <p className='text-[18px] font-medium text-[#7C7C7C]'>Wrong Answer</p>
              </div>
              <div className="flex items-center gap-[6px]">
                <span className='w-[24px] h-[24px] rounded-full bg-[#0CDD39] flex'></span>
                <p className='text-[18px] font-medium text-[#7C7C7C]'>Correct Answer</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mt-[4px]">

            {questions.map((q, idx) => (
              <div key={q.id} className="border-b border-[rgba(21,201,201,0.50)] py-[20px]">
                <div className="flex items-center justify-between">
                  <p className='text-[20px] font-medium text-[#7C7C7C]'>
                    <span className='text-[#4896FF]'>Q{(currentPage - 1) * 5 + idx + 1}.</span>{q.questionText}
                  </p>
                  <div className="flex items-center gap-[6px] cursor-pointer" onClick={() => handleEdit(q)}>
                    <img src={edit_icon} alt="Edit" />
                    <span className='text-[#352AA4]'>edit question</span>
                  </div>
                </div>
                <div className="flex gap-[24px] flex-wrap max-md:gap-[16px] mt-[12px] ml-[30px]">
                  {tab === 'trivia' && q.options?.map((a, i) => (
                    <p key={i} className={`text-[18px] font-medium ${a === q.correctAnswer ? 'text-[#0CDD39]' : 'text-[#F6595A]'}`}>{a}</p>
                  ))}
                  {tab === 'scent' && q.options?.map((a, i) => (
                    <p key={i} className={`text-[18px] font-medium ${a === q.correctAnswer ? 'text-[#0CDD39]' : 'text-[#F6595A]'}`}>{a}</p>
                  ))}
                  {tab === 'guess' && (
                    <>
                      {q.image && (
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}${q.image}`}
                          alt={`Question ${idx + 1} image`}
                          className="w-[60px] h-[60px] inline-block border rounded-full object-cover mr-2 cursor-pointer"
                          onClick={() => setSelectedImage(q.image)} // Assuming setSelectedImage is a state setter
                        />
                      )}
                      {selectedImage && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setSelectedImage(null)}>
                          <div className="bg-white p-4 rounded-lg text-center relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="absolute top-2 right-2 text-2xl font-bold text-gray-500 cursor-pointer bg-transparent border-0"
                              onClick={() => setSelectedImage(null)}
                              aria-label="Close modal"
                            >
                              &times;
                            </button>
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}${selectedImage}`}
                              alt="Enlarged question image"
                              className="max-w-full max-h-[80vh] mt-4"
                            />
                          </div>
                        </div>
                      )}
                      {q.options?.map((w, i) => (
                        <p key={i} className={`text-[18px] font-medium ${q.correctAnswer === w ? 'text-[#0CDD39]' : 'text-[#F6595A]'}`}>{w}</p>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="py-12 text-center text-gray-400">No questions yet.</div>
            )}

          </div>
          {/* Pagination placeholder */}
          {totalPages && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
          {/* <div className="flex items-center justify-between mt-4">
            <nav className="inline-flex gap-1">
              <button className="px-3 py-1 bg-[#fff] rounded-[4px] text-[#352AA4]" disabled={currentPage === 1}>Previous</button>
              {[1, 2, 3, '...', totalPages].map((p, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded-[4px] text-sm ${p === currentPage ? "bg-[#352AA4] text-white" : "bg-white text-[#352AA4]"}`}
                  disabled={p === '...'}
                >{p}</button>
              ))}
              <button className="px-3 py-1 bg-white rounded-[4px] text-sm text-[#352AA4]" disabled={currentPage === totalPages}>Next</button>
            </nav>
          </div> */}
        </div>
      )}

      {/* Popups with initialData for editing */}
      <ClassicTriviaPopup
        open={popup === 'trivia'}
        onClose={handleClosePopup}
        initialData={editingQuestion?.type === 'trivia' ? editingQuestion.data : null}
        onSubmit={data => handleSaveQuestion('trivia', {
          question: data.question,
          options: [...data.wrongs, data.correctAnswer],
          correctAnswer: data.correctAnswer
        })}
      />
      <ScentOrNotPopup
        open={popup === 'scent'}
        onClose={handleClosePopup}
        initialData={editingQuestion?.type === 'scent' ? editingQuestion.data : null}
        onSubmit={data => handleSaveQuestion('scent', {
          question: data.question,
          correctAnswer: data.correctAnswer,
          options: [data.correctAnswer, data.correctAnswer === 'True' ? 'False' : 'True']
        })}
      />
      <GuessTheBottlePopup
        open={popup === 'guess'}
        onClose={handleClosePopup}
        initialData={editingQuestion?.type === 'guess' ? editingQuestion.data : null}
        onSubmit={data => handleSaveQuestion('guess', {
          question: data.question,
          correctAnswer: data.correctAnswer,
          image: data.image,
          options: [data.correctAnswer, ...data.wrongs]
        })}
      />
    </div>
  );
};

export default ManageQuiz;
