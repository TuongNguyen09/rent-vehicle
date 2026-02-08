import { FaFacebook, FaYoutube, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">RentVehicle</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Giải pháp thuê xe uy tín hàng đầu Việt Nam. Hơn 5000+ dòng xe đa dạng, thủ tục nhanh gọn, giao xe tận nơi.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"><FaFacebook /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors"><FaYoutube /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors"><FaInstagram /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Chính Sách</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">Về RentVehicle</Link></li>
              <li><Link to="/policy" className="text-gray-400 hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link to="/policy" className="text-gray-400 hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/policy" className="text-gray-400 hover:text-white transition-colors">Chính sách hủy chuyến</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Liên Hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <FaMapMarkerAlt className="mt-1 text-primary" />
                <span>Số 1, Đường Quang Trung, Q. Gò Vấp, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FaPhone className="text-primary" />
                <span>1900 1234 - 0987 654 321</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FaEnvelope className="text-primary" />
                <span>hotro@rentvehicle.vn</span>
              </li>
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">Tải Ứng Dụng</h4>
            <p className="text-gray-400 mb-4">Trải nghiệm đặt xe nhanh hơn với ứng dụng di động.</p>
            <div className="flex flex-col gap-3">
               <button className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-700">
                 <div className="text-2xl"></div>
                 <div className="text-left">
                   <div className="text-xs text-gray-400">Download on the</div>
                   <div className="font-bold text-sm">App Store</div>
                 </div>
               </button>
               <button className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-700">
                 <div className="text-2xl">🤖</div>
                 <div className="text-left">
                   <div className="text-xs text-gray-400">Get it on</div>
                   <div className="font-bold text-sm">Google Play</div>
                 </div>
               </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Công Ty Cổ Phần RentVehicle Việt Nam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
