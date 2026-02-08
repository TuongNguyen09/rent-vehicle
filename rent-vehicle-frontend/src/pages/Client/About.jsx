import { FaCar, FaUsers, FaMedal, FaHandshake } from 'react-icons/fa';

const About = () => {
    return (
        <div className="bg-white pt-20">
            {/* Hero Section */}
            <div className="bg-gray-900 py-20 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/50 z-0"></div>
                <div className="relative z-10 container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Về RentVehicle</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Đồng hành cùng bạn trên mọi nẻo đường với dịch vụ thuê xe tự lái chuyên nghiệp hàng đầu Việt Nam.
                    </p>
                </div>
            </div>

            {/* Introduction */}
            <div className="container mx-auto px-4 md:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img 
                            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop" 
                            alt="RentVehicle Office" 
                            className="rounded-xl shadow-lg w-full h-[400px] object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Được thành lập từ năm 2023, RentVehicle ra đời với sứ mệnh mang đến giải pháp di chuyển linh hoạt, 
                            tiện lợi và an toàn cho người Việt. Chúng tôi hiểu rằng mỗi chuyến đi không chỉ là sự dịch chuyển 
                            mà còn là những trải nghiệm, những khoảnh khắc đáng nhớ bên gia đình và bạn bè.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Với hệ thống xe đa dạng từ các dòng sedan phổ thông đến SUV sang trọng, cùng quy trình đặt xe 
                            được số hóa hoàn toàn, RentVehicle cam kết mang lại sự hài lòng tuyệt đối cho khách hàng.
                        </p>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-4 md:px-6">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Giá trị cốt lõi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary text-2xl">
                                <FaCar />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Xe đời mới</h3>
                            <p className="text-gray-500 text-sm">100% xe cho thuê đều là xe đời mới, được bảo dưỡng định kỳ và kiểm tra kỹ lưỡng trước khi giao.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">
                                <FaHandshake />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Minh bạch</h3>
                            <p className="text-gray-500 text-sm">Giá thuê niêm yết rõ ràng, không phí ẩn. Hợp đồng thuê xe chi tiết, đảm bảo quyền lợi khách hàng.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600 text-2xl">
                                <FaUsers />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Hỗ trợ 24/7</h3>
                            <p className="text-gray-500 text-sm">Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi trong suốt chuyến đi.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 text-2xl">
                                <FaMedal />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Chất lượng</h3>
                            <p className="text-gray-500 text-sm">Cam kết chất lượng dịch vụ 5 sao, lấy sự hài lòng của khách hàng làm thước đo thành công.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="container mx-auto px-4 md:px-6 py-16 text-center">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     <div>
                         <div className="text-4xl font-bold text-primary mb-2">500+</div>
                         <div className="text-gray-500 uppercase text-sm font-bold">Đầu xe</div>
                     </div>
                     <div>
                         <div className="text-4xl font-bold text-primary mb-2">10.000+</div>
                         <div className="text-gray-500 uppercase text-sm font-bold">Chuyến đi</div>
                     </div>
                     <div>
                         <div className="text-4xl font-bold text-primary mb-2">98%</div>
                         <div className="text-gray-500 uppercase text-sm font-bold">Hài lòng</div>
                     </div>
                     <div>
                         <div className="text-4xl font-bold text-primary mb-2">5</div>
                         <div className="text-gray-500 uppercase text-sm font-bold">Chi nhánh</div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default About;
