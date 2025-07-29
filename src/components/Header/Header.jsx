import React from 'react'
import user_img from '../../assets/user-img.png'

const Header = ({ isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <div className='bg-[#D4F4F4] border-b border-[#352AA4] px-[32px] py-[15px] flex items-center relative'>
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-[1001] lg:hidden bg-white p-2 rounded-md shadow-md"
        >
          <div className="w-6 h-6 flex flex-col justify-around">
            <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
            <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
          </div>
        </button>
      )}

      <div className={`w-full flex items-center justify-between ${isMobile ? 'ml-[60px]' : ''}`}>
        <h4 className='text-[24px] font-semibold text-[#352AA4]'>Dashboard</h4>
        <div className="flex items-center gap-[8px]">
          <img className='w-[50px] h-[50px] rounded-full border-4 border-[#67E9E9]' src={user_img} alt="" />
          <p className='text-[#352AA4] max-sm:hidden'>James (admin)</p>
        </div>
      </div>
    </div>
  )
}

export default Header
