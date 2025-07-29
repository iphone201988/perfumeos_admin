import React from 'react'
import cross_icon from '../../../assets/icons/cross-icon.svg'
import addpic_icon from '../../../assets/icons/addpic-icon.svg'

const AddPerfumPopup = () => {
  return (
    <div className='w-full min-h-[100vh] fixed top-0 left-0 bg-[rgba(0,0,0,0.80)] z-[9999] flex items-center justify-center max-md:p-[20px]'>
            <div className="bg-[#fff] p-[32px] rounded-[24px] max-w-[600px] w-full max-md:p-[16px] max-md:overflow-scroll max-md:h-[600px]">
              <div className="flex items-center justify-between">
                  <h5 className='text-[20px] text-[#352AA4] font-semibold'>Add Perfum</h5>
                  <button className=' cursor-pointer'>
                      <img src={cross_icon} alt="" />
                  </button>
              </div>
              <div className="mt-[20px] flex flex-col gap-[16px]">
                  <div className="flex justify-center items-center border border-[#EFEFEF] rounded-2xl p-[16px] h-[210px]">
                    <div className="flex flex-col justify-center items-center">
                        <img src={addpic_icon} alt="" />
                    <p className='text-[#666666]'>Add Perfum Pic</p>
                    </div>
                  </div>
                  <div className="flex gap-[12px] max-md:flex-wrap">
                    <label className='flex flex-col w-full' htmlFor="">
                        <span className='text-[#7C7C7C] text-[14px]'>Perfum Name</span>
                        <input className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]' type="text" placeholder='Enter here' />
                    </label>
                    <label className='flex flex-col w-full' htmlFor="">
                        <span className='text-[#7C7C7C] text-[14px]'>Perfum Brand Name</span>
                        <input className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]' type="text" placeholder='Enter here' />
                    </label>
                  </div>
                  <div className="flex gap-[12px] max-md:flex-wrap">
                    <label className='flex flex-col w-full' htmlFor="">
                        <span className='text-[#7C7C7C] text-[14px]'>Perfum Category</span>
                        <input className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]' type="text" placeholder='Enter here' />
                    </label>
                    <label className='flex flex-col w-full' htmlFor="">
                        <span className='text-[#7C7C7C] text-[14px]'>Concentration</span>
                        <input className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]' type="text" placeholder='Enter here' />
                    </label>
                  </div>
                  <div className="flex gap-[12px] max-md:flex-wrap">
                    <label className='flex flex-col w-full' htmlFor="">
                        <span className='text-[#7C7C7C] text-[14px]'>Year Release</span>
                        <input className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]' type="text" placeholder='Enter here' />
                    </label>
                    <label className='flex flex-col w-full' htmlFor="">
                        <span className='text-[#7C7C7C] text-[14px]'>Number of Perfume Created</span>
                        <input className='border border-[#EEEEEE] rounded-2xl py-[14px] px-[18px]' type="text" placeholder='Enter here' />
                    </label>
                  </div>
              </div>
              <div className="flex justify-center gap-[16px] mt-[24px] flex-wrap">
                  <button className='btn-pri'>Add</button>
              </div>
            </div>
          </div>
  )
}

export default AddPerfumPopup
