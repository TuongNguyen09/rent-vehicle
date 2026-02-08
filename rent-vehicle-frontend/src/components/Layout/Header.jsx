import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaCar, FaUser, FaPhoneAlt, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  
  const { user, isAuthenticated, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Determine styling based on page and scroll state
  const isTransparent = isHomePage && !isScrolled;

  const headerClass = `fixed w-full z-50 transition-all duration-300 ${!isTransparent ? 'bg-white shadow-md py-3' : 'bg-transparent py-4'}`;
  const logoClass = `flex items-center gap-2 text-2xl font-bold ${!isTransparent ? 'text-primary' : 'text-white'}`;
  const navClass = `hidden md:flex items-center gap-8 font-medium ${!isTransparent ? 'text-gray-700' : 'text-white/90'}`;
  const iconClass = `md:hidden text-2xl ${!isTransparent ? 'text-gray-700' : 'text-white'}`;
  const authClass = `font-medium hover:text-secondary transition-colors ${!isTransparent ? 'text-gray-700' : 'text-white'}`;
  const hotlineClass = `flex items-center gap-2 mr-4 font-bold ${!isTransparent ? 'text-gray-700' : 'text-white'}`;

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className={logoClass}>
          <FaCar className="text-3xl" />
          <span>RentVehicle</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={navClass}>
          <Link to="/" className="hover:text-secondary transition-colors">Về chúng tôi</Link>
          <Link to="/vehicles" className="hover:text-secondary transition-colors">Thuê xe</Link>
          <Link to="/promo" className="hover:text-secondary transition-colors">Khuyến mãi</Link>
        </nav>

        {/* Auth Buttons & Hotline */}
        <div className="hidden md:flex items-center gap-4">
          <div className={hotlineClass}>
            <FaPhoneAlt size={14} />
            <span>1900 1234</span>
          </div>
          
          {isAuthenticated && user ? (
            // User Menu
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  !isTransparent ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                } ${authClass}`}
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user.fullName}</span>
                <FaChevronDown size={12} />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaCar size={14} />
                    Đơn thuê xe của tôi
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUser size={14} />
                    Tài khoản
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaBars size={14} />
                      Quản trị
                    </Link>
                  )}
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <FaSignOutAlt size={14} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Login/Register buttons
            <>
              <Link to="/login" className={authClass}>Đăng nhập</Link>
              <Link to="/register" className="px-5 py-2 bg-secondary text-white font-medium rounded hover:bg-orange-600 transition-colors shadow-sm">
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className={iconClass} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t animate-fade-in-down">
          <div className="flex flex-col p-4 gap-4 text-gray-800">
            <Link to="/" className="p-2 hover:bg-gray-50 rounded font-medium" onClick={() => setIsOpen(false)}>Về chúng tôi</Link>
            <Link to="/vehicles" className="p-2 hover:bg-gray-50 rounded font-medium" onClick={() => setIsOpen(false)}>Thuê xe</Link>
            <Link to="/promo" className="p-2 hover:bg-gray-50 rounded font-medium" onClick={() => setIsOpen(false)}>Khuyến mãi</Link>
            <hr />
            
            {isAuthenticated && user ? (
              <>
                <div className="p-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link to="/my-bookings" className="p-2 hover:bg-gray-50 rounded flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <FaCar /> Đơn thuê xe của tôi
                </Link>
                <Link to="/profile" className="p-2 hover:bg-gray-50 rounded flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <FaUser /> Tài khoản
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="p-2 hover:bg-gray-50 rounded flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <FaBars /> Quản trị
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded flex items-center gap-2 text-left"
                >
                  <FaSignOutAlt /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="p-2 hover:bg-gray-50 rounded flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <FaUser /> Đăng nhập
                </Link>
                <Link to="/register" className="p-2 bg-secondary text-center text-white rounded hover:bg-orange-600" onClick={() => setIsOpen(false)}>
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
