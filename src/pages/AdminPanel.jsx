import React from 'react'
import SideBar from '../components/SideBar/SideBar'
import Header from '../components/Header/Header'
import Dashboard from './Dashboard'
import ManageUsers from './ManageUsers'
import ManageUserPopup from '../components/ManageUsers/ManageUserPopup'
import ManagePerfum from './ManagePerfum'
import PerfumDetailPopup from '../components/ManagePerfum/PerfumDetailPopup/PerfumDetailPopup'
import AddPerfumPopup from '../components/ManagePerfum/AddPerfumPopup/AddPerfumPopup'

const AdminPanel = () => {
  return (
     <div>
      <SideBar/>

   <main className='ml-[320px] absolute w-[calc(100%-320px)] min-h-[100vh] top-[0]  bg-[#ffff] max-lg:w-full max-lg:ml-0'>
    <Header/>

    <div className="p-[32px]">
        {/* <Dashboard/> */}
        <ManageUsers/>
        {/* <ManagePerfum/> */}
    </div>

  </main>

{/* popups */}
{/* <ManageUserPopup/> */}
{/* <PerfumDetailPopup/> */}
{/* <AddPerfumPopup/> */}
    </div>
  )
}

export default AdminPanel
