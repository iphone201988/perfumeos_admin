import React from 'react'
import total_user_icon from '../assets/icons/total-user-icon.svg'
import total_perfume_icon from '../assets/icons/total-perfume-icon.svg'
import StatCard from '../components/Cards/StatCard';
import { useDashboardDataQuery } from '../api';
import Loader from '../components/Loader/Loader';

const Dashboard = () => {
  const {
    data: dashboardData,
    error,
    isLoading,
  } = useDashboardDataQuery(undefined);

  if (isLoading) {
    return <Loader message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading dashboard</p>
          <p className="text-sm mt-2">{error?.data?.message || "Something went wrong"}</p>
        </div>
      </div>
    );
  }

  const { totalUsers, totalPerfumes, usersMoreThanLastMonth, perfumesAddedThisMonth } = dashboardData?.data || {};

  return (
    <div className="flex gap-[32px] my-5 max-md:flex-col max-md:justify-center max-md:items-center">
      <StatCard
        icon={total_user_icon}
        title="Total Users"
        value={totalUsers || 0}
        description={usersMoreThanLastMonth > 0 ? `${usersMoreThanLastMonth} users more than last month` : "No users more than last month"}
      />
      <StatCard
        icon={total_perfume_icon}
        title="Total Perfumes"
        value={totalPerfumes || 0}
        description={perfumesAddedThisMonth > 0 ? `${perfumesAddedThisMonth} perfumes added this month` : "No perfumes added this month"}
      />
    </div>
  );
};

export default Dashboard;
