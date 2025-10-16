import React, { useRef, useState } from "react";
import addpic_icon from "../../assets/icons/addpic-icon.svg";

const MultipleImageUploader = ({
    onImagesChange,
    currentImages = [],
    error = null,
    required = false,
    maxSizeInMB = 5,
    maxImages = 10,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}) => {
    const inputRef = useRef(null);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    const processFiles = (files) => {
        // Check if adding files exceeds max limit
        if (currentImages.length + files.length > maxImages) {
            onImagesChange(currentImages, null, `You can only upload up to ${maxImages} images`);
            return;
        }

        const validFiles = [];
        const errors = [];
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        files.forEach((file, index) => {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: Invalid file type`);
                return;
            }

            // Validate file size
            if (file.size > maxSizeInBytes) {
                errors.push(`${file.name}: Exceeds ${maxSizeInMB}MB`);
                return;
            }

            const imageUrl = URL.createObjectURL(file);
            validFiles.push({ url: imageUrl, file, id: Date.now() + index });
        });

        if (errors.length > 0) {
            onImagesChange(currentImages, null, errors.join(', '));
            return;
        }

        const updatedImages = [...currentImages, ...validFiles];
        onImagesChange(updatedImages, validFiles.map(f => f.file), null);
    };

    const handleRemoveImage = (indexToRemove) => {
        const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
        onImagesChange(updatedImages, updatedImages.map(img => img.file), null);
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex === null || draggedIndex === index) return;

        const items = [...currentImages];
        const draggedItem = items[draggedIndex];
        items.splice(draggedIndex, 1);
        items.splice(index, 0, draggedItem);

        setDraggedIndex(index);
        onImagesChange(items, items.map(img => img.file), null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Drag and drop zone handlers
    const handleDropZoneDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDropZoneDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleDropZoneDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const handleSetAsPrimary = (index) => {
        const items = [...currentImages];
        const [primaryImage] = items.splice(index, 1);
        items.unshift(primaryImage);
        onImagesChange(items, items.map(img => img.file), null);
    };

    return (
        <div className="flex flex-col">
            <label className="text-[#7C7C7C] text-[14px] mb-3 font-medium">
                Perfume Images {required && <span className="text-red-500">*</span>}
                <span className="text-xs text-gray-500 ml-2">
                    ({currentImages.length}/{maxImages} images)
                </span>
            </label>

            {/* Upload Zone */}
            <div
                onDragOver={handleDropZoneDragOver}
                onDragLeave={handleDropZoneDragLeave}
                onDrop={handleDropZoneDrop}
                className={`
                    flex justify-center items-center border-2 border-dashed bg-white rounded-2xl p-8 
                    transition-all duration-300 cursor-pointer mb-4 relative overflow-hidden
                    ${dragOver 
                        ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                        : error 
                            ? 'border-red-500 hover:border-red-400 hover:bg-red-50' 
                            : 'border-[#EFEFEF] hover:border-blue-400 hover:bg-gray-50'
                    }
                    ${currentImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => currentImages.length < maxImages && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={allowedTypes.join(',')}
                    onChange={handleImagesChange}
                    className="hidden"
                    multiple
                    required={required && currentImages.length === 0}
                    disabled={currentImages.length >= maxImages}
                />

                <div className="flex flex-col justify-center items-center">
                    <div className="relative mb-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <img src={addpic_icon} alt="Upload" className="w-8 h-8" />
                        </div>
                        {dragOver && (
                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                        )}
                    </div>
                    
                    <p className="text-gray-700 font-semibold text-center mb-1">
                        {dragOver ? 'Drop images here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-gray-500 text-center text-sm">
                        Max {maxSizeInMB}MB per image • JPG, PNG, GIF, WebP
                    </p>
                    <p className="text-gray-400 text-center text-xs mt-1">
                        Up to {maxImages} images allowed
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Image Preview Grid */}
            {currentImages.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">
                            Uploaded Images
                        </p>
                        <p className="text-xs text-gray-500">
                            Drag to reorder • First image is primary
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {currentImages.map((image, index) => (
                            <div
                                key={image.id || index}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`
                                    group relative aspect-square rounded-xl overflow-hidden border-2 
                                    transition-all duration-300 cursor-move hover:shadow-lg
                                    ${draggedIndex === index 
                                        ? 'opacity-50 scale-95 border-blue-500' 
                                        : 'border-gray-200 hover:border-blue-400'
                                    }
                                    ${index === 0 ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                `}
                            >
                                {/* Primary Badge */}
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        Primary
                                    </div>
                                )}

                                {/* Image */}
                                <img
                                    src={
                                        image.url
                                            ? image.url.startsWith('blob:') || image.url.startsWith('http')
                                                ? image.url
                                                : `${import.meta.env.VITE_BASE_URL}${image.url}`
                                            : image.startsWith('blob:') || image.startsWith('http')
                                                ? image
                                                : `${import.meta.env.VITE_BASE_URL}${image}`
                                    }
                                    alt={`Perfume ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />

                                {/* Overlay with Actions */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        {/* Set as Primary Button */}
                                        {index !== 0 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSetAsPrimary(index);
                                                }}
                                                className="flex-1 bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold px-2 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                                                title="Set as primary image"
                                            >
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                Primary
                                            </button>
                                        )}

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveImage(index);
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center"
                                            title="Remove image"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Drag Handle Indicator */}
                                <div className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                </div>

                                {/* Image Number */}
                                <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }

                .animate-ping {
                    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default MultipleImageUploader;
