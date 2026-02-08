import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaSpinner } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    // Xử lý đăng ký
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const result = await register(fullName, email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Đăng ký thất bại');
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
                navigate('/');
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative bg-[url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60 z-0"></div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-sm bg-white/95">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                        Tạo tài khoản mới
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Tham gia ngay để trải nghiệm dịch vụ thuê xe tốt nhất
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
                            theme="outline"
                            size="large"
                            text="signup_with"
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
                        <FaFacebook className="text-white" /> Đăng ký với Facebook
                    </button>
                </div>
                
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Hoặc đăng ký bằng email</span>
                    </div>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div className="relative">
                        <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Họ và tên</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 pl-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                    </div>

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
                                placeholder="Tối thiểu 6 ký tự"
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

                    <div className="relative">
                        <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Xác nhận mật khẩu</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 pl-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Nhập lại mật khẩu"
                            />
                             <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center pt-2">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            required
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                            Tôi đồng ý với <a href="#" className="text-primary hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-secondary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Đang đăng ký...
                                </>
                            ) : (
                                'Đăng ký tài khoản'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-blue-500">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
