import React, { useRef } from "react";
import addpic_icon from "../../assets/icons/addpic-icon.svg";

const ImageUploader = ({ 
    onImageSelect, 
    currentImage = null, 
    error = null, 
    required = false,
    maxSizeInMB = 5,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}) => {
    const inputRef = useRef(null);
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                onImageSelect(null, null, 'Please select a valid image file (JPG, PNG, GIF, WebP)');
                return;
            }
            
            // Validate file size
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
            if (file.size > maxSizeInBytes) {
                onImageSelect(null, null, `Image size must be less than ${maxSizeInMB}MB`);
                return;
            }
            
            const imageUrl = URL.createObjectURL(file);
            onImageSelect(imageUrl, file, null);
        }
    };

    const handleRemoveImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onImageSelect(null, null, null);
    };

    return (
        <div className="flex flex-col">
            <label className="text-[#7C7C7C] text-[14px] mb-1">
                Perfume Image {required && <span className="text-red-500">*</span>}
            </label>
            <label
                htmlFor="image-upload"
                className={`
                    flex justify-center items-center border bg-white rounded-2xl p-[16px] 
                    h-[170px] w-[170px] transition-colors cursor-pointer relative
                    ${error 
                        ? 'border-red-500 hover:border-red-400' 
                        : 'border-[#EFEFEF] hover:border-blue-300'
                    }
                `}
            >
                <input
                    ref={inputRef}
                    id="image-upload"
                    type="file"
                    accept={allowedTypes.join(',')}
                    onChange={handleImageChange}
                    className="opacity-0 absolute pointer-events-none" // Make invisible but focusable
                    required={required}
                />
                <div className="flex flex-col justify-center items-center w-full h-full">
                    {currentImage ? (
                        <>
                            <img
                                src={currentImage
                                    ? currentImage.includes("/uploads")
                                        ? `${import.meta.env.VITE_BASE_URL}${currentImage}`
                                        : currentImage
                                    : addpic_icon}
                                alt="Perfume"
                                className="w-full h-full object-cover rounded"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                title="Remove image"
                            >
                                ✕
                            </button>
                        </>
                    ) : (
                        <>
                            <img src={addpic_icon} alt="Add Perfume Pic" className="mb-2" />
                            <p className="text-[#666666] text-center text-sm">
                                Add Perfume Pic
                            </p>
                            <p className="text-[#999999] text-center text-xs mt-1">
                                Max {maxSizeInMB}MB • JPG, PNG, GIF, WebP
                            </p>
                        </>
                    )}
                </div>
            </label>
            
            {error && (
                <span className="text-red-500 text-xs mt-1">{error}</span>
            )}
            
            {!error && !currentImage && (
                <p className="text-gray-500 text-xs mt-1">
                    Click to upload an image or drag and drop
                </p>
            )}
        </div>
    );
};

export default ImageUploader;
