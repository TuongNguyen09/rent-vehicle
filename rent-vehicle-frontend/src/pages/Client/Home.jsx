import { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaGasPump, FaCogs, FaUserFriends, FaCheckCircle, FaCarSide, FaMoneyBillWave, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Home = () => {
  // Carousel logic
  const carouselImages = [
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1983&auto=format&fit=crop"
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };


  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative h-[550px] md:h-[650px] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
         <img 
            src="https://images.unsplash.com/photo-1596728362369-1c9c0d186c5f?q=80&w=2070&auto=format&fit=crop" 
            alt="Vietnam Traffic" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center mt-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight shadow-md">
            THUÊ XE <br/> <span className="text-secondary">GIÁ TỐT NHẤT VIỆT NAM</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-3xl mx-auto font-medium drop-shadow">
            Hơn 5000+ xe đời mới, thủ tục đơn giản, giao xe tận nơi tại Hà Nội, Đà Nẵng, TP.HCM và toàn quốc.
          </p>

          {/* Search Box - Vietnamese Style */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-2xl max-w-5xl mx-auto border-t-4 border-secondary">
            <div className="flex gap-4 mb-4 border-b pb-4">
               <span className="text-primary font-bold border-b-2 border-primary pb-1 text-lg">Tìm Xe Ngay</span>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 relative group">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Địa điểm nhận xe</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 group-focus-within:border-primary group-focus-within:bg-white transition-all">
                  <FaMapMarkerAlt className="text-secondary mr-3 text-lg" />
                  <input type="text" placeholder="Nhập thành phố, quận, sân bay..." className="bg-transparent w-full focus:outline-none text-gray-800 font-medium placeholder-gray-400" />
                </div>
              </div>
              
              <div className="md:col-span-3 relative group">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Bắt đầu</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 group-focus-within:border-primary group-focus-within:bg-white transition-all">
                  <FaCalendarAlt className="text-primary mr-2" />
                  <input type="datetime-local" className="bg-transparent w-full focus:outline-none text-gray-800 font-medium text-sm" />
                </div>
              </div>

              <div className="md:col-span-3 relative group">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Kết thúc</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 group-focus-within:border-primary group-focus-within:bg-white transition-all">
                  <FaCalendarAlt className="text-primary mr-2" />
                  <input type="datetime-local" className="bg-transparent w-full focus:outline-none text-gray-800 font-medium text-sm" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-transparent mb-1 select-none">Action</label>
                <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-105">
                   TÌM XE
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="bg-white py-8 border-b border-gray-200">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="bg-secondary text-white font-bold px-3 py-1 rounded text-sm animate-pulse">HOT</div>
                    <span className="font-medium text-gray-700">Giảm ngay <span className="text-red-500 font-bold">15%</span> cho khách hàng mới thuê xe lần đầu!</span>
                </div>
                <Link to="/promo" className="text-primary font-bold hover:underline text-sm uppercase flex items-center gap-1">Xem chi tiết <i className="text-xs">→</i></Link>
            </div>
         </div>
      </section>

      {/* Featured Fleet (Xe Noi Bat - VN Style) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 uppercase mb-2">Xe Tự Lái Nổi Bật</h2>
            <div className="w-20 h-1 bg-secondary mx-auto"></div>
            <p className="text-gray-500 mt-4">Các dòng xe được khách hàng thuê nhiều nhất tuần qua</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mock Car Data - VN popular cars */}
            {[
              { name: "VinFast Lux A2.0", type: "Sedan", price: "1.200k", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop", local: "Hồ Chí Minh" },
              { name: "Mazda 3 2023", type: "Sedan", price: "900k", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop", local: "Hà Nội" },
              { name: "Xpander 2022", type: "MPV 7 chỗ", price: "1.000k", img: "https://images.unsplash.com/photo-1626847037657-3a3722778c48?q=80&w=2070&auto=format&fit=crop", local: "Đà Nẵng" },
              { name: "Honda City RS", type: "Sedan", price: "800k", img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=2069&auto=format&fit=crop", local: "Hồ Chí Minh" }
            ].map((car, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img src={car.img} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <FaMapMarkerAlt className="text-secondary" /> {car.local}
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{car.type}</span>
                     <div className="flex text-yellow-400 text-xs"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1 truncate" title={car.name}>{car.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                     <span className="flex items-center gap-1"><FaCogs /> Tự động</span>
                     <span className="flex items-center gap-1"><FaGasPump /> Xăng</span>
                  </div>
                  
                  <div className="flex items-end justify-between mt-auto pt-3 border-t border-dashed border-gray-200">
                    <div>
                      <div className="text-secondary font-bold text-xl">{car.price}<span className="text-sm font-normal text-gray-500">/ngày</span></div>
                    </div>
                    <Link to={`/vehicles/${idx + 1}`} className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                      Chọn xe
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
             <Link to="/vehicles" className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors uppercase">
               Xem tất cả 500+ xe
             </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us (Uu diem) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="relative group overflow-hidden rounded-2xl shadow-2xl h-[400px]">
                {/* Carousel Images */}
                {carouselImages.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                     <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                     {/* Gradient Overlay */}
                     <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                ))}

                {/* Navigation Buttons */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transition-all md:opacity-0 group-hover:opacity-100"
                >
                  <FaChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transition-all md:opacity-0 group-hover:opacity-100"
                >
                  <FaChevronRight size={20} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {carouselImages.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
                
                {/* Decoration Element removed as requested */}
             </div>
             <div>
                <h3 className="text-primary font-bold uppercase tracking-widest mb-2 text-sm">Về RentVehicle</h3>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Bạn Muốn Lái Xe? <br/>Chúng Tôi Có Giải Pháp.</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                   Chúng tôi cung cấp nền tảng kết nối chủ xe và khách thuê xe với quy trình thuê xe an toàn, nhanh chóng và minh bạch nhất Việt Nam.
                </p>
                
                <div className="space-y-6">
                   {[
                      { title: "An Toàn Tuyệt Đối", desc: "Các đối tác chủ xe đều được xác minh danh tính và giấy tờ xe rõ ràng.", icon: <FaCheckCircle /> },
                      { title: "Giao Xe Tận Nơi", desc: "Chủ xe hỗ trợ giao xe tận sân bay, bến xe hoặc tại nhà riêng của bạn.", icon: <FaCarSide /> },
                      { title: "Giá Cả Minh Bạch", desc: "Không phí ẩn. Giá niêm yết rõ ràng trên website và hợp đồng.", icon: <FaMoneyBillWave /> },
                   ].map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                         <div className="w-12 h-12 rounded-full bg-blue-50 text-secondary text-xl flex items-center justify-center flex-shrink-0">
                            {item.icon}
                         </div>
                         <div>
                            <h4 className="font-bold text-lg text-gray-800">{item.title}</h4>
                            <p className="text-gray-500 text-sm">{item.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Mobile App */}
      <section className="bg-primary mt-12 overflow-hidden relative">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
               <div className="md:w-1/2 py-16 text-white text-center md:text-left z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Tải ứng dụng RentVehicle</h2>
                  <p className="text-blue-100 text-lg mb-8 max-w-md">Nhận thông báo khuyến mãi và quản lý chuyến đi dễ dàng hơn ngay trên điện thoại của bạn.</p>
                  <div className="flex gap-4 justify-center md:justify-start">
                     <button className="bg-black/20 hover:bg-black/40 border border-white/30 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all">
                        <span className="text-2xl"></span>
                        <div className="text-left text-xs">
                           <div>Download on the</div>
                           <div className="font-bold text-base">App Store</div>
                        </div>
                     </button>
                      <button className="bg-black/20 hover:bg-black/40 border border-white/30 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all">
                        <span className="text-2xl">🤖</span>
                        <div className="text-left text-xs">
                           <div>Get it on</div>
                           <div className="font-bold text-base">Google Play</div>
                        </div>
                     </button>
                  </div>
               </div>
               
               <div className="md:w-1/2 relative h-[300px] md:h-[400px] flex items-end justify-center">
                  {/* Mock Phone Image */}
                   <div className="w-64 h-full bg-gray-900 rounded-t-3xl border-t-8 border-r-8 border-l-8 border-gray-800 shadow-2xl relative translate-y-10 transform md:translate-x-10">
                      <div className="w-full h-full bg-white rounded-t-2xl overflow-hidden relative">
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-b-xl z-20"></div>
                          {/* App Screen Mock */}
                          <div className="p-4 pt-10">
                             <div className="bg-gray-100 h-8 mb-2 rounded w-3/4"></div>
                             <div className="bg-gray-100 h-32 mb-2 rounded w-full"></div>
                             <div className="flex gap-2 mb-2">
                                <div className="bg-blue-100 h-20 w-1/2 rounded"></div>
                                <div className="bg-blue-100 h-20 w-1/2 rounded"></div>
                             </div>
                             <div className="bg-gray-100 h-10 mb-2 rounded w-full"></div>
                          </div>
                          <div className="absolute bottom-0 w-full h-12 bg-gray-100 border-t flex justify-around items-center text-gray-400">
                             <div className="w-6 h-6 bg-primary rounded-full"></div>
                             <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                             <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                             <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          </div>
                      </div>
                   </div>
               </div>
            </div>
         </div>
         {/* Background Circles */}
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-500/20 rounded-full blur-2xl"></div>
      </section>
    </div>
  );
};

export default Home;
