import { useState, useEffect } from 'react';
import { FaFilter, FaThLarge, FaList, FaSearch, FaStar, FaUserFriends, FaGasPump, FaCogs, FaChevronDown, FaChevronUp, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getVehicleModels, getVehicleTypes } from '../../services/vehicleService';

const VehicleList = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 9,
    totalPages: 0,
    totalElements: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: ''
  });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState(null); // Trigger for apply button
  
  // Fetch vehicle types
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await getVehicleTypes();
        if (response.code === 1000 && response.result) {
          setVehicleTypes(response.result);
        }
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
      }
    };
    fetchVehicleTypes();
  }, []);
  
  // Fetch vehicles (backend handles pagination with page/size params)
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.page + 1, // Convert to 1-indexed for backend
          size: pagination.size
        };
        
        // Add filters if set
        if (selectedBrands.length === 1) {
          params.vehicleTypeId = selectedBrands[0];
        }
        if (filters.minPrice) {
          params.minPrice = filters.minPrice;
        }
        if (filters.maxPrice) {
          params.maxPrice = filters.maxPrice;
        }
        
        const response = await getVehicleModels(params);
        if (response.code === 1000 && response.result) {
          // Handle paginated response
          if (response.result.data) {
            const { data, currentPage, pageSize, totalPages, totalElements } = response.result;
            setVehicles(data || []);
            setPagination({
              page: currentPage - 1, // Convert back to 0-indexed for frontend
              size: pageSize,
              totalPages,
              totalElements
            });
          } else {
            // Fallback if not paginated response
            setVehicles(response.result || []);
            setPagination(prev => ({ ...prev, totalPages: 1, totalElements: (response.result || []).length }));
          }
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [pagination.page, pagination.size, appliedFilters]);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };
  
  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 0 }));
    setAppliedFilters(Date.now()); // Trigger fetch with current filters
    setShowMobileFilter(false);
  };
  
  const handleBrandChange = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };
  
  const handleMinPriceChange = (e) => {
    setFilters(prev => ({ ...prev, minPrice: e.target.value }));
  };
  
  const handleMaxPriceChange = (e) => {
    setFilters(prev => ({ ...prev, maxPrice: e.target.value }));
  };
  
  // Default image if no images
  const defaultImage = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop";

  const FilterSection = ({ title, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="border-b border-gray-200 py-4">
        <button 
          className="flex items-center justify-between w-full font-bold text-gray-800 mb-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {title}
          {isOpen ? <FaChevronUp className="text-sm text-gray-500" /> : <FaChevronDown className="text-sm text-gray-500" />}
        </button>
        {isOpen && <div className="mt-2 text-sm">{children}</div>}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 pt-20 pb-12 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb & Title */}
        <div className="mb-8 mt-4">
           <div className="text-sm text-gray-500 mb-2">
             <Link to="/" className="hover:text-primary">Trang chủ</Link> / <span>Danh sách xe</span>
           </div>
           <h1 className="text-3xl font-bold text-gray-900">Thuê Xe</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-center gap-2 bg-white p-3 rounded-lg shadow font-bold text-primary border border-primary/20"
            onClick={() => setShowMobileFilter(true)}
          >
            <FaFilter /> Bộ Lọc Tìm Kiếm
          </button>

          {/* Sidebar Filters */}
          <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 z-50 lg:translate-x-0 lg:static lg:z-0 lg:shadow-none lg:w-1/4 lg:bg-transparent lg:block overflow-y-auto lg:overflow-visible ${showMobileFilter ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="p-4 lg:p-0">
               <div className="flex justify-between items-center lg:hidden mb-4">
                 <h2 className="text-xl font-bold">Bộ Lọc</h2>
                 <button onClick={() => setShowMobileFilter(false)} className="text-gray-500 text-2xl">&times;</button>
               </div>
               
               <div className="bg-white lg:rounded-xl lg:shadow-sm lg:p-6 lg:border border-gray-200">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3">Tùy chỉnh giá (VNĐ)</h3>
                    <div className="flex items-center gap-2 mb-4">
                       <input 
                         type="number" 
                         placeholder="Giá tối thiểu" 
                         className="w-full border rounded px-2 py-1 text-sm" 
                         value={filters.minPrice}
                         onChange={handleMinPriceChange}
                       />
                       -
                       <input 
                         type="number" 
                         placeholder="Giá tối đa" 
                         className="w-full border rounded px-2 py-1 text-sm" 
                         value={filters.maxPrice}
                         onChange={handleMaxPriceChange}
                       />
                    </div>
                  </div>

                  <FilterSection title="Hãng xe">
                     <div className="space-y-2">
                       {vehicleTypes.map((type) => (
                         <label key={type.id} className="flex items-center gap-2 cursor-pointer hover:text-primary">
                           <input 
                             type="checkbox" 
                             className="rounded text-primary focus:ring-primary" 
                             checked={selectedBrands.includes(type.id)}
                             onChange={() => handleBrandChange(type.id)}
                           />
                           <span>{type.name}</span>
                         </label>
                       ))}
                     </div>
                  </FilterSection>
                  
                  <button 
                    onClick={handleApplyFilters}
                    className="w-full mt-6 bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    Áp dụng
                  </button>
               </div>
             </div>
             {/* Overlay for mobile */}
             {showMobileFilter && <div className="fixed inset-0 bg-black/50 z-[-1] lg:hidden" onClick={() => setShowMobileFilter(false)}></div>}
          </aside>

          {/* Vehicle Listing */}
          <main className="lg:w-3/4">
             {/* Sort & View Options */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-500 text-sm">Hiển thị <span className="font-bold text-gray-900">{pagination.totalElements}</span> kết quả</div>
                <div className="flex items-center gap-4">
                   <select className="border-gray-300 border rounded-lg text-sm p-2 focus:ring-primary focus:border-primary outline-none">
                      <option>Mới nhất</option>
                      <option>Giá thấp đến cao</option>
                      <option>Giá cao đến thấp</option>
                   </select>
                   <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button 
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                        onClick={() => setViewMode('grid')}
                      ><FaThLarge /></button>
                      <button 
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                        onClick={() => setViewMode('list')}
                      ><FaList /></button>
                   </div>
                </div>
             </div>

             {/* Vehicle Grid/List */}
             {loading ? (
               <div className="flex justify-center items-center py-20">
                 <FaSpinner className="animate-spin text-4xl text-primary" />
               </div>
             ) : vehicles.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                 <p className="text-gray-500 text-lg">Không tìm thấy xe nào phù hợp</p>
               </div>
             ) : (
               <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                {vehicles.map((vehicle) => (
                   <div key={vehicle.id} className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}>
                      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full md:w-1/3 h-48 md:h-auto' : 'h-48'}`}>
                         <img 
                           src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : defaultImage} 
                           alt={vehicle.name} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                         />
                         <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-800 shadow">
                           {vehicle.brand}
                         </div>
                      </div>
                      
                      <div className={`p-4 flex flex-col justify-between ${viewMode === 'list' ? 'w-full md:w-2/3' : ''}`}>
                         <div>
                            <div className="flex justify-between items-start mb-1">
                               <span className="text-xs font-bold text-gray-500 uppercase">{vehicle.vehicleTypeName}</span>
                               <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                 <FaStar /> <span className="text-gray-600 font-medium">{vehicle.averageRating ? vehicle.averageRating.toFixed(1) : 'N/A'}</span> <span className="text-gray-400">({vehicle.reviewCount || 0})</span>
                               </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{vehicle.name}</h3>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
                               <div className="flex items-center gap-2"><FaUserFriends className="text-primary/70"/> {vehicle.seats || 4} Chỗ</div>
                               <div className="flex items-center gap-2"><FaCogs className="text-primary/70"/> {vehicle.transmission || 'Tự động'}</div>
                               <div className="flex items-center gap-2"><FaGasPump className="text-primary/70"/> {vehicle.fuel || 'Xăng'}</div>
                               <div className="flex items-center gap-2 truncate" title={vehicle.location}><FaCogs className="text-primary/70"/> {vehicle.location || 'Hồ Chí Minh'}</div>
                            </div>
                         </div>

                         <div className={`flex items-center justify-between pt-3 border-t border-dashed border-gray-200 mt-auto`}>
                            <div>
                               <div className="text-secondary font-bold text-xl">{vehicle.pricePerDay?.toLocaleString()}đ</div>
                               <div className="text-xs text-gray-400">/ngày</div>
                            </div>
                            <Link to={`/vehicles/${vehicle.id}`} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                              Chi tiết
                            </Link>
                         </div>
                      </div>
                   </div>
                ))}
               </div>
             )}
             
             {/* Pagination */}
             {pagination.totalPages > 1 && (
               <div className="mt-12 flex justify-center">
                  <nav className="flex gap-2">
                     <button 
                       className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-500 disabled:opacity-50"
                       onClick={() => handlePageChange(pagination.page - 1)}
                       disabled={pagination.page === 0}
                     >«</button>
                     {Array.from({ length: pagination.totalPages }).map((_, idx) => (
                       <button 
                         key={idx}
                         className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                           pagination.page === idx 
                             ? 'bg-primary text-white font-bold shadow-lg shadow-blue-500/30' 
                             : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                         }`}
                         onClick={() => handlePageChange(idx)}
                       >{idx + 1}</button>
                     ))}
                     <button 
                       className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-500 disabled:opacity-50"
                       onClick={() => handlePageChange(pagination.page + 1)}
                       disabled={pagination.page >= pagination.totalPages - 1}
                     >»</button>
                  </nav>
               </div>
             )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default VehicleList;
