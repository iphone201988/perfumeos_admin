import React, { useState } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import ConfirmationModal from '../Modal/ConfirmationModal';

const ViewArticle = ({ open, onClose, data = null, onEdit, onRemove }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [type, setType] = useState(1);
    if (!open || !data) return null
    const handleConfirmRemove = () => {
        setIsModalOpen(false);
        onRemove(data._id, type);
    };

    const handleCancelRemove = () => {
        setIsModalOpen(false);
    };

    return (
        <div className='w-full p-[20px] h-full overflow-auto min-h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
            <div className="bg-[#fff] p-[32px] h-full overflow-auto rounded-[24px] max-w-[600px] w-full max-md:p-[16px] max-md:overflow-scroll max-md:h-[600px]">
                <div className="flex items-center justify-between">
                    <h5 className='text-[20px] text-[#352AA4] font-semibold'>Article Details</h5>
                    <button className='cursor-pointer' onClick={onClose} aria-label="Close">
                        <img src={cross_icon} alt="Close" />
                    </button>
                </div>
                <div className="mt-[20px] flex flex-col gap-[16px]">
                    <div className="flex justify-center items-center border border-[#EFEFEF] rounded-2xl p-[16px] h-[210px]">
                        {data.image ? (
                            <img
                                src={typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image)}
                                alt="Article"
                                className="max-h-[150px] rounded-xl object-contain"
                            />
                        ) : (
                            <span className="text-[#7C7C7C]">No Image</span>
                        )}
                    </div>

                    <div>
                        <span className='text-[#7C7C7C] text-[14px]'>Article title</span>
                        <p className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] mt-[4px] min-h-[20px]'>
                            {data.title}
                        </p>
                    </div>

                    <div>
                        <span className='text-[#7C7C7C] text-[14px]'>Description</span>
                        <p className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] mt-[4px] min-h-[120px] whitespace-pre-line'>
                            {data.content}
                        </p>
                    </div>
                </div>

                <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
                    <button
                        onClick={onClose}
                        className="text-gray-500 bg-white border-2 rounded-full border-gray-500 hover:bg-gray-500 hover:text-white font-semibold py-2 px-4 transition-colors duration-300"
                    >
                        Close
                    </button>
                    {onEdit && (
                        <button
                            type="button"
                            className="btn-pri"
                            onClick={onEdit}
                        >
                            Edit
                        </button>
                    )}
                    {onRemove && (
                        <>
                            <button
                                type="button"
                                className={` bg-white border-2 rounded-full font-semibold py-2 px-4 transition-colors duration-300 ${data?.isDeleted ? "text-green-500 border-green-500 hover:bg-green-500 hover:text-white" : "text-red-500 border-red-500 hover:bg-red-500 hover:text-white"}`}
                                onClick={() => { setIsModalOpen(true); setType(1); }}
                            >
                                {data?.isDeleted ? "Restore" : "Delete"}
                            </button>
                            <button
                                type="button"
                                className={` bg-white border-2 rounded-full font-semibold py-2 px-4 transition-colors duration-300 text-red-600 border-red-600 hover:bg-red-600 hover:text-white`}
                                onClick={() => { setIsModalOpen(true); setType(2); }}
                            >
                                Hard Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCancelRemove}
                onConfirm={handleConfirmRemove}
               message= {type === 1 ?  data?.isDeleted ? "Are you sure you want to restore this badge?" :"Are you sure you want to delete this badge?" : "Are you sure you want to hard delete this badge?"}
                    className={type === 1 ? data?.isDeleted ? "text-green-500 border-green-500 hover:bg-green-500" : "text-red-500 border-red-500 hover:bg-red-500": "text-red-500 border-red-500 hover:bg-red-500"}
            />
        </div >
    )
}

export default ViewArticle
