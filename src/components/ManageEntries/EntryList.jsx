import React from 'react';
import { format } from 'date-fns';

const EntryList = ({ entries, onDelete, isLoading, isFetching, hasMore, onLoadMore, total }) => {
    console.log("entries", entries);
    if (isLoading) return null; // Let the parent handle the initial loading state

    if (!entries?.length) {
        return (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Entries Found</h3>
                <p className="text-gray-500">There are currently no perfume entries to display.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800">
                    All Entries <span className="text-sm font-normal text-gray-500 ml-2">({total} total)</span>
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-600 text-sm">
                            <th className="p-4 font-semibold border-b">Image</th>
                            <th className="p-4 font-semibold border-b">Perfume</th>
                            <th className="p-4 font-semibold border-b">User</th>
                            <th className="p-4 font-semibold border-b">Thoughts</th>
                            <th className="p-4 font-semibold border-b">Mood / Occasion</th>
                            <th className="p-4 font-semibold border-b">Date</th>
                            <th className="p-4 font-semibold border-b text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {entries.map((entry) => (
                            <tr key={entry._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 align-top">
                                    {entry.image ? (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={entry.image.startsWith('http') ? entry.image : `${import.meta.env.VITE_BASE_URL}/${entry.image}`}
                                                alt="Entry"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                            <span className="text-gray-400 text-xs text-center">No<br />Image</span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 align-top">
                                    <div className="font-medium text-gray-800">
                                        {entry.perfumeId?.title || 'Unknown Perfume'}
                                    </div>
                                    {entry.perfumeId?.brand?.name && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {entry.perfumeId.brand.name}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 align-top">
                                    <div className="font-medium text-gray-800">
                                        {entry.userId?.firstName} {entry.userId?.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {entry.userId?.email || 'No email'}
                                    </div>
                                </td>
                                <td className="p-4 align-top max-w-xs">
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {entry.thoughts || <span className="italic text-gray-400">No thoughts provided</span>}
                                    </p>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex flex-col gap-1">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 w-fit">
                                            Mood: {entry.mood !== undefined && entry.mood !== null ? entry.mood : 'N/A'}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 w-fit">
                                            Occasion: {entry.occasion !== undefined && entry.occasion !== null ? entry.occasion : 'N/A'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="text-sm text-gray-600">
                                        {entry.createdAt ? format(new Date(entry.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {entry.createdAt ? format(new Date(entry.createdAt), 'hh:mm a') : ''}
                                    </div>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <button
                                        onClick={() => onDelete(entry)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Entry"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div className="p-6 border-t border-gray-100 flex justify-center bg-gray-50/30">
                    <button
                        onClick={onLoadMore}
                        disabled={isFetching}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 hover:text-[#352AA4] hover:border-[#352AA4] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                    >
                        {isFetching ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </>
                        ) : (
                            'Load More Entries'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default EntryList;
