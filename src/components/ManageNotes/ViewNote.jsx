import React, { useEffect, useState } from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'
import user_icon from '../../assets/user-img.png'
import ConfirmationModal from '../Modal/ConfirmationModal'
import { useDeleteImageMutation } from '../../api'
import { toast } from 'react-toastify'

const ViewNote = ({ open, onClose, noteData = null, onEdit, onRemove }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [type, setType] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [deleteImage] = useDeleteImageMutation();
    const [localImages, setLocalImages] = useState([]);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [confirmDeleteImage, setConfirmDeleteImage] = useState(false);

    const handleConfirmRemove = () => {
        setIsModalOpen(false);
        onRemove(noteData._id, type);
    };

    const handleCancelRemove = () => {
        setIsModalOpen(false);
    };

    // Initialize images from noteData
    useEffect(() => {
        if (noteData) {
            const uploadedObjs = (noteData.uploadImages || []).map(img => ({
                url: img.url,
                status: img.status,
                _id: img._id,
                likeCount: img.likeCount
            }));

            setLocalImages(uploadedObjs);
            setSelectedImageIndex(0);
        }
    }, [noteData]);

    const handleDeleteImageConfirm = (imageId) => {
        setImageToDelete(imageId);
        setConfirmDeleteImage(true);
    };

    const performDeleteImage = async () => {
        if (!imageToDelete) return;
        try {
            await deleteImage(imageToDelete).unwrap();
            toast.success("Image deleted successfully");

            // Remove from local state
            const updatedImages = localImages.filter(img => img._id !== imageToDelete);
            setLocalImages(updatedImages);

            // Adjust index
            if (selectedImageIndex >= updatedImages.length) {
                setSelectedImageIndex(Math.max(0, updatedImages.length - 1));
            }

            setConfirmDeleteImage(false);
            setImageToDelete(null);
        } catch (error) {
            console.error("Delete image error:", error);
            toast.error(error?.data?.message || "Failed to delete image");
        }
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
            setSelectedImageIndex(0);
        } else {
            document.body.style.overflow = 'unset'
        }

        // Cleanup function to restore body scroll
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [open, noteData?._id])

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
                        <div className="relative group border border-[#EFEFEF] rounded-2xl p-4 h-[300px] flex items-center justify-center bg-gray-50">
                            {(() => {
                                const currentImage = localImages[selectedImageIndex];

                                if (!currentImage) return <span className="text-gray-400">No Image</span>;

                                return (
                                    <>
                                        <img
                                            src={getImageUrl(currentImage.url)}
                                            alt={noteData.name || 'Note'}
                                            className="max-h-full max-w-full object-contain rounded-xl"
                                        />

                                        {/* Status Badge */}
                                        <div className={`absolute top-4 left-4 ${currentImage.status === 'approved' ? 'bg-green-500' :
                                                currentImage.status === 'pending' ? 'bg-yellow-500' :
                                                    currentImage.status === 'rejected' ? 'bg-red-500' :
                                                        'bg-[#352AA4]'
                                            } text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 capitalize`}>
                                            {currentImage.status || 'Main'}
                                        </div>

                                        {/* Like Count Badge */}
                                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1">
                                            <span>♥</span>
                                            <span>{currentImage.likeCount || 0}</span>
                                        </div>

                                        {/* Delete Button - Only for uploaded images */}
                                        {currentImage._id !== 'main' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteImageConfirm(currentImage._id);
                                                }}
                                                className="absolute top-4 right-16 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-all z-20"
                                                title="Delete Image"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}

                                        {/* Navigation Arrows */}
                                        {localImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setSelectedImageIndex(prev => prev === 0 ? localImages.length - 1 : prev - 1)}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                                >
                                                    <span className="text-xl font-bold">‹</span>
                                                </button>
                                                <button
                                                    onClick={() => setSelectedImageIndex(prev => prev === localImages.length - 1 ? 0 : prev + 1)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                                >
                                                    <span className="text-xl font-bold">›</span>
                                                </button>
                                                {/* Counter */}
                                                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                                    {selectedImageIndex + 1} / {localImages.length}
                                                </div>
                                            </>
                                        )}
                                    </>
                                );
                            })()}
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

                {/* Confirmation Modal for Note Deletion */}
                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={handleCancelRemove}
                    onConfirm={handleConfirmRemove}
                    message={"Are you sure you want to permanently delete this note?"}
                    className={"text-red-500 border-red-500 hover:bg-red-500"}
                />

                {/* Confirmation Modal for Image Deletion */}
                <ConfirmationModal
                    isOpen={confirmDeleteImage}
                    onClose={() => setConfirmDeleteImage(false)}
                    onConfirm={performDeleteImage}
                    message="Are you sure you want to delete this image? This cannot be undone."
                />
            </div>
        </div>
    )
}

export default ViewNote
