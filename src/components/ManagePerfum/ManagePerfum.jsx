import React from 'react'
import search_icon from '../../assets/icons/search-icon.svg'
import view_icon from '../../assets/icons/view-icon.svg'

const ManagePerfum = () => {
  return (
    <>
    <div className='bg-[#E1F8F8] rounded-[30px] py-[24px] px-[32px] max-lg:p-[16px]'>
          <div className="flex justify-between items-center flex-wrap max-md:gap-[12px]">
            <h6 className='text-[20px] font-semibold text-[#352AA4]'>All Perfum</h6>
            <div className="flex gap-[16px] flex-wrap">
                <div className="flex bg-[#352AA4] px-[10px] py-[8px] rounded-[20px] gap-[8px] items-center">
                    <img src={search_icon} alt="" />
                    <input className=' placeholder:!text-white' type="text" placeholder='Search' />
                </div>
               <div className="flex text-white bg-[#352AA4] px-[10px] py-[8px] rounded-[20px] gap-[8px] items-center">
                <span className=' font-light'>Short by : </span>
                 <select className=' font-semibold bg-[#352AA4]' name="" id="">
                    <option value="">Newest</option>
                    <option value="">2</option>
                </select>
               </div>
            </div>
          </div>
          {/* table */}
          <div className="overflow-x-auto mt-[24px]">
      <table className="min-w-full">
        <thead className=" text-[#352AA4] text-[14px] font-medium">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Brand</th>
            <th className="px-4 py-3 text-left">JCategory</th>
            <th className="px-4 py-3 text-left">Reviews</th>
            <th className="px-4 py-3 text-right ml-auto">Actions</th>
          </tr>
        </thead>
        <tbody className="text-[#7C7C7C] text-[14px] font-medium ">
          <tr className="border-t border-[rgba(21,201,201,0.50)]">
            <td className="px-4 py-6 max-lg:p-[12px]">1</td>
            <td className="px-4 py-6 max-lg:p-[12px]">Sauvage</td>
            <td className="px-4 py-6 max-lg:p-[12px]">Dior</td>
            <td className="px-4 py-6 max-lg:p-[12px]">Floral</td>
            <td className="px-4 py-6 max-lg:p-[12px]">23</td>
            <td className="px-4 py-6 max-lg:p-[12px] text-right">
              <button className='ml-auto cursor-pointer'><img src={view_icon} alt="" /></button>
            </td>
          </tr>
          <tr className="border-t border-[rgba(21,201,201,0.50)]">
             <td className="px-4 py-6 max-lg:p-[12px]">2</td>
            <td className="px-4 py-6 max-lg:p-[12px]">Sauvage</td>
            <td className="px-4 py-6 max-lg:p-[12px]">Dior</td>
            <td className="px-4 py-6 max-lg:p-[12px]">Floral</td>
            <td className="px-4 py-6 max-lg:p-[12px]">23</td>
            <td className="px-4 py-6 max-lg:p-[12px] text-right">
              <button className='ml-auto cursor-pointer'><img src={view_icon} alt="" /></button>
            </td>
     </tr>
        
          
        </tbody>
      </table>
    </div>
    
    <div className="flex items-center justify-between mt-4">
    
      <nav className="inline-flex gap-1">
     
        <button className="px-3 py-1 bg-[#fff] rounded-[4px] text-[#352AA4] ">
          Previous
        </button>
        
    
        <button className="active px-3 py-1 bg-[#352AA4] rounded-[4px] text-sm text-[#fff] cursor-pointer ">1</button>
        <button className="px-3 py-1 bg-white rounded-[4px] text-sm text-[#352AA4] cursor-pointer ">2</button>
        <button className="px-3 py-1 bg-white rounded-[4px] text-sm text-[#352AA4] cursor-pointer ">3</button>
        <span className="px-3 py-1 text-sm text-gray-500">...</span>
        <button className="px-3 py-1 bg-white rounded-[4px] text-sm text-[#352AA4] cursor-pointer ">10</button>
    
    
        <button className="px-3 py-1 bg-white rounded-[4px] text-sm text-[#352AA4] cursor-pointer rounded-r-md ">
          Next
        </button>
      </nav>
    </div>
        </div>
        <div className="mt-[24px] flex">
            <button className='btn-pri ml-auto'>Add Perfum</button>
        </div>
        </>
  )
}

export default ManagePerfum
