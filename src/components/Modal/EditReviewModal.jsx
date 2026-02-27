import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Select from 'react-select';
import { useUpdateReviewMutation } from "../../api";
import Loader from "../Loader/Loader";
import FormField from "../Form/FormField";

const EditReviewModal = ({ isOpen, onClose, reviewData }) => {
    const [updateReview, { isLoading: updateLoading }] = useUpdateReviewMutation();

    const [form, setForm] = useState({
        title: "",
        review: "",
        rating: 0,
        longevity: "",
        sillage: "",
        gender: "",
        price: "",
        images: [],
    });




    useEffect(() => {
        if (reviewData) {
            setForm({
                title: reviewData.title || "",
                review: reviewData.review || "",
                rating: reviewData.rating || 0,
                longevity: reviewData.longevity || "",
                sillage: reviewData.sillage || "",
                gender: reviewData.gender || "",
                price: reviewData.price || "",
                perfumeIds: reviewData.perfumeIds?.map(id => {
                    if (typeof id === 'object' && id._id) return id._id;
                    return id;
                }) || [],
                noteIds: reviewData.noteIds?.map(id => {
                    if (typeof id === 'object' && id._id) return id._id;
                    return id;
                }) || [],
                images: reviewData.images || [],
            });
        }
    }, [reviewData]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "";
        if (imagePath.startsWith('http')) return imagePath;

        // Fix for "undefined" prefix in image paths
        let cleanPath = imagePath;
        if (cleanPath.startsWith('undefined/')) {
            cleanPath = cleanPath.replace('undefined/', '');
        }

        return `${import.meta.env.VITE_BASE_URL}${cleanPath}`;
    };

    const handleDeleteImage = (index) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateReview({ id: reviewData._id, ...form }).unwrap();
            toast.success("Review updated successfully");
            onClose(); // Close modal on success
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update review");
        }
    };

    // Helper to get selected options for React Select
    const getSelectedOption = (options, value) => options.find(opt => opt.value === value);
    const getSelectedOptions = (options, values) => options.filter(opt => values.includes(opt.value));

    const customStyles = {
        control: (provided) => ({ ...provided, borderRadius: '12px', padding: '2px', borderColor: '#E5E7EB' }),
        multiValue: (provided) => ({ ...provided, backgroundColor: '#E1F8F8', borderRadius: '4px' }),
        menu: (provided) => ({ ...provided, zIndex: 9999 }), // Ensure menu is above modal
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[9990] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#352AA4]">Edit Review</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    {(!reviewData) ? (
                        <div className="py-20 flex justify-center">
                            <Loader message="Loading review details..." />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Review Content Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800">Content</h3>
                                <div className="flex gap-4 w-[100px]">
                                    {/* <FormField
                                        label="Title"
                                        name="title"
                                        value={form.title}
                                        onChange={handleInputChange}
                                        placeholder="Review Title"
                                        className="flex-1"
                                    /> */}

                                    <FormField
                                        label="Rating (0-5)"
                                        name="rating"
                                        type="number"
                                        value={form.rating}
                                        onChange={handleInputChange}
                                        placeholder="0-5"
                                        min="0"
                                        max="5"
                                        step="1"
                                        className="flex-1"
                                    />
                                </div>
                                <FormField
                                    label="Review"
                                    name="review"
                                    value={form.review}
                                    onChange={handleInputChange}
                                    placeholder="Review Text"
                                    textArea
                                    rows={5}
                                />
                            </div>

                            <hr className="border-gray-100" />

                            {/* Attributes Section */}
                            <div>
                                <h3 className="text-lg font-bold text-[#352AA4] mb-4">Attributes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Longevity */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-semibold text-gray-700">Longevity</label>
                                            <span className="text-sm font-bold text-[#352AA4]">{Math.round((form.longevity || 0) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            name="longevity"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={form.longevity || 0}
                                            onChange={handleInputChange}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#352AA4]"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Fades Fast</span>
                                            <span>Lasts Long</span>
                                        </div>
                                    </div>

                                    {/* Sillage */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-semibold text-gray-700">Sillage</label>
                                            <span className="text-sm font-bold text-[#352AA4]">{Math.round((form.sillage || 0) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            name="sillage"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={form.sillage || 0}
                                            onChange={handleInputChange}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#352AA4]"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Barely Noticeable</span>
                                            <span>Room Filler</span>
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-semibold text-gray-700">Gender</label>
                                            <span className="text-sm font-bold text-[#352AA4]">{Math.round((form.gender || 0) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            name="gender"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={form.gender || 0}
                                            onChange={handleInputChange}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#352AA4]"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Masculine</span>
                                            <span>Feminine</span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-semibold text-gray-700">Value</label>
                                            <span className="text-sm font-bold text-[#352AA4]">{Math.round((form.price || 0) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            name="price"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={form.price || 0}
                                            onChange={handleInputChange}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#352AA4]"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Budget Friendly</span>
                                            <span>Luxury</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Images Section */}
                            <div>
                                <h3 className="text-lg font-bold text-[#352AA4] mb-4">Images</h3>
                                {form.images && form.images.length > 0 ? (
                                    <div className="flex flex-wrap gap-4">
                                        {form.images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={getImageUrl(img)}
                                                    alt={`Review preview ${idx + 1}`}
                                                    className="w-24 h-24 object-cover rounded-xl border border-gray-100 shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteImage(idx)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    title="Delete Image"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No images attached to this review.</p>
                                )}
                            </div>

                            <hr className="border-gray-100" />


                            {/* Footer Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="px-6 py-2.5 rounded-full bg-[#352AA4] text-white font-medium hover:bg-[#2a2183] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {updateLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditReviewModal;
