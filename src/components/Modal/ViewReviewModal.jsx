import React from 'react';
import user_icon from '../../assets/icons/user-icon.svg';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const ViewReviewModal = ({ isOpen, onClose, review }) => {
    if (!isOpen || !review) return null;
    const navigate = useNavigate();
    const getImageUrl = (imagePath) => {
        if (!imagePath) return user_icon;
        if (imagePath.startsWith('http')) return imagePath;

        // Fix for "undefined" prefix in image paths
        let cleanPath = imagePath;
        if (cleanPath.startsWith('undefined/')) {
            cleanPath = cleanPath.replace('undefined/', '');
        }

        return `${import.meta.env.VITE_BASE_URL}${cleanPath}`;
    };


    return (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative">

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img
                            src={getImageUrl(review.userId?.profileImage)}
                            alt={review.userId?.firstName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                            <h2 className="text-xl font-bold text-[#352AA4]">{review.userId?.lastName ? review.userId?.firstName + ' ' + review.userId?.lastName : review.userId?.firstName || 'Anonymous'}</h2>
                            <p className="text-sm text-gray-500">{review.formattedDate}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Main Review Info */}
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                {/* <h3 className="text-2xl font-bold text-gray-800 mb-2">{review.reviewTitle}</h3> */}
                                <p className="text-[#352AA4] font-medium text-lg flex items-center gap-2">
                                    <span className="opacity-75">Review for:</span>
                                    {review.perfumeName}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-[#FFF9E6] px-4 py-2 rounded-xl border border-[#FFEBA0]">
                                    <span className="text-yellow-500 text-xl">★</span>
                                    <span className="text-xl font-bold text-gray-800">{review.rating}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                                    <span className="text-red-500 text-xl">♥</span>
                                    <span className="text-xl font-bold text-red-700">{review.reviewLikesCount || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                                {review.review || "No content provided."}
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Attributes Grid */}
                    <div>
                        <h4 className="text-lg font-bold text-[#352AA4] mb-4">Attributes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Longevity */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Longevity</label>
                                    <span className="text-sm font-bold text-[#352AA4]">{Math.round((review.longevity || 0) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    readOnly
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={review.longevity || 0}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-default accent-[#352AA4]"
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
                                    <span className="text-sm font-bold text-[#352AA4]">{Math.round((review.sillage || 0) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    readOnly
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={review.sillage || 0}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-default accent-[#352AA4]"
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
                                    <span className="text-sm font-bold text-[#352AA4]">{Math.round((review.gender || 0) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    readOnly
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={review.gender || 0}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-default accent-[#352AA4]"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Masculine</span>
                                    <span>Feminine</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Price</label>
                                    <span className="text-sm font-bold text-[#352AA4]">{Math.round((review.price || 0) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    readOnly
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={review.price || 0}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-default accent-[#352AA4]"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Budget Friendly</span>
                                    <span>Luxury</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Review Images Gallery */}
                    {review.images && review.images.length > 0 && (
                        <>
                            <hr className="border-gray-100" />
                            <div>
                                <h4 className="text-lg font-bold text-[#352AA4] mb-4">Review Images</h4>
                                <div className="flex flex-wrap gap-4">
                                    {review.images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <a
                                                href={getImageUrl(img)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <img
                                                    src={getImageUrl(img)}
                                                    alt={`Review image ${idx + 1}`}
                                                    className="w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Associations */}
                    {(review.perfumeIds?.length > 0 || review.noteIds?.length > 0) && (
                        <>
                            <hr className="border-gray-100" />
                            <div className="grid md:grid-cols-2 gap-8">
                                {review.perfumeIds?.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-bold text-[#352AA4] mb-4">Reminds me of</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {review.perfumeIds.map((perfume, idx) => (
                                                <span
                                                    onClick={() => navigate(`/perfumes/${perfume._id}`)}
                                                    key={idx} className="bg-[#E1F8F8] text-[#352AA4] px-3 py-1 rounded-full text-sm font-medium border border-[#352AA4]/10 cursor-pointer hover:bg-[#352AA4] hover:text-white">
                                                    {typeof perfume === 'object' ? perfume.name : 'Unknown Perfume'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {review.noteIds?.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-bold text-[#352AA4] mb-4">Smells like</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {review.noteIds.map((note, idx) => (
                                                <span
                                                    key={idx} className="bg-[#FFF4E5] text-[#B45309] px-3 py-1 rounded-full text-sm font-medium border border-[#B45309]/10">
                                                    {typeof note === 'object' ? note.name : 'Unknown Note'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full bg-white border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewReviewModal;
