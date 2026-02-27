import React, { useState } from "react";
import StatCard from "../components/Cards/StatCard";
import TrendChart from "../components/Charts/TrendChart";
import { Dropdown } from "primereact/dropdown";
import { useDashboardDataQuery } from "../api";
import TopUserList from "../components/List/TopUserList";
import Loader from "../components/Loader/Loader";

import total_user_icon from "../assets/icons/total-user-icon.svg";
import total_perfume_icon from "../assets/icons/total-perfume-icon.svg";
import search_icon from "../assets/icons/search-icon.svg";
import feedback_icon from "../assets/icons/feedback-icon.svg";
import note_icon from "../assets/icons/note-icon.svg";
import perfumer_icon from "../assets/icons/perfumer-icon.svg";
import badge_icon from "../assets/icons/badge-icon.svg";

const Dashboard = () => {
  const [filter, setFilter] = useState("week");

  const filterOptions = [
    // { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
  ];

  const { data, error, isLoading } = useDashboardDataQuery({ period: filter });

  if (isLoading) return <Loader message="Loading dashboard..." />;
  if (error) return <div>Error loading dashboard</div>;

  const {
    totalUsers,
    totalPerfumes,
    totalScans,
    totalChats,
    totalTokens,

    scanTrend = [],
    tokenTrend = [],
    totalNotes,
    totalPerfumers,
    chatTrend = [],
    scanTokenTrend = []
  } = data?.data || {};

  return (
    <div className="flex flex-col gap-8">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard icon={total_user_icon} title="Total Users" value={totalUsers} />
        <StatCard icon={total_perfume_icon} title="Total Perfumes" value={totalPerfumes} />
        <StatCard icon={note_icon} title="Total Notes" value={totalNotes} />
        <StatCard icon={perfumer_icon} title="Total Perfumers" value={totalPerfumers} />
        <StatCard icon={search_icon} title="Total Scans" value={totalScans} />
        <StatCard icon={feedback_icon} title="Total Chats" value={totalChats} />
        <StatCard icon={badge_icon} title="Total Tokens" value={totalTokens} />
      </div>


      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
        <Dropdown
          value={filter}
          onChange={(e) => setFilter(e.value)}
          options={filterOptions}
          className="w-40 md:w-48 bg-white border border-slate-100 shadow-sm rounded-xl focus:shadow-md transition-all outline-none"
          pt={{
            root: { className: 'flex items-center justify-between px-4 py-2 hover:border-blue-500 transition-colors cursor-pointer bg-white rounded-xl border border-slate-200 shadow-sm' },
            input: { className: 'text-sm font-medium text-gray-700 bg-transparent border-none outline-none' },
            trigger: { className: 'w-4 h-4 text-gray-400 ml-2' },
            panel: { className: 'bg-white shadow-xl rounded-xl border border-slate-100 mt-2 overflow-hidden z-50' },
            item: { className: 'px-4 py-2.5 hover:bg-[#F0F4FF] text-sm text-gray-700 cursor-pointer transition-colors border-b border-gray-50 last:border-none' },
            list: { className: 'p-0 list-none m-0' }
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Scan Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col h-[400px] shadow-sm hover:shadow-lg transition-all duration-300">

          <h3 className="text-lg font-bold text-gray-700 mb-4">Scan Analytics</h3>
          <div className="flex-1 min-h-0">
            <TrendChart data={scanTrend} label="Scans" color="#8B5CF6" type="line" />
          </div>
        </div>

        {/* Token Usage In Scan Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col h-[400px] shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Token Usage In Scan</h3>
          <div className="flex-1 min-h-0">
            <TrendChart data={scanTokenTrend} label="Scan Tokens" color="#F59E0B" type="line" />
          </div>
        </div>

        {/* Chat Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col h-[400px] shadow-sm hover:shadow-lg transition-all duration-300">

          <h3 className="text-lg font-bold text-gray-700 mb-4">Chat Analytics</h3>
          <div className="flex-1 min-h-0">
            <TrendChart data={chatTrend} label="Chats" color="#10B981" type="line" />
          </div>
        </div>

        {/* Token Usage In Whizzy Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col h-[400px] shadow-sm hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Token Usage In Whizzy</h3>
          <div className="flex-1 min-h-0">
            <TrendChart data={tokenTrend} label="Whizzy Tokens" color="#EC4899" type="line" />
          </div>
        </div>

      </div>
      {/* Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <TopUserList title="Top Scanners" users={data?.data?.topScanners || []} type="scan" />
        <TopUserList title="Top Token Users" users={data?.data?.topTokenUsers || []} type="token" />
      </div>


    </div>
  );
};

export default Dashboard;
