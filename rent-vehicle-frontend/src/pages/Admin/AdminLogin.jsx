import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner, FaLock, FaUserShield } from 'react-icons/fa';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.adminLoginStart(username, password);
            if (response.code === 1000) {
                const normalizedUsername = response?.result?.username || username.trim().toLowerCase();
                sessionStorage.setItem('admin_verify_username', normalizedUsername);

                navigate('/admin/verify', {
                    replace: true,
                    state: {
                        username: normalizedUsername,
                        expiresIn: response?.result?.expiresIn,
                        from: location.state?.from || '/admin/dashboard',
                    },
                });
            } else {
                setError(response.message || 'Không thể đăng nhập admin.');
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể đăng nhập admin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                        <FaUserShield className="text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
                    <p className="text-sm text-gray-500 mt-1">Đăng nhập để tiếp tục vào Dashboard</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
                            placeholder="Nhập email admin"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 outline-none focus:border-primary"
                                placeholder="Nhập mật khẩu admin"
                                required
                            />
                            <FaLock className="absolute right-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <FaSpinner className="animate-spin" />
                                ĐANG GỬI MÃ...
                            </span>
                        ) : (
                            'TIẾP TỤC XÁC MINH'
                        )}
                    </button>
                </form>

                <div className="text-center mt-4 text-sm">
                    <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                        Quên mật khẩu admin?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
