import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTours, getCategories } from "../../utils/api/TourApi";
import TourCard from "../../Components/TourCard/Tourcard";
import { 
  FiSearch, FiDollarSign, FiClock, FiHeadphones, 
  FiMapPin, FiTrendingUp, FiArrowRight 
} from "react-icons/fi";

export default function Home() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const toursRes = await getTours();
        setTours(toursRes.data.content || toursRes.data);
        const map = {};
        (toursRes.data.content || toursRes.data).forEach(tour => {
          const primaryImg = tour.images?.find(img => img.isPrimary);
          if (primaryImg) map[tour.id] = primaryImg.imageUrl;
        });
        setImagesMap(map);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/tours?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const featuredTours = tours.slice(0, 8);

  const destinations = [
  {
    name: "Hà Nội",
    image: "https://images.unsplash.com/photo-1557770401-dabe8321c0c5?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800",
    keyword: "Hà Nội"
  },
  {
    name: "Đà Nẵng",
    image: "https://images.unsplash.com/photo-1639458131380-4d71538ef1df?q=80&w=1303&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800",
    keyword: "Đà Nẵng"
  },
  {
    name: "Sapa",
    image: "https://images.unsplash.com/photo-1570366583862-f91883984fde?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800",
    keyword: "Sapa"
  },
  {
    name: "TP. Hồ Chí Minh",
    image: "https://images.unsplash.com/photo-1503432697506-6986abec65ca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGhvJTIwY2hpJTIwbWluaHxlbnwwfHwwfHx8Mg%3D%3D?w=800",
    keyword: "Hồ Chí Minh"
  }
];
  const features = [
    {
      icon: <FiDollarSign size={32} />,
      title: "Giá Tốt Nhất",
      desc: "Cam kết giá tốt nhất thị trường"
    },
    {
      icon: <FiClock size={32} />,
      title: "Đặt Dễ Dàng",
      desc: "Đặt tour chỉ trong 3 phút"
    },
    {
      icon: <FiHeadphones size={32} />,
      title: "Hỗ Trợ 24/7",
      desc: "Luôn sẵn sàng hỗ trợ bạn"
    },
    {
      icon: <FiMapPin size={32} />,
      title: "Tour Đa Dạng",
      desc: "Hàng trăm tour khắp Việt Nam"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Immersive with Overlay */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1920&q=80"
            alt="Vietnam"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            Khám Phá Vẻ Đẹp Việt&nbsp;Nam
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-12 drop-shadow-lg">
            Những chuyến du lịch tuyệt vời từ trong nước cho đến ngoài nước
          </p>

          {/* Glassmorphism Search Box */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 flex gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="Tìm kiếm điểm đến, tour du lịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 text-lg outline-none bg-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg"
              >
                <span className="hidden sm:inline">Tìm kiếm</span>
                <FiSearch size={20} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-gray-600 text-lg">
              Cam kết mang đến trải nghiệm du lịch tốt nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="text-primary" size={28} />
                <h2 className="text-4xl font-bold text-gray-900">
                  Tour Nổi Bật Nhất Tuần
                </h2>
              </div>
              <p className="text-gray-600">
                Những tour du lịch được yêu thích nhất
              </p>
            </div>
            <Link
              to="/tours"
              className="hidden md:flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              Xem tất cả
              <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} imagesMap={imagesMap} />
                ))}
              </div>

              <div className="text-center mt-12 md:hidden">
                <Link
                  to="/tours"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                >
                  Xem tất cả tour
                  <FiArrowRight />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Top Destinations - Bento Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Điểm Đến Yêu Thích
            </h2>
            <p className="text-gray-600 text-lg">
              Khám phá những địa điểm tuyệt vời tại Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, index) => (
              <Link
                key={index}
                to={`/tours?search=${encodeURIComponent(dest.keyword)}`}
                className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {dest.name}
                  </h3>
                  <div className="flex items-center gap-2 text-white/90">
                    <span>Khám phá ngay</span>
                    <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sẵn sàng cho chuyến đi tiếp theo?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Đặt tour ngay hôm nay và nhận ưu đãi đặc biệt
          </p>
          <Link
            to="/tours"
            className="inline-flex items-center gap-3 bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl"
          >
            Đặt Tour Ngay
            <FiArrowRight size={24} />
          </Link>
        </div>
      </section>
    </div>
  );
}