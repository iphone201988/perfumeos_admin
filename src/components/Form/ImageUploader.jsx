import React from "react";
import addpic_icon from "../../assets/icons/addpic-icon.svg";

const ImageUploader = ({ onImageSelect, currentImage = null }) => {
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            onImageSelect(imageUrl, file); // Pass both the preview and file if needed
        }
    };
    console.log("currentImage", currentImage)
    return (
        <label
            htmlFor="image-upload"
            className="flex justify-center items-center border bg-white border-[#EFEFEF] rounded-2xl p-[16px] h-[170px] w-[170px] hover:border-blue-300 transition-colors cursor-pointer"
        >
            <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
            />
            <div className="flex flex-col justify-center items-center w-full h-full">
                {currentImage ? (
                    <img
                        src={currentImage}
                        alt="Perfume"
                        className="w-full h-full object-cover rounded"
                    />
                ) : (
                    <>
                        <img src={addpic_icon} alt="Add Perfume Pic" />
                        <p className="text-[#666666] text-center text-sm">Add Perfume Pic</p>
                    </>
                )}
            </div>
        </label>
    );
};

export default ImageUploader;
