import React from 'react'
import total_user_icon from '../assets/icons/total-user-icon.svg'
import total_perfume_icon from '../assets/icons/total-perfume-icon.svg'
import StatCard from '../components/Cards/StatCard';
import { useDashboardDataQuery } from '../api';

const Dashboard = () => {
  const {
      data: dashboardData,
      error,
      isLoading,
    } = useDashboardDataQuery(undefined);
    const { totalUsers, totalPerfumes,usersMoreThanLastMonth,perfumesAddedThisMonth } = dashboardData?.data || {};
  return (
    <div className="flex gap-[32px] my-5 max-md:flex-col max-md:justify-center max-md:items-center">
      <StatCard
        icon={total_user_icon}
        title="Total Users"
        value={totalUsers}
        description= {usersMoreThanLastMonth>0 ? `${usersMoreThanLastMonth} users more than last month` : "No users more than last month"}
      />
      <StatCard
        icon={total_perfume_icon}
        title="Total Perfumes"
        value={totalPerfumes}
        description={perfumesAddedThisMonth>0 ? `${perfumesAddedThisMonth} perfumes added this month` : "No perfumes added this month"}
      />
    </div>
  );
};

export default Dashboard;
