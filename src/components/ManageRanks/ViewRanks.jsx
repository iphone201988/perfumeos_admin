import React, { useEffect, useState } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import user_icon from '../../assets/user-img.png'
import ConfirmationModal from '../Modal/ConfirmationModal'

const ViewRanks = ({ open, onClose, rankData = null, onEdit, onRemove }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [type, setType] = useState(1);
    
    const handleConfirmRemove = () => {
        setIsModalOpen(false);
        onRemove(rankData._id, type);
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
    if (!open || !rankData) return null

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

    // Calculate range span
    const getRangeSpan = () => {
        if (rankData.min !== undefined && rankData.max !== undefined) {
            return rankData.max - rankData.min + 1
        }
        return 'N/A'
    }

    return (
        <div className='w-full min-h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center p-4'>
            <div className="bg-white rounded-[24px] max-w-[700px] w-full max-h-[90vh] overflow-y-auto p-8 max-md:p-4 max-md:max-h-[95vh]">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h5 className='text-[20px] text-[#352AA4] font-semibold'>
                        Rank Details
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

                {/* Rank Images */}
                <div className="flex gap-4 mb-6 max-md:flex-col">
                    <div className="flex-1">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Main Image</h6>
                        <div className="border border-[#EFEFEF] rounded-2xl p-4 h-[200px] flex items-center justify-center">
                            <img
                                src={getImageUrl(rankData.image)}
                                alt={rankData.name || 'Rank'}
                                className="max-h-[160px] max-w-full object-contain rounded-xl"
                            />
                        </div>
                    </div>

                    {rankData.otherImage && (
                        <div className="flex-1">
                            <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Alternative Image</h6>
                            <div className="border border-[#EFEFEF] rounded-2xl p-4 h-[200px] flex items-center justify-center">
                                <img
                                    src={getImageUrl(rankData.otherImage)}
                                    alt={`${rankData.name || 'Rank'} Alternative`}
                                    className="max-h-[160px] max-w-full object-contain rounded-xl"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Rank Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    {/* Rank Name */}
                    <div className="md:col-span-2">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Rank Name</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333] font-semibold text-lg">{rankData.name || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Min Value */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Minimum Value</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333] font-medium">{rankData.min ?? 'N/A'}</span>
                        </div>
                    </div>

                    {/* Max Value */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Maximum Value</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333] font-medium">{rankData.max ?? 'N/A'}</span>
                        </div>
                    </div>

                    {/* Range Span */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Range Span</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{getRangeSpan()} points</span>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Status</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span
                                className={
                                    rankData.status === 'Active'
                                        ? 'px-3 py-1 text-xs rounded-full bg-green-100 text-green-800'
                                        : rankData.status === 'Inactive'
                                        ? 'px-3 py-1 text-xs rounded-full bg-red-100 text-red-800'
                                        : 'px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800'
                                }
                            >
                                {rankData.status || 'Active'}
                            </span>
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="md:col-span-2">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Created On</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{formatDate(rankData.createdAt)}</span>
                        </div>
                    </div>
                </div>


                {/* Description */}
                {rankData.description && (
                    <div className="mb-6">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Description</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{rankData.description}</span>
                        </div>
                    </div>
                )}


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
                            Edit Rank
                        </button>
                    )}
                    
                    {onRemove && (
                        <>
                            <button
                                type="button"
                                className={`bg-white border-2 rounded-full font-semibold py-2 px-4 transition-colors duration-300 ${rankData?.isDeleted ? "text-green-500 border-green-500 hover:bg-green-500 hover:text-white" : "text-red-500 border-red-500 hover:bg-red-500 hover:text-white"}`}
                                onClick={() => {setIsModalOpen(true); setType(1); }}
                            >
                                {rankData?.isDeleted ? "Restore" : "Delete"}
                            </button>
                            <button
                                type="button"
                                className="bg-white border-2 rounded-full font-semibold py-2 px-4 transition-colors duration-300 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                onClick={() => { setIsModalOpen(true); setType(2); }}
                            >
                                Hard Delete
                            </button>
                        </>
                    )}
                </div>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={handleCancelRemove}
                    onConfirm={handleConfirmRemove}
                    message={type === 1 ? rankData?.isDeleted ? "Are you sure you want to restore this rank?" : "Are you sure you want to delete this rank?" : "Are you sure you want to hard delete this rank?"}
                    className={type === 1 ? rankData?.isDeleted ? "text-green-500 border-green-500 hover:bg-green-500" : "text-red-500 border-red-500 hover:bg-red-500" : "text-red-500 border-red-500 hover:bg-red-500"}
                />
            </div>
        </div>
    )
}

export default ViewRanks
