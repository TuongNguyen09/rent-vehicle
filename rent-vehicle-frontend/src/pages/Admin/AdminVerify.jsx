import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelopeOpenText, FaSpinner } from 'react-icons/fa';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const AdminVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser, isAuthenticated, user } = useAuth();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const username = useMemo(() => {
        return location.state?.username || sessionStorage.getItem('admin_verify_username') || '';
    }, [location.state]);

    const redirectTo = location.state?.from || '/admin/dashboard';

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!username) {
            setError('Khong tim thay username de xac minh. Vui long dang nhap lai.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const response = await authService.adminLoginVerify(username, code);
            if (response.code === 1000) {
                sessionStorage.removeItem('admin_verify_username');
                await refreshUser();
                navigate(redirectTo, { replace: true });
            } else {
                setError(response.message || 'Ma xac minh khong hop le.');
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Khong the xac minh ma OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <button
                    type="button"
                    onClick={() => navigate('/admin/login')}
                    className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-2 mb-4"
                >
                    <FaArrowLeft />
                    Quay lai
                </button>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                        <FaEnvelopeOpenText className="text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Xac minh Admin</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Ma OTP da duoc gui toi email dang nhap: <span className="font-medium">{username || '---'}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ma xac minh</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary tracking-[0.35em] text-center text-lg"
                            placeholder="000000"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <FaSpinner className="animate-spin" />
                                DANG XAC MINH...
                            </span>
                        ) : (
                            'XAC MINH VA DANG NHAP'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminVerify;
