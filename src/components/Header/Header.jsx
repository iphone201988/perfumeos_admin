import React from 'react'
import user_img from '../../assets/user-img.png'

const Header = () => {
  return (
    <div className='bg-[#D4F4F4] border-b border-[#352AA4] px-[32px] py-[15px] flex items-center justify-between'>
      <h4 className='text-[24px] font-semibold text-[#352AA4]'>Dashboard</h4>
      <div className="flex items-center gap-[8px]">
        <img className='w-[50px] h-[50px] rounded-full border-4 border-[#67E9E9]' src={user_img} alt="" />
        <p className='text-[#352AA4]'>James (admin)</p>
      </div>
    </div>
  )
}

export default Header
