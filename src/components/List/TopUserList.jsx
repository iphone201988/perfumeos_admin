import React from "react";
import { Avatar } from "primereact/avatar";

const TopUserList = ({ title, users = [], type }) => {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
            <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {users.length > 0 ? (
                    users.map((user, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-[#F0F4FF] transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${index < 3
                                            ? "bg-[#352AA4] text-white"
                                            : "bg-gray-200 text-gray-600"
                                        }`}
                                >
                                    {index + 1}
                                </span>
                                <Avatar
                                    image={user.avatar || "https://ui-avatars.com/api/?name=" + (user.name || "User")}
                                    shape="circle"
                                    className="w-10 h-10 border-2 border-white shadow-sm"
                                />
                                <div>
                                    <p className="text-sm font-bold text-gray-800 group-hover:text-[#352AA4] transition-colors">
                                        {user.name || "Unknown User"}
                                    </p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-bold text-[#352AA4]">
                                    {type === "scan" ? user.scanCount : user.tokenCount}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                    {type === "scan" ? "Scans" : "Tokens"}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <p>No data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopUserList;
