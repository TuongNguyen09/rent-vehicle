import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaChartPie,
    FaCar,
    FaUsers,
    FaCalendarAlt,
    FaStar,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaBell,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/admin/dashboard', icon: <FaChartPie />, label: 'Tong quan' },
        { path: '/admin/vehicles', icon: <FaCar />, label: 'Quan ly xe' },
        { path: '/admin/bookings', icon: <FaCalendarAlt />, label: 'Don dat xe' },
        { path: '/admin/users', icon: <FaUsers />, label: 'Khach hang' },
        { path: '/admin/reviews', icon: <FaStar />, label: 'Danh gia' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

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
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg w-full transition-colors"
                    >
                        <FaSignOutAlt className="text-xl min-w-[20px]" />
                        <span
                            className={`font-medium transition-opacity ${
                                sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'
                            }`}
                        >
                            Dang xuat
                        </span>
                    </button>
                </div>
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
                        <div className="flex items-center gap-3">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=random`}
                                alt="Admin"
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="font-bold text-gray-700 hidden sm:block">{user?.fullName || 'Admin HQ'}</span>
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