import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import Home from '../pages/Client/Home';
import VehicleList from '../pages/Client/VehicleList';
import VehicleDetail from '../pages/Client/VehicleDetail';
import Checkout from '../pages/Client/Checkout';
import PaymentPage from '../pages/Client/PaymentPage';
import PaymentCallback from '../pages/Client/PaymentCallback';
import MyBookings from '../pages/Client/MyBookings';
import About from '../pages/Client/About';
import Policy from '../pages/Client/Policy';
import Profile from '../pages/Client/Profile';
import AdminLayout from '../components/Layout/AdminLayout';
import AdminRoute from '../components/Auth/AdminRoute';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import Dashboard from '../pages/Admin/Dashboard';
import VehicleManager from '../pages/Admin/VehicleManager';
import BookingManager from '../pages/Admin/BookingManager';
import AdminProfile from '../pages/Admin/AdminProfile';
import UserManager from '../pages/Admin/UserManager';
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminVerify from '../pages/Admin/AdminVerify';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/vehicles',
                element: <VehicleList />,
            },
            {
                path: '/vehicles/:id',
                element: <VehicleDetail />,
            },
            {
                path: '/checkout',
                element: <Checkout />,
            },
            {
                path: '/payment/callback',
                element: <PaymentCallback />,
            },
            {
                path: '/payment/:bookingId',
                element: <PaymentPage />,
            },
            {
                path: '/my-bookings',
                element: <MyBookings />,
            },
            {
                path: '/profile',
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/about',
                element: <About />,
            },
            {
                path: '/policy',
                element: <Policy />,
            },
        ],
    },
    {
        path: '/admin',
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/admin/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'vehicles',
                element: <VehicleManager />,
            },
            {
                path: 'bookings',
                element: <BookingManager />,
            },
            {
                path: 'profile',
                element: <AdminProfile />, 
            },
            {
                path: 'users',
                element: <UserManager />,
            },
        ],
    },
    {
        path: '/admin/login',
        element: <AdminLogin />,
    },
    {
        path: '/admin/verify',
        element: <AdminVerify />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
