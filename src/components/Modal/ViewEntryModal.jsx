import React, { useState } from 'react';
import moment from 'moment';
import user_icon from '../../assets/icons/user-icon.svg';

const MOOD_MAPPING = {
    1: "Floral 🌸",
    2: "Fresh/Citrus 🍋",
    3: "Woody 🌳",
    4: "Sweet/Gourmand 🍬",
    5: "Amber/Oriental 🔥",
    6: "Aromatic/Herbal 🌿"
};

const OCCASION_MAPPING = {
    1: "Work 💼",
    2: "Everyday Wear 👕",
    3: "Date ❤️",
    4: "Gym 🏋️",
    5: "Special Events 🌟",
    6: "Just for me 🧑"
};

const ViewEntryModal = ({ isOpen, onClose, entry }) => {
    const [imageError, setImageError] = useState(false);

    // Reset image error state when modal opens/closes or entry changes
    React.useEffect(() => {
        setImageError(false);
    }, [isOpen, entry]);

    if (!isOpen || !entry) return null;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        return imagePath.startsWith('http')
            ? imagePath
            : `${import.meta.env.VITE_BASE_URL}${imagePath}`;
    };

    const entryImage = getImageUrl(entry.image);

    return (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-[#352AA4]">Entry Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* User and Date */}
                    <div className="flex items-center gap-4 mb-8">
                        <img
                            src={entry.authorImage || user_icon}
                            alt="Author"
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#352AA4]/20 bg-gray-50"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = user_icon;
                            }}
                        />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {entry.userId?.firstName} {entry.userId?.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                {entry.createdAt ? moment(entry.createdAt).format('MMMM Do YYYY, h:mm a') : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Perfume Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium mb-1">Perfume</p>
                        <p className="text-lg font-bold text-gray-800">{entry.perfumeName}</p>
                        {entry.perfumeId?.brand?.name && (
                            <p className="text-sm text-[#352AA4] font-medium mt-1">Brand: {entry.perfumeId.brand.name}</p>
                        )}
                    </div>

                    {/* Mood and Occasion */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-[#FFF9E6] rounded-2xl border border-[#FDE68A]">
                            <p className="text-xs text-[#B45309]/70 font-bold uppercase tracking-widest mb-1">Mood</p>
                            <p className="text-lg font-extrabold text-[#B45309]">
                                {entry.mood ? (MOOD_MAPPING[entry.mood] || entry.mood) : 'N/A'}
                            </p>
                        </div>
                        <div className="p-4 bg-[#E1F8F8] rounded-2xl border border-[#A5F3FC]">
                            <p className="text-xs text-[#0891B2]/70 font-bold uppercase tracking-widest mb-1">Occasion</p>
                            <p className="text-lg font-extrabold text-[#0891B2]">
                                {entry.occasion ? (OCCASION_MAPPING[entry.occasion] || entry.occasion) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Thoughts */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Thoughts</h4>
                        {entry.thoughts ? (
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {entry.thoughts}
                            </p>
                        ) : (
                            <p className="text-gray-400 italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                                No thoughts provided for this entry.
                            </p>
                        )}
                    </div>

                    {/* Image */}
                    {entryImage && !imageError && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Attached Image</h4>
                            <div className="rounded-2xl overflow-hidden border border-gray-200">
                                <img
                                    src={entryImage}
                                    alt="Entry attachment"
                                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                                    onError={() => setImageError(true)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewEntryModal;
