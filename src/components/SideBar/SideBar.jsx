import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import logo from '../../assets/logo2.png';
import dashboard_icon from '../../assets/icons/dashboard-icon.svg';
import user_icon from '../../assets/icons/user-icon.svg';
import perfume_icon from '../../assets/icons/perfume-icon.svg';
import quiz_icon from '../../assets/icons/quiz-icon.svg';
import level_quiz_icon from '../../assets/icons/levelQuiz.svg';
import setting_icon from '../../assets/icons/setting-icon.svg';
import faq_icon from '../../assets/icons/faq_icon.svg';
import logout_icon from '../../assets/icons/logout-icon.svg';
import article_icon from '../../assets/icons/article.svg';
import badge_icon from '../../assets/icons/badge-icon.svg';
import rank_icon from '../../assets/icons/rank-icon.svg';
import note_icon from '../../assets/icons/note-icon.svg';
import perfumer_icon from '../../assets/icons/perfumer-icon.svg';

const SideBar = ({ isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = () => {
    if (isMobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Dashboard', icon: dashboard_icon },
    { to: '/users', label: 'Manage Users', icon: user_icon },
    { to: '/perfumes', label: 'Manage Perfumes', icon: perfume_icon },
    { to: '/notes', label: 'Manage Notes', icon: note_icon },
    { to: '/perfumers', label: 'Manage Perfumers', icon: perfumer_icon },
    { to: '/quiz', label: 'Manage Play With Friend Quiz', icon: quiz_icon },
    { to: '/level-quiz', label: 'Manage Level Quiz', icon: level_quiz_icon },
    { to: '/articles', label: 'Manage Articles', icon: article_icon },
    { to: '/badge', label: 'Manage Badge', icon: badge_icon },
    { to: '/rank', label: 'Manage Rank', icon: rank_icon },
    { to: '/setting', label: 'Settings', icon: setting_icon },
    { to: '/faq', label: 'FQA', icon: faq_icon },
  ];

  return (
    <div className={`h-[100vh] ${isMobile ? 'lg:block' : 'max-lg:hidden'}`}>
      <div
        className={`flex flex-col border-r border-[#352AA4] fixed left-0 top-0 bg-[#D4F4F4] z-[1000] h-full w-[320px] min-w-[320px] max-w-[320px] transition-transform duration-300 ease-in-out overflow-hidden ${
          isMobile
            ? mobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : 'translate-x-0'
        }`}
      >
        {/* Logo Section - Fixed */}
        <div className="flex-shrink-0 mb-[52px] mt-[50px] mx-auto">
          <Link to="/" onClick={handleLinkClick}>
            <img className="max-w-[162px]" src={logo} alt="Logo" />
          </Link>
        </div>

        {/* Scrollable Navigation Section */}
        <div className="side-bar flex flex-col w-full flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {links.map(({ to, label, icon }) => {
            const active = to === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(to);
            return (
              <Link
                to={to}
                key={to}
                className={`sidebar-link flex items-center gap-3 px-4 py-3 mx-4 rounded-lg transition-colors duration-200 ${
                  active ? 'active bg-white/20' : 'hover:bg-white/10'
                }`}
                onClick={handleLinkClick}
              >
                <img src={icon} alt={`${label} icon`} className="active-icon w-6 h-6" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Profile/Logout Section - Fixed at Bottom */}
        <div className="flex-shrink-0 px-4 py-5 w-full">
          <button
            className="sidebar-link !text-[#FF4040] bg-[rgba(255,64,64,0.10)] w-full flex items-center gap-3 py-3 px-4 cursor-pointer border-0 text-left rounded-lg transition-colors duration-200 hover:bg-[rgba(255,64,64,0.15)]"
            onClick={handleLogout}
          >
            <img src={logout_icon} alt="Logout" className="w-6 h-6" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
