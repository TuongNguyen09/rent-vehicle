import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaKey, FaPaperPlane, FaSave, FaShieldAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import userService from '../../services/userService';

const Profile = () => {
    const { isAuthenticated, loading, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');
    const [profileMessage, setProfileMessage] = useState('');
    const [fullName, setFullName] = useState('');
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [code, setCode] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const isLocalAccount = useMemo(() => {
        return (profile?.authProvider || '').toUpperCase() === 'LOCAL';
    }, [profile]);

    const loadProfile = async () => {
        setProfileLoading(true);
        setProfileError('');
        try {
            const response = await userService.getMyProfile();
            if (response.code === 1000 && response.result) {
                setProfile(response.result);
                setFullName(response.result.fullName || '');
            } else {
                setProfileError(response.message || 'Không thể tải profile.');
            }
        } catch (error) {
            setProfileError(error?.response?.data?.message || 'Không thể tải profile.');
        } finally {
            setProfileLoading(false);
        }
    };

    const resetPasswordStates = () => {
        setCode('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordMessage('');
    };

    useEffect(() => {
        if (loading) {
            return;
        }
        if (!isAuthenticated) {
            sessionStorage.setItem('postLoginRedirect', '/profile');
            navigate('/login', { replace: true });
            return;
        }
        loadProfile();
    }, [isAuthenticated, loading, navigate]);

    const handleUpdateProfile = async (event) => {
        event.preventDefault();
        setProfileError('');
        setProfileMessage('');

        const trimmedName = fullName.trim();
        if (!trimmedName) {
            setProfileError('Họ tên không được để trống.');
            return;
        }

        setUpdatingProfile(true);
        try {
            const response = await userService.updateMyProfile(trimmedName);
            if (response.code === 1000 && response.result) {
                setProfile(response.result);
                setProfileMessage('Lưu thông tin thành công.');
                await refreshUser();
            } else {
                setProfileError(response.message || 'Lưu thông tin thất bại.');
            }
        } catch (error) {
            setProfileError(error?.response?.data?.message || 'Lưu thông tin thất bại.');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleSendCode = async () => {
        setPasswordError('');
        setPasswordMessage('');
        setSendingCode(true);
        try {
            const response = await authService.requestChangePasswordCode();
            if (response.code === 1000) {
                setPasswordMessage('Mã xác minh đã được gửi vào email của bạn.');
            } else {
                setPasswordError(response.message || 'Không thể gửi mã xác minh.');
            }
        } catch (error) {
            setPasswordError(error?.response?.data?.message || 'Không thể gửi mã xác minh.');
        } finally {
            setSendingCode(false);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setPasswordError('');
        setPasswordMessage('');

        if (!code.trim()) {
            setPasswordError('Vui lòng nhập mã xác minh.');
            return;
        }
        if (!oldPassword) {
            setPasswordError('Vui lòng nhập mật khẩu cũ.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Mật khẩu mới và xác nhận không trùng khớp.');
            return;
        }

        setChangingPassword(true);
        try {
            const response = await authService.confirmChangePassword(code.trim(), oldPassword, newPassword, confirmPassword);
            if (response.code === 1000) {
                setPasswordMessage('Đổi mật khẩu thành công.');
                setCode('');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordError(response.message || 'Không thể đổi mật khẩu.');
            }
        } catch (error) {
            setPasswordError(error?.response?.data?.message || 'Không thể đổi mật khẩu.');
        } finally {
            setChangingPassword(false);
        }
    };

    const openPasswordForm = () => {
        resetPasswordStates();
        setShowPasswordForm(true);
    };

    const backToProfile = () => {
        resetPasswordStates();
        setShowPasswordForm(false);
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen pt-28 pb-12 px-4 bg-gray-50">
                <div className="max-w-xl mx-auto text-center text-gray-600">Đang tải profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-12 px-4 bg-gray-50">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Tài khoản của tôi</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
                </div>

                {(profileError || profileMessage) && (
                    <div className={`rounded-xl p-4 text-sm ${profileError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {profileError || profileMessage}
                    </div>
                )}

                {!showPasswordForm && (
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin profile</h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Họ và tên</label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Email</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={profile?.email || ''}
                                        className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 bg-gray-50 text-gray-500"
                                        disabled
                                    />
                                </div>
                            </div>

                            {isLocalAccount && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Bảo mật tài khoản</span>
                                    <button
                                        type="button"
                                        onClick={openPasswordForm}
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            )}

                            {!isLocalAccount && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-700 p-3 text-sm">
                                    Tài khoản {profile?.authProvider || 'OAuth'} không hỗ trợ đổi mật khẩu bằng OTP.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={updatingProfile}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <FaSave />
                                {updatingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
                            </button>
                        </form>
                    </div>
                )}

                {showPasswordForm && (
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <h2 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h2>
                            <button
                                type="button"
                                onClick={backToProfile}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                Quay lại profile
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Nhập mã xác minh từ email và đặt mật khẩu mới.</p>

                        {(passwordError || passwordMessage) && (
                            <div className={`rounded-lg p-3 text-sm mb-4 ${passwordError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {passwordError || passwordMessage}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={sendingCode}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <FaPaperPlane />
                                {sendingCode ? 'Đang gửi mã...' : 'Gửi mã xác minh'}
                            </button>

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
                                <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Mật khẩu cũ</label>
                                <div className="relative">
                                    <FaKey className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(event) => setOldPassword(event.target.value)}
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        placeholder="Nhập mật khẩu hiện tại"
                                        required
                                    />
                                </div>
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

                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <FaShieldAlt />
                                {changingPassword ? 'Đang đổi mật khẩu...' : 'Xác nhận đổi mật khẩu'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

