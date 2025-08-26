import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import logo from '../../assets/logo.png';
import dashboard_icon from '../../assets/icons/dashboard-icon.svg';
import user_icon from '../../assets/icons/user-icon.svg';
import perfume_icon from '../../assets/icons/perfume-icon.svg';
import quiz_icon from '../../assets/icons/quiz-icon.svg';
import setting_icon from '../../assets/icons/setting-icon.svg';
import logout_icon from '../../assets/icons/logout-icon.svg';
import article_icon from '../../assets/icons/article.svg';
import badge_icon from '../../assets/icons/badge-icon.svg';
import rank_icon from '../../assets/icons/rank-icon.svg';

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
    { to: '/perfumes', label: 'Manage Perfum', icon: perfume_icon },
    { to: '/quiz', label: 'Manage Quiz', icon: quiz_icon },
    { to: '/articles', label: 'Manage Articles', icon: article_icon },
    { to: '/badge', label: 'Manage Badge', icon: badge_icon },
    { to: '/rank', label: 'Manage Rank', icon: rank_icon },

  ];

  return (
    <div className={`h-[100vh] ${isMobile ? 'lg:block' : 'max-lg:hidden'}`}>
      <div
        className={`flex flex-col border-r border-[#352AA4] fixed left-0 top-0 bg-[#D4F4F4] z-[1000] h-full w-[320px] min-w-[320px] max-w-[320px] transition-transform duration-300 ease-in-out ${
          isMobile
            ? mobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : 'translate-x-0'
        }`}
      >
        <Link to="/" className="mb-[52px] mt-[50px] mx-auto" onClick={handleLinkClick}>
          <img className="max-w-[162px]" src={logo} alt="Logo" />
        </Link>

        <div className="side-bar flex flex-col w-full">
          {links.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                to={to}
                key={to}
                className={`sidebar-link flex items-center gap-3 px-4 py-3 ${
                  active ? 'active' : ''
                }`}
                onClick={handleLinkClick}
              >
                <img src={icon} alt={`${label} icon`} className="active-icon w-6 h-6 " />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* profile section */}
        <div className="flex flex-col items-start justify-between mt-auto px-4 py-5 w-full">
          {/* <Link
            to="/settings"
            className="sidebar-link text-[#7C7C7C] w-full flex items-center gap-3 py-3"
            onClick={handleLinkClick}
          >
            <img src={setting_icon} alt="Settings" className="w-6 h-6" />
            Settings
          </Link> */}
          <div
            to="/logout"
            className="sidebar-link !text-[#FF4040] bg-[rgba(255,64,64,0.10)] w-full flex items-center gap-3 py-3"
            onClick={handleLogout}
          >
            <img src={logout_icon} alt="Logout" className="w-6 h-6" />
            Logout
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
