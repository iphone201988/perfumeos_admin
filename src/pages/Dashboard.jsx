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
    console.log("dashboardData", dashboardData);
    const { totalUsers, totalPerfumes,usersMoreThanLastMonth,perfumesAddedThisMonth } = dashboardData?.data || {};
  return (
    <div className="flex gap-[32px] m-5">
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
