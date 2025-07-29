import React from 'react'
import logo from '../../assets/logo.png'
import dashboard_icon from '../../assets/icons/dashboard-icon.svg'
import user_icon from '../../assets/icons/user-icon.svg'
import perfume_icon from '../../assets/icons/perfume-icon.svg'
import quiz_icon from '../../assets/icons/quiz-icon.svg'
import setting_icon from '../../assets/icons/setting-icon.svg'
import logout_icon from '../../assets/icons/logout-icon.svg'

const SideBar = () => {
  return (
     <div className=" h-[100vh] max-lg:hidden">
      <div className="flex flex-col border-r border-[#352AA4] fixed left-0 top-0 bg-[#D4F4F4] z-[999] h-full w-[320px] min-w-[320px] max-w-[320px]">
        <a
          className="mb-[52px] mt-[50px] mx-auto "
          href=""
        >
          <img className='max-w-[162px]' src={logo} alt="" />
        </a>
        <div className=" side-bar flex flex-col w-full">
          <a className="sidebar-link active" href="">
            <img
              className="active-icon"
              src={dashboard_icon}
              alt=""
            />
            <img className="not-active" src="src/assets/icon-1.png" alt="" />
            Dashboard
          </a>
          <a className="sidebar-link " href="">
            <img
              className="active-icon"
              src={user_icon}
              alt=""
            />
            <img className="not-active" src="src/assets/icon-2.png" alt="" />
            Manage Users
          </a>
          <a className="sidebar-link " href="">
            <img
              className="active-icon"
              src={perfume_icon}
              alt=""
            />
            <img className="not-active" src="src/assets/icon-3.png" alt="" />
           Manage Perfum
          </a>
          <a className="sidebar-link " href="">
            <img
              className="active-icon"
              src={quiz_icon}
              alt=""
            />
            <img className="not-active" src="src/assets/icon-4.png" alt="" />
            Manage Quiz
          </a>
        
        </div>

        {/* profile pic */}
        <div className="flex flex-col items-start justify-between mt-auto">
          
          <a className="sidebar-link text-[#7C7C7C] w-full" href="">
            <img className="" src={setting_icon} alt="" />
            Settings
          </a>
          <a className="sidebar-link !text-[#FF4040] bg-[rgba(255,64,64,0.10)] w-full" href="">
            <img className="" src={logout_icon} alt="" />
            Logout
          </a>
        </div>
      </div>
    </div>
  )
}

export default SideBar
