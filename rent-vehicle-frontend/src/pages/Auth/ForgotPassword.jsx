import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaKey, FaPaperPlane, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import authService from '../../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSendCode = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!email.trim()) {
            setError('Vui lòng nhập email.');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.requestForgotPasswordCode(email.trim());
            if (response.code === 1000) {
                setCodeSent(true);
                setMessage('Mã xác minh đã được gửi vào email.');
            } else {
                setError(response.message || 'Không thể gửi mã xác minh.');
            }
        } catch (requestError) {
            setError(requestError?.response?.data?.message || 'Không thể gửi mã xác minh.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!code.trim()) {
            setError('Vui lòng nhập mã xác minh.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới và xác nhận không trùng khớp.');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.confirmForgotPassword(
                email.trim(),
                code.trim(),
                newPassword,
                confirmPassword
            );

            if (response.code === 1000) {
                setMessage('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại ngay bây giờ.');
                setTimeout(() => navigate('/login'), 1200);
            } else {
                setError(response.message || 'Không thể đặt lại mật khẩu.');
            }
        } catch (confirmError) {
            setError(confirmError?.response?.data?.message || 'Không thể đặt lại mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Nhập email, nhận mã OTP và đặt mật khẩu mới.
                    </p>
                </div>

                {(error || message) && (
                    <div className={`rounded-lg p-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {error || message}
                    </div>
                )}

                <form onSubmit={codeSent ? handleConfirm : handleSendCode} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Email</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                placeholder="name@example.com"
                                required
                                disabled={codeSent}
                            />
                        </div>
                    </div>

                    {codeSent && (
                        <>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Mã xác minh</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 tracking-[0.25em] text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    placeholder="000000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Mật khẩu mới</label>
                                <div className="relative">
                                    <FaKey className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        placeholder="Tối thiểu 6 ký tự"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Xác nhận mật khẩu mới</label>
                                <div className="relative">
                                    <FaShieldAlt className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        placeholder="Nhập lại mật khẩu mới"
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                {codeSent ? <FaShieldAlt /> : <FaPaperPlane />}
                                {codeSent ? 'Xác nhận đặt lại mật khẩu' : 'Gửi mã xác minh'}
                            </>
                        )}
                    </button>
                </form>

                {codeSent && (
                    <button
                        type="button"
                        onClick={() => {
                            setCodeSent(false);
                            setCode('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setMessage('');
                            setError('');
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                    >
                        Đổi email khác
                    </button>
                )}

                <p className="text-center text-sm text-gray-600">
                    Nhớ mật khẩu rồi?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
