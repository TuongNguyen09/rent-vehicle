import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebook, FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [dateTime] = useState(new Date().getFullYear());
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const resolveRedirectPath = () => {
        const redirectPath = sessionStorage.getItem('postLoginRedirect');
        if (redirectPath) {
            sessionStorage.removeItem('postLoginRedirect');
            return redirectPath;
        }
        return '/';
    };

    // Xử lý đăng nhập bằng email/password
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate(resolveRedirectPath());
            } else {
                setError(result.message || 'Đăng nhập thất bại');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý đăng nhập bằng Google
    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);

        try {
            const result = await googleLogin(credentialResponse.credential);
            if (result.success) {
                navigate(resolveRedirectPath());
            } else {
                setError(result.message || 'Đăng nhập Google thất bại');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập Google thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative bg-[url('https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=2128&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/50 z-0"></div>
            
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-sm bg-white/95">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                        Chào mừng trở lại!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Đăng nhập để thuê xe và quản lý chuyến đi của bạn
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                
                {/* Social Login Buttons */}
                <div className="flex flex-col gap-3">
                    {/* Google Login Button */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            theme="outline"
                            size="large"
                            text="signin_with"
                            shape="rectangular"
                            width="100%"
                        />
                    </div>
                    
                    {/* Facebook Login Button - Placeholder */}
                    <button 
                        type="button"
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white border border-blue-600 rounded-lg py-2.5 hover:bg-blue-700 transition-colors"
                        onClick={() => setError('Facebook login chưa được cấu hình')}
                    >
                        <FaFacebook className="text-white" /> Đăng nhập với Facebook
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập bằng email</span>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-3 pl-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-3 pl-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Đừng chia sẻ mật khẩu của bạn"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Ghi nhớ đăng nhập
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary hover:text-blue-500">
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </div>
                </form>
                
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="font-medium text-primary hover:text-blue-500">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
                
                <div className="text-center text-xs text-gray-400 mt-6">
                    &copy; {dateTime} RentVehicle. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
