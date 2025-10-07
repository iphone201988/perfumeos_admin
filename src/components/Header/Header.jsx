import React, { useMemo, useCallback } from 'react';
import user_img from '../../assets/user-img.png';
import { useAdminDetailsQuery } from '../../api';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigator = useNavigate();
  
  const {
    data,
    error,
    isLoading
  } = useAdminDetailsQuery(undefined, {
    skip: !token,
  });

  // ✅ Updated dynamic page title matching your router
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    
    // Define route to title mapping (matching your actual routes)
    const routeTitles = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/users': 'Manage Users',
      '/perfumes': 'Manage Perfumes',
      '/perfumes/add': 'Add Perfume',
      '/quiz': 'Manage Quiz',
      '/articles': 'Manage Articles',

    };

    // Check for exact match first
    if (routeTitles[path]) {
      return routeTitles[path];
    }

    // ✅ Check for dynamic routes (matching your router structure)
    if (path.match(/^\/users\/[^/]+$/)) {
      return 'User Details';
    }
    if (path.match(/^\/perfumes\/[^/]+$/) && !path.includes('/edit') && !path.includes('/add')) {
      return 'Perfume Details';
    }
    if (path.match(/^\/perfumes\/[^/]+\/edit$/)) {
      return 'Edit Perfume';
    }

    // Check for nested routes (fallback)
    if (path.startsWith('/users')) return 'Manage Users';
    if (path.startsWith('/users')) return 'User Details';
    if (path.startsWith('/perfumes')) return 'Manage Perfumes';
    if (path.startsWith('/quiz')) return 'Manage Quiz';
    if (path.startsWith('/articles')) return 'Manage Articles';
    if (path.startsWith('/settings')) return 'Admin Settings';
    if (path.startsWith('/notes')) return 'Manage Notes';
    if (path.startsWith('/perfumers')) return 'Manage Perfumers';
    if (path.startsWith('/badge')) return 'Manage Badges';
    if (path.startsWith('/rank')) return 'Manage Ranks';

    // Default fallback
    return 'Dashboard';
  }, [location.pathname]);

  // ✅ Handle profile click navigation
  const handleProfileClick = useCallback(() => {
    navigator('#');
  }, [navigator]);

  // ✅ Enhanced error handling
  React.useEffect(() => {
    if (error) {
      console.error("Header error:", error);
      toast.error(error?.data?.message || 'Something went wrong');
      
      if (error.status === 401) {
        localStorage.clear();
        navigator('/login');
      }
    }
  }, [error, navigator]);

  return (
    <div className='bg-[#D4F4F4] border-b border-[#352AA4] px-[32px] py-[15px] flex items-center sticky top-0 z-[998] w-full'>
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-[1001] lg:hidden bg-white p-2 rounded-md shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="w-6 h-6 flex flex-col justify-around">
            <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
            <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
          </div>
        </button>
      )}

      <div className={`w-full flex items-center justify-between ${isMobile ? 'ml-[60px] max-md:ml-[40px]' : ''}`}>
        {/* Dynamic title */}
        <div className="flex items-center gap-2 max-md:flex-col max-md:items-start max-md:gap-0">
          <h4 className='text-[24px] font-semibold text-[#352AA4] max-md:text-[16px]'>
            {pageTitle}
          </h4>
          {/* ✅ Updated breadcrumb condition */}
          {/* {(location.pathname !== '/' && location.pathname !== '/dashboard') && (
            <span className="text-[#7C7C7C] text-sm hidden sm:block">
              • {location.pathname.split('/').filter(Boolean).join(' / ')}
            </span>
          )} */}
        </div>

        {/* Clickable User profile section */}
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-[8px] hover:bg-white/30 rounded-lg p-2 transition-colors group"
         
        >
          <img
            className='w-[50px] h-[50px] rounded-full border-4 border-[#67E9E9] object-cover group-hover:border-[#352AA4] transition-colors'
            src={data?.data?.profileImage ? `${import.meta.env.VITE_BASE_URL}${data?.data?.profileImage}` : user_img}
            alt="Profile"
          />
          <div className="max-sm:hidden">
            <p className='text-[#352AA4] capitalize font-medium group-hover:text-[#2a217a] transition-colors'>
              {isLoading ? 'Loading...' : data?.data?.fullname || 'Admin'}
            </p>
            <p className='text-[#7C7C7C] text-sm group-hover:text-[#352AA4] transition-colors'>
              (admin)
            </p>
          </div>
          
          {/* <svg 
            className="w-4 h-4 text-[#7C7C7C] group-hover:text-[#352AA4] transition-colors max-sm:hidden" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg> */}
        </button>
      </div>
    </div>
  );
};

export default Header;
