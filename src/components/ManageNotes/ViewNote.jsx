import React, { useEffect, useState } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import user_icon from '../../assets/user-img.png'
import ConfirmationModal from '../Modal/ConfirmationModal'

const ViewNote = ({ open, onClose, noteData = null, onEdit, onRemove }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [type, setType] = useState(1);

    const handleConfirmRemove = () => {
        setIsModalOpen(false);
        onRemove(noteData._id, type);
    };

    const handleCancelRemove = () => {
        setIsModalOpen(false);
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        // Cleanup function to restore body scroll
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [open])

    // Auto-close modal if not open
    if (!open || !noteData) return null

    // Handle image URLs
    const getImageUrl = (imagePath) => {
        if (!imagePath) return user_icon
        return imagePath.startsWith('http')
            ? imagePath
            : `${import.meta.env.VITE_BASE_URL}${imagePath}`
    }

    // Format date display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (error) {
            return 'Invalid Date'
        }
    }


    return (
        <div className='w-full min-h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center p-4'>
            <div className="bg-white rounded-[24px] max-w-[700px] w-full max-h-[90vh] overflow-y-auto p-8 max-md:p-4 max-md:max-h-[95vh]">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h5 className='text-[20px] text-[#352AA4] font-semibold'>
                        Note Details
                    </h5>
                    <button
                        type="button"
                        className='cursor-pointer hover:opacity-70 transition-opacity'
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <img src={cross_icon} alt="Close" />
                    </button>
                </div>

                {/* Note Images */}
                <div className="flex gap-4 mb-6 max-md:flex-col">
                    <div className="flex-1">
                        <div className="border border-[#EFEFEF] rounded-2xl p-4 h-[200px] flex items-center justify-center">
                            <img
                                src={getImageUrl(noteData.image)}
                                alt={noteData.name || 'Note'}
                                className="max-h-[160px] max-w-full object-contain rounded-xl"
                            />
                        </div>
                    </div>

                </div>

                {/* Note Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    {/* Note Name */}
                    <div className="md:col-span-2">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Note Name</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333] font-semibold text-lg">{noteData.name || 'N/A'}</span>
                        </div>
                    </div>
                    {/* Other Names */}
                    {noteData.otherNames && noteData.otherNames.length > 0 && (
                        <div className="md:col-span-2">
                            <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Other Names</h6>
                            <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                                <div className="flex flex-wrap gap-2">
                                    {noteData.otherNames.map((name, index) => (
                                        <span
                                            key={index}
                                            className="bg-[#352AA4] text-white px-3 py-1 rounded-full text-sm font-medium"
                                        >
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* scientific Name */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Scientific Name</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333] font-medium">{noteData.scientificName ?? 'N/A'}</span>
                        </div>
                    </div>

                    {/* group */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Group</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333] font-medium">{noteData.group ?? 'N/A'}</span>
                        </div>
                    </div>

                    {/* odor Profile */}
                    <div className="md:col-span-2">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Odor Profile</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{noteData?.odorProfile}</span>
                        </div>
                    </div>

                {/* Description */}
                {noteData.description && (
                    <div className="mb-6">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Description</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{noteData.description}</span>
                        </div>
                    </div>
                )}
                    {/* Created Date */}
                    <div className="md:col-span-2">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Created On</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{formatDate(noteData.createdAt)}</span>
                        </div>
                    </div>
                </div>




                {/* Action Buttons */}
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
                            className="bg-[#352AA4] hover:bg-[#2a1f7a] text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300"
                            onClick={onEdit}
                        >
                            Edit Note
                        </button>
                    )}

                    {onRemove && (
                        <button
                            type="button"
                            className="bg-white border-2 rounded-full font-semibold py-2 px-4 transition-colors duration-300 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                            onClick={() => { setIsModalOpen(true); setType(2); }}
                        >
                            Delete
                        </button>
                    )}
                </div>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={handleCancelRemove}
                    onConfirm={handleConfirmRemove}
                    message={"Are you sure you want to permanently delete this note?"}
                    className={"text-red-500 border-red-500 hover:bg-red-500"}
                />
            </div>
        </div>
    )
}

export default ViewNote
