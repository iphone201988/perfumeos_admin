import React from 'react'
import cross_icon from '../../assets/icons/cross-icon.svg'

const ManageUserPopup = () => {
  return (
    <div className='w-full h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
      <div className="bg-[#fff] p-[32px] rounded-[24px] max-w-[600px] w-full">
        <div className="flex items-center justify-between">
            <h5 className='text-[20px] text-[#352AA4] font-semibold'>User Profile</h5>
            <button className=' cursor-pointer'>
                <img src={cross_icon} alt="" />
            </button>
        </div>
        <div className="mt-[20px] flex flex-col gap-[16px]">
            <div className="flex justify-between">
                <p className='text-[#7C7C7C]'>Name</p>
                <p className='text-[#352AA4] font-medium '>Jane Cooper</p>
            </div>
            <div className="flex justify-between">
                <p className='text-[#7C7C7C]'>Email</p>
                <p className='text-[#352AA4] font-medium '>jane@microsoft.com</p>
            </div>
            <div className="flex justify-between">
                <p className='text-[#7C7C7C]'>Status</p>
                <p className='text-[#352AA4] font-medium '>Suspended</p>
            </div>
            <div className="flex justify-between">
                <p className='text-[#7C7C7C]'>Joined</p>
                <p className='text-[#352AA4] font-medium '>08 Feb 2025</p>
            </div>
        </div>
        <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
            <button className='btn-pri'>Suspend / Reactivate</button>
            <button className='btn-sec'>Delete User</button>
        </div>
      </div>
    </div>
  )
}

export default ManageUserPopup
