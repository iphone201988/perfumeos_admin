import React, { useEffect, useState } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import user_icon from '../../assets/user-img.png'
import ConfirmationModal from '../Modal/ConfirmationModal'

const ViewBadge = ({ open, onClose, badgeData = null, onEdit, onRemove }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [type, setType] = useState(1);
    const handleConfirmRemove = () => {
        setIsModalOpen(false);
        onRemove(badgeData._id, type);
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
    if (!open || !badgeData) return null

    // Handle image URLs
    const getImageUrl = (imagePath) => {
        if (!imagePath) return user_icon
        return imagePath.startsWith('http')
            ? imagePath
            : `${import.meta.env.VITE_BASE_URL}${imagePath}`
    }

    // Format rarity display
    const getRarityLabel = (rarity) => {
        switch (rarity) {
            case 1: return 'Common'
            case 2: return 'Uncommon'
            case 3: return 'Rare'
            default: return 'Unknown'
        }
    }

    // Format repeat limit display
    const getRepeatLimitLabel = (repeatLimit) => {
        if (!repeatLimit) return 'Not specified'
        return repeatLimit.charAt(0).toUpperCase() + repeatLimit.slice(1)
    }

    return (
        <div className='w-full min-h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center p-4'>
            <div className="bg-white rounded-[24px] max-w-[700px] w-full max-h-[90vh] overflow-y-auto p-8 max-md:p-4 max-md:max-h-[95vh]">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h5 className='text-[20px] text-[#352AA4] font-semibold'>
                        Badge Details
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

                {/* Badge Images */}
                <div className="flex gap-4 mb-6 max-md:flex-col">
                    <div className="flex-1">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Badge Image</h6>
                        <div className="border border-[#EFEFEF] rounded-2xl p-4 h-[200px] flex items-center justify-center">
                            <img
                                src={getImageUrl(badgeData.image)}
                                alt={badgeData.name}
                                className="max-h-[160px] max-w-full object-contain rounded-xl"
                            />
                        </div>
                    </div>

                    {badgeData.otherImage && (
                        <div className="flex-1">
                            <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Black & White Version</h6>
                            <div className="border border-[#EFEFEF] rounded-2xl p-4 h-[200px] flex items-center justify-center">
                                <img
                                    src={getImageUrl(badgeData.otherImage)}
                                    alt={`${badgeData.name || badgeData.title} B&W`}
                                    className="max-h-[160px] max-w-full object-contain rounded-xl"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Badge Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    {/* Badge Title */}
                    <div className="md:col-span-2">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Badge Title</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{badgeData.name || badgeData.title || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Category</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333] capitalize">{badgeData.category || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Points Earned */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Points Earned</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{badgeData.pointEarned || 0}</span>
                        </div>
                    </div>

                    {/* Rarity */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Rarity</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{getRarityLabel(badgeData.rarity)}</span>
                        </div>
                    </div>

                    {/* Required Count */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Required Count</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{badgeData.requiredCount || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Status</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span
                                className={
                                    badgeData.status === 'Active'
                                        ? 'px-3 py-1 text-xs rounded-full bg-green-100 text-green-800'
                                        : 'px-3 py-1 text-xs rounded-full bg-red-100 text-red-800'
                                }
                            >
                                {badgeData.status || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    {/* Created Date */}
                    <div>
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Created On</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{badgeData.joinedOn || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Badge Properties */}
                <div className="mb-6">
                    <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-3">Badge Properties</h6>
                    <div className="flex flex-wrap gap-3">
                        {badgeData.isOneTimeOnly && (
                            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                                One Time Only
                            </span>
                        )}
                        {badgeData.isRepeatable && (
                            <span className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
                                Repeatable
                            </span>
                        )}
                        {badgeData.repeatLimit && (
                            <span className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-full">
                                {getRepeatLimitLabel(badgeData.repeatLimit)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Unlock Condition */}
                {badgeData.unlockCondition && (
                    <div className="mb-4">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Unlock Condition</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{badgeData.unlockCondition}</span>
                        </div>
                    </div>
                )}

                {/* Note */}
                {badgeData.note && (
                    <div className="mb-6">
                        <h6 className="text-[14px] font-medium text-[#7C7C7C] mb-2">Note</h6>
                        <div className="border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px] bg-gray-50">
                            <span className="text-[#333333]">{badgeData.note}</span>
                        </div>
                    </div>
                )}

                {/* Close Button */}
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
                                className={` bg-white border-2 rounded-full font-semibold py-2 px-4 transition-colors duration-300 ${badgeData?.isDeleted ? "text-green-500 border-green-500 hover:bg-green-500 hover:text-white" : "text-red-500 border-red-500 hover:bg-red-500 hover:text-white"}`}
                                onClick={() => {setIsModalOpen(true); setType(1); }}
                            >
                                {badgeData?.isDeleted ? "Restore" : "Delete"}
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
                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={handleCancelRemove}
                    onConfirm={handleConfirmRemove}
                    message= {type === 1 ?  badgeData?.isDeleted ? "Are you sure you want to restore this badge?" :"Are you sure you want to delete this badge?" : "Are you sure you want to hard delete this badge?"}
                    className={type === 1 ? badgeData?.isDeleted ? "text-green-500 border-green-500 hover:bg-green-500" : "text-red-500 border-red-500 hover:bg-red-500": "text-red-500 border-red-500 hover:bg-red-500"}
                />
            </div>
        </div >
    )
}

export default ViewBadge
