import React from 'react';
import user_icon from '../../assets/user-img.png';

const ViewScanReportModal = ({ 
    isOpen, 
    onClose, 
    reportData, 
    onMarkRead, 
    onImageClick 
}) => {
    if (!isOpen || !reportData) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[24px] shadow-2xl max-w-3xl w-full max-h-[70vh] overflow-hidden flex flex-col animate-fade-in">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#352AA4] to-[#5c4ec9] p-6 shrink-0 relative">
                    <div className="flex items-center gap-4">
                        <img
                            src={reportData.image}
                            alt={reportData.userName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white/30 bg-white"
                            onError={(e) => { e.target.src = user_icon; }}
                        />
                        <div className="flex-1 min-w-0 pr-10">
                            <h3 className="text-white text-lg font-bold break-words">{reportData.userName}</h3>
                            <p className="text-white/80 text-sm break-words">{reportData.userEmail}</p>
                            <p className="text-white/60 text-xs mt-1">{reportData.formattedDate}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full hover:bg-white/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6">
                        {/* Perfume Details */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-2">Reported Perfume</h4>
                            <div className="flex items-center gap-4">
                                {reportData.perfumeImageFull ? (
                                    <div className="relative shrink-0 w-24 h-24">
                                        <div className="absolute inset-0 rounded-xl bg-gray-100 flex items-center justify-center border shadow-sm -z-10">
                                            <span className="text-gray-400 text-xs text-center px-2">No Image</span>
                                        </div>
                                        <img 
                                            src={reportData.perfumeImageFull} 
                                            alt={reportData.perfumeName}
                                            className="w-24 h-24 rounded-xl object-cover border shadow-sm cursor-pointer hover:opacity-80 transition-opacity absolute inset-0 bg-white"
                                            onClick={() => onImageClick(reportData.perfumeImageFull)}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center border shadow-sm shrink-0">
                                        <span className="text-gray-400 text-xs">No Image</span>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-gray-900 font-semibold text-lg break-words whitespace-pre-wrap">{reportData.perfumeName || 'N/A'}</h5>
                                    {reportData.perfumeBrand && (<div className='flex items-center gap-1 mt-1'>
                                        <span className="text-gray-500 text-sm">Brand:</span>
                                        <p className="text-[#352AA4] font-medium text-sm mt-1 break-words whitespace-pre-wrap">{reportData.perfumeBrand}</p>
                                    </div>)}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-2">Description / Notes</h4>
                            <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm whitespace-pre-wrap border border-gray-100 break-words">
                                {reportData.description ? reportData.description : <span className="text-gray-400 italic">No description provided.</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-100 p-4 shrink-0 flex justify-end gap-3 bg-gray-50">
                    {!reportData.isRead && (
                        <button
                            onClick={() => {
                                onMarkRead(reportData._id);
                                onClose();
                            }}
                            className="px-5 py-2.5 bg-[#352AA4] text-white rounded-xl hover:bg-[#2a2183] transition-colors font-medium text-sm shadow-sm"
                        >
                            Mark as Read
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewScanReportModal;
