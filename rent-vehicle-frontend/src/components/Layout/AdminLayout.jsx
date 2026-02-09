import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaChartPie,
    FaCar,
    FaCalendarAlt,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaBell,
    FaUserShield,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/admin/dashboard', icon: <FaChartPie />, label: 'Tổng quan' },
        {
            path: '/admin/vehicles',
            icon: <FaCar />,
            label: 'Quản lý xe',
            children: [
                { path: '/admin/vehicles/add', label: 'Thêm dòng xe mới' },
                { path: '/admin/vehicles/brands', label: 'Quản lý hãng xe' },
            ],
        },
        { path: '/admin/users', icon: <FaUserShield />, label: 'Quản lý người dùng' },
        { path: '/admin/bookings', icon: <FaCalendarAlt />, label: 'Đơn đặt xe' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef();
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <div className="flex h-screen bg-gray-100 relative">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`bg-gray-900 text-white transition-all duration-300 flex flex-col fixed md:relative z-30 h-full ${
                    sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'
                }`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
                    <div className="flex items-center justify-center w-full">
                        {sidebarOpen || window.innerWidth < 768 ? (
                            <h1 className="text-2xl font-bold text-primary">RentVehicle</h1>
                        ) : (
                            <span className="text-2xl font-bold text-primary">RV</span>
                        )}
                    </div>
                    <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
                        <FaTimes />
                    </button>
                </div>

                <nav className="flex-1 py-6 overflow-y-auto">
                    <ul className="space-y-2 px-3">
                        {menuItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            if (!item.children) {
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-primary text-white shadow-lg'
                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                            onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                                        >
                                            <span className="text-xl min-w-[20px]">{item.icon}</span>
                                            <span
                                                className={`font-medium transition-opacity ${
                                                    sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'
                                                }`}
                                            >
                                                {item.label}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            }
                            // Menu có children (dropdown)
                            const isParentActive = location.pathname.startsWith(item.path);
                            const [open, setOpen] = useState(isParentActive);
                            return (
                                <li key={item.path}>
                                    <div className={`flex items-center gap-4 px-4 py-3 rounded-lg w-full transition-colors ${
                                        isParentActive
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}>
                                        <Link
                                            to={item.path}
                                            className="flex items-center gap-4 flex-1 min-w-0"
                                            onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                                        >
                                            <span className="text-xl min-w-[20px]">{item.icon}</span>
                                            <span
                                                className={`font-medium flex-1 text-left transition-opacity ${
                                                    sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'
                                                }`}
                                            >
                                                {item.label}
                                            </span>
                                        </Link>
                                        <button
                                            type="button"
                                            className="ml-2 focus:outline-none"
                                            onClick={() => setOpen((prev) => !prev)}
                                            tabIndex={-1}
                                        >
                                            <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                    {open && (
                                        <ul className="pl-10 py-1 space-y-1">
                                            {item.children.map((child) => (
                                                <li key={child.path}>
                                                    <Link
                                                        to={child.path}
                                                        className={`block px-2 py-2 rounded-lg text-sm transition-colors ${
                                                            location.pathname === child.path
                                                                ? 'bg-primary text-white shadow'
                                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                        }`}
                                                        onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                                                    >
                                                        {child.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Đã chuyển Đăng xuất lên header */}
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        <FaBars />
                    </button>

                    <div className="flex items-center gap-6">
                        <button className="text-gray-500 hover:text-primary relative">
                            <FaBell className="text-xl" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                                3
                            </span>
                        </button>
                        {/* Avatar + Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className="flex items-center gap-3 focus:outline-none"
                                onClick={() => setShowDropdown((prev) => !prev)}
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=random`}
                                    alt="Admin"
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="font-bold text-gray-700 hidden sm:block">{user?.fullName || 'Admin HQ'}</span>
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                                    <Link
                                        to="/admin/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <FaUserShield className="text-primary" /> Tài khoản
                                    </Link>
                                    <button
                                        onClick={() => { setShowDropdown(false); handleLogout(); }}
                                        className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left transition-colors"
                                    >
                                        <FaSignOutAlt /> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
