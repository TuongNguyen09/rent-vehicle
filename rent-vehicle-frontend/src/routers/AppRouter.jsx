import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import AdminLayout from '../components/Layout/AdminLayout';
import AdminRoute from '../components/Auth/AdminRoute';
import Dashboard from '../pages/Admin/Dashboard';
import VehicleManager from '../pages/Admin/VehicleManager';
import BookingManager from '../pages/Admin/BookingManager';
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminVerify from '../pages/Admin/AdminVerify';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/vehicles",
        element: <VehicleList />,
      },
      {
        path: "/vehicles/:id",
        element: <VehicleDetail />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/payment/callback",
        element: <PaymentCallback />,
      },
      {
        path: "/payment/:bookingId",
        element: <PaymentPage />,
      },
      {
        path: "/my-bookings",
        element: <MyBookings />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/policy",
        element: <Policy />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
        {
            path: "dashboard",
            element: <Dashboard />
        },
        {
            path: "vehicles",
            element: <VehicleManager />
        },
        {
            path: "bookings",
            element: <BookingManager />
        }
    ]
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/verify",
    element: <AdminVerify />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
