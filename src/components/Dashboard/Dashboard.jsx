import React from 'react'
import total_user_icon from '../../assets/icons/total-user-icon.svg'
import total_perfume_icon from '../../assets/icons/total-perfume-icon.svg'

const Dashboard = () => {
  return (
    <div className='flex gap-[32px]'>
      <div className="bg-[#D4F4F4] p-[16px] rounded-[16px] max-w-[320px] w-full">
        <span className=' bg-[#352AA4] w-[68px] h-[68px] rounded-[12px] flex items-center justify-center'>
            <img src={total_user_icon} alt="" />
        </span>
        <p className='text-[24px] text-[#15C8C9] mt-[12px]'>Total Users</p>
        <p className='text-[30px] text-[#352AA4] font-semibold'>1,265s</p>
        <p className='text-[14px] text-[#352AA4] opacity-40'>20 user more than last month</p>
      </div>
      <div className="bg-[#D4F4F4] p-[16px] rounded-[16px] max-w-[320px] w-full">
        <span className=' bg-[#352AA4] w-[68px] h-[68px] rounded-[12px] flex items-center justify-center'>
            <img src={total_perfume_icon} alt="" />
        </span>
        <p className='text-[24px] text-[#15C8C9] mt-[12px]'>Total Users</p>
        <p className='text-[30px] text-[#352AA4] font-semibold'>1,265s</p>
        <p className='text-[14px] text-[#352AA4] opacity-40'>20 user more than last month</p>
      </div>
    </div>
  )
}

export default Dashboard
