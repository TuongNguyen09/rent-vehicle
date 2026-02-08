import { FaCar, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const Dashboard = () => {
    // Mock Data
    const stats = [
        {
            title: "Tổng doanh thu",
            value: "1.25 Tỷ",
            change: "+12%",
            isIncrease: true,
            icon: <FaMoneyBillWave />,
            color: "bg-green-500"
        },
        {
            title: "Đơn đặt xe",
            value: "450",
            change: "+5.2%",
            isIncrease: true,
            icon: <FaCalendarCheck />,
            color: "bg-blue-500"
        },
        {
            title: "Khách hàng mới",
            value: "128",
            change: "-2%",
            isIncrease: false,
            icon: <FaUsers />,
            color: "bg-purple-500"
        },
        {
            title: "Xe đang thuê",
            value: "45",
            change: "+8%",
            isIncrease: true,
            icon: <FaCar />,
            color: "bg-orange-500"
        }
    ];

    const recentBookings = [
        { id: "#BK001", user: "Nguyễn Văn A", car: "VinFast VF 8", startDate: "2024-02-10", total: "3.500.000₫", status: "Pending" },
        { id: "#BK002", user: "Trần Thị B", car: "Mazda 3", startDate: "2024-02-11", total: "1.800.000₫", status: "Confirmed" },
        { id: "#BK003", user: "Lê Hoàng C", car: "Honda Civic", startDate: "2024-02-12", total: "2.100.000₫", status: "Completed" },
        { id: "#BK004", user: "Phạm Văn D", car: "Toyota Fortuner", startDate: "2024-02-13", total: "2.800.000₫", status: "Cancelled" },
        { id: "#BK005", user: "Vũ Thị E", car: "Kia Carnival", startDate: "2024-02-14", total: "5.500.000₫", status: "Confirmed" },
    ];

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'text-yellow-600 bg-yellow-100';
            case 'Confirmed': return 'text-blue-600 bg-blue-100';
            case 'Completed': return 'text-green-600 bg-green-100';
            case 'Cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-gray-500 font-medium text-sm">{stat.title}</div>
                            <div className={`p-3 rounded-lg text-white shadow-lg shadow-gray-200 ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
                        </div>
                        <div className={`text-sm flex items-center gap-1 ${stat.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                            {stat.isIncrease ? <FaArrowUp /> : <FaArrowDown />}
                            <span className="font-medium">{stat.change}</span>
                            <span className="text-gray-400 font-normal">so với tháng trước</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Char (Mock) */}
                <div className="bg-white lg:col-span-2 rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ doanh thu</h2>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {/* Mock Bars */}
                        {[60, 45, 75, 50, 80, 95, 70, 85, 65, 90, 100, 80].map((h, i) => (
                            <div key={i} className="w-full bg-blue-50 hover:bg-blue-100 rounded-t-lg relative group transition-all">
                                <div 
                                    className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"
                                    style={{ height: `${h}%` }}
                                ></div>
                                <div className="absolute -bottom-6 w-full text-center text-xs text-gray-500">
                                    T{i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Giao dịch gần đây</h2>
                    <div className="space-y-4">
                        {recentBookings.map((booking, idx) => (
                            <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{booking.user}</h4>
                                    <p className="text-xs text-gray-500">{booking.car}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm text-gray-800">{booking.total}</div>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold mt-1 ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
