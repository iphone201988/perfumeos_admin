import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideBar from '../SideBar/SideBar';
import Header from '../Header/Header';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="flex">
            {isMobile && mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/70 bg-opacity-50 z-[999] lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            <SideBar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                isMobile={isMobile}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <main
                className={`ml-[320px] absolute w-[calc(100%-320px)] min-h-[100vh] top-[0] bg-[#ffff] max-lg:w-full max-lg:ml-0`}
            >
                <Header
                    isMobile={isMobile}
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-sm:px-[20px] m-5'>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
