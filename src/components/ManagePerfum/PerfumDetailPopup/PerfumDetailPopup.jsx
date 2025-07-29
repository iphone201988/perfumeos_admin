import React from 'react'
import cross_icon from '../../../assets/icons/cross-icon.svg'
import perfum_img from '../../../assets/perfum-img.png'

const PerfumDetailPopup = () => {
  return (
  <div className='w-full h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
        <div className="bg-[#fff] p-[32px] rounded-[24px] max-w-[600px] w-full">
          <div className="flex items-center justify-between">
              <h5 className='text-[20px] text-[#352AA4] font-semibold'>Perfum Detail</h5>
              <button className=' cursor-pointer'>
                  <img src={cross_icon} alt="" />
              </button>
          </div>
          <div className="mt-[20px] flex flex-col gap-[16px]">
              <div className="flex justify-between">
                  <p className='text-[#7C7C7C]'>Perfume Pic</p>
                  <span className='w-[180px] h-[150px] p-[20px] rounded-2xl border border-[#352AA4]'>
                    <img className=' object-scale-down object-center w-full h-full' src={perfum_img} alt="" />
                  </span>
              </div>
              <div className="flex justify-between">
                  <p className='text-[#7C7C7C]'>Name</p>
                  <p className='text-[#352AA4] font-medium '>Sauvage</p>
              </div>
              <div className="flex justify-between">
                  <p className='text-[#7C7C7C]'>Brand</p>
                  <p className='text-[#352AA4] font-medium '>Dior</p>
              </div>
              <div className="flex justify-between">
                  <p className='text-[#7C7C7C]'>Category</p>
                  <p className='text-[#352AA4] font-medium '>Flora</p>
              </div>
              <div className="flex justify-between">
                  <p className='text-[#7C7C7C]'>Reviews</p>
                  <p className='text-[#352AA4] font-medium '>23</p>
              </div>
          </div>
          <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
              <button className='btn-pri'>Remove</button>
              <button className='btn-sec'>Edit</button>
          </div>
        </div>
      </div>
  )
}

export default PerfumDetailPopup
