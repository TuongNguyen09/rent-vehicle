import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Khởi tạo auth state bằng cách gọi API (không dùng localStorage)
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Gọi API để kiểm tra xem user đã đăng nhập chưa
                const userData = await authService.checkAuth();
                if (userData) {
                    setUser({
                        id: userData.userId,
                        email: userData.email,
                        fullName: userData.fullName,
                        role: userData.role,
                    });
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Failed to init auth:', error);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Đăng nhập bằng email/password
    const login = async (email, password) => {
        const response = await authService.login(email, password);
        if (response.code === 1000 && response.result) {
            const userData = {
                id: response.result.userId,
                email: response.result.email,
                fullName: response.result.fullName,
                role: response.result.role,
            };
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        }
        return { success: false, message: response.message };
    };

    // Đăng ký
    const register = async (fullName, email, password) => {
        const response = await authService.register(fullName, email, password);
        if (response.code === 1000 && response.result) {
            const userData = {
                id: response.result.userId,
                email: response.result.email,
                fullName: response.result.fullName,
                role: response.result.role,
            };
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        }
        return { success: false, message: response.message };
    };

    // Đăng nhập bằng Google
    const googleLogin = async (googleToken) => {
        const response = await authService.googleLogin(googleToken);
        if (response.code === 1000 && response.result) {
            const userData = {
                id: response.result.userId,
                email: response.result.email,
                fullName: response.result.fullName,
                role: response.result.role,
            };
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        }
        return { success: false, message: response.message };
    };

    // Đăng nhập bằng Facebook
    const facebookLogin = async (facebookToken) => {
        const response = await authService.facebookLogin(facebookToken);
        if (response.code === 1000 && response.result) {
            const userData = {
                id: response.result.userId,
                email: response.result.email,
                fullName: response.result.fullName,
                role: response.result.role,
            };
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        }
        return { success: false, message: response.message };
    };

    // Đăng xuất
    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    // Đăng xuất tất cả thiết bị
    const logoutAllDevices = async () => {
        await authService.logoutAllDevices();
        setUser(null);
        setIsAuthenticated(false);
    };

    // Refresh user data
    const refreshUser = async () => {
        try {
            const userData = await authService.checkAuth();
            if (userData) {
                setUser({
                    id: userData.userId,
                    email: userData.email,
                    fullName: userData.fullName,
                    role: userData.role,
                });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        googleLogin,
        facebookLogin,
        logout,
        logoutAllDevices,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
