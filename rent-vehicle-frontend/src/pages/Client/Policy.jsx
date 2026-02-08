import { useState } from 'react';
import { FaFileContract, FaShieldAlt, FaUndo, FaUserSecret } from 'react-icons/fa';

const Policy = () => {
    const [activeTab, setActiveTab] = useState('rental');

    const sections = {
        rental: {
            title: 'Chính sách thuê xe',
            icon: <FaFileContract />,
            content: (
                <div className="space-y-4 text-gray-700">
                    <h3 className="text-xl font-bold text-gray-900">1. Điều kiện thuê xe</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Khách hàng phải đủ 18 tuổi trở lên và có năng lực hành vi dân sự đầy đủ.</li>
                        <li>Có Giấy phép lái xe hạng B1 trở lên còn hiệu lực (đối với xe 4-7 chỗ).</li>
                        <li>Có Căn cước công dân hoặc Hộ chiếu bản gốc.</li>
                        <li>Có tài khoản ngân hàng hoặc thẻ tín dụng để đặt cọc.</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-6">2. Thủ tục nhận xe</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Khách hàng kiểm tra tình trạng xe (nội thất, ngoại thất, xăng, số km) cùng nhân viên giao xe.</li>
                        <li>Ký xác nhận vào Biên bản bàn giao xe.</li>
                        <li>Để lại tài sản thế chấp (xe máy + cà vẹt xe máy) hoặc đặt cọc tiền mặt/chuyển khoản (15-20 triệu đồng tùy dòng xe).</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-6">3. Thủ tục trả xe</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Trả xe đúng thời gian quy định trong hợp đồng. Quá giờ sẽ tính phí phụ trội.</li>
                        <li>Xe phải được rửa sạch sẽ như lúc nhận (nếu không sẽ thu phí vệ sinh từ 100k - 200k).</li>
                        <li>Hoàn trả lại mức nhiên liệu như ban đầu (hoặc thanh toán tiền xăng chênh lệch).</li>
                    </ul>
                </div>
            )
        },
        cancellation: {
            title: 'Chính sách hủy chuyến',
            icon: <FaUndo />,
            content: (
                <div className="space-y-4 text-gray-700">
                    <p>Trong trường hợp kế hoạch thay đổi, RentVehicle áp dụng chính sách hủy chuyến như sau:</p>
                    
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 my-4">
                        <strong className="text-orange-800">Lưu ý:</strong> Tiền cọc sẽ được hoàn trả qua tài khoản ngân hàng trong vòng 3-5 ngày làm việc.
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3 font-bold border-r">Thời điểm hủy</th>
                                <th className="p-3 font-bold">Phí hủy (% tiền cọc)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-3 border-r">Sau khi đặt cọc</td>
                                <td className="p-3">0% (Hoàn 100% cọc)</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 border-r">Trước chuyến đi 7 ngày</td>
                                <td className="p-3">0% (Hoàn 100% cọc)</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 border-r">Trong vòng 7 ngày trước đi</td>
                                <td className="p-3">50% tiền cọc</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 border-r">Trong vòng 24h trước đi</td>
                                <td className="p-3">100% tiền cọc</td>
                            </tr>
                            <tr>
                                <td className="p-3 border-r">Không nhận xe</td>
                                <td className="p-3">100% tiền cọc</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )
        },
        insurance: {
            title: 'Bảo hiểm & Sự cố',
            icon: <FaShieldAlt />,
            content: (
                <div className="space-y-4 text-gray-700">
                    <h3 className="text-xl font-bold text-gray-900">1. Bảo hiểm xe</h3>
                    <p>Tất cả xe của RentVehicle đều có bảo hiểm trách nhiệm dân sự bắt buộc và bảo hiểm vật chất xe (bảo hiểm hai chiều).</p>
                    
                    <h3 className="text-xl font-bold text-gray-900 mt-6">2. Xử lý sự cố</h3>
                    <p>Trong quá trình thuê xe, nếu xảy ra sự cố va chạm hoặc hỏng hóc:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Khách hàng giữ nguyên hiện trường và liên hệ ngay hotline 1900 1234 để được hướng dẫn.</li>
                        <li>Không tự ý sửa chữa hoặc thỏa thuận với bên thứ ba khi chưa có sự đồng ý của RentVehicle.</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-6">3. Trách nhiệm bồi thường</h3>
                    <p>Khách hàng chịu mức miễn thường theo quy định của bảo hiểm (thường là 500k - 1tr/vụ) và chi phí nằm xe (thời gian xe chờ sửa chữa không khai thác được).</p>
                </div>
            )
        },
        privacy: {
            title: 'Quyền riêng tư',
            icon: <FaUserSecret />,
            content: (
                <div className="space-y-4 text-gray-700">
                     <p>RentVehicle cam kết bảo mật thông tin cá nhân của khách hàng theo quy định của pháp luật Việt Nam.</p>
                     
                     <h3 className="text-xl font-bold text-gray-900 mt-6">1. Thu thập thông tin</h3>
                     <p>Chúng tôi thu thập thông tin (Họ tên, SĐT, Email, GPLX) chỉ để phục vụ mục đích xác thực danh tính và ký hợp đồng thuê xe.</p>

                     <h3 className="text-xl font-bold text-gray-900 mt-6">2. Chia sẻ thông tin</h3>
                     <p>Thông tin khách hàng không được bán hay chia sẻ cho bên thứ ba, ngoại trừ yêu cầu từ cơ quan chức năng có thẩm quyền.</p>
                </div>
            )
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12">
             <div className="container mx-auto px-4 md:px-6">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-12">Chính sách & Quy định</h1>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                             {Object.keys(sections).map((key) => (
                                 <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`w-full text-left px-6 py-4 flex items-center gap-3 border-b last:border-0 hover:bg-gray-50 transition-colors ${activeTab === key ? 'bg-primary/5 text-primary font-bold border-l-4 border-l-primary' : 'text-gray-600'}`}
                                 >
                                     <span className="text-lg">{sections[key].icon}</span>
                                     {sections[key].title}
                                 </button>
                             ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-xl shadow-sm p-8 min-h-[500px]">
                            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                                {sections[activeTab].icon}
                                {sections[activeTab].title}
                            </h2>
                            <div className="animate-fade-in">
                                {sections[activeTab].content}
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Policy;
