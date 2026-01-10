import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTourById } from "../../utils/api/TourApi";
import Itinerary from "./Itinerary/Itinerary";
import Schedule from "./Schedule/Schedule";
import { 
  FiArrowLeft, FiClock, FiUsers, 
  FiCalendar, FiInfo, FiList, FiChevronLeft, FiChevronRight
} from "react-icons/fi";

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('schedule'); // Start with schedule
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const tourRes = await getTourById(id);
        setTour(tourRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin tour...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Tour không tìm thấy"}</p>
          <Link to="/tours" className="text-primary hover:underline">
            ← Quay lại danh sách tour
          </Link>
        </div>
      </div>
    );
  }

  const safeImages = tour?.images || [];
  const allImages = safeImages.length > 0 ? safeImages : [{ id: 0, imageUrl: "/placeholder.svg", isPrimary: true }];
  const primaryImage = allImages.find(img => img.isPrimary)?.imageUrl || allImages[0]?.imageUrl;

  const handleBookNow = () => {
    navigate("/bookingtour", {
      state: {
        tour: {
          id: tour.id,
          name: tour.name,
          description: tour.description || "Mô tả tour",
          image: primaryImage,
          startDate: tour.startDate,
          endDate: tour.endDate,
          duration: tour.duration,
          availableSeats: tour.availableSeats,
          price: tour.price,
          adultPrice: tour.adultPrice,
          childPrice: tour.childPrice,
          infantPrice: tour.infantPrice,
          departureTime: tour.departureTime,
          returnTime: tour.returnTime,
          singleRoomSurcharge: tour.singleRoomSurcharge,
          schedules: tour.schedules || []
        },
      },
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <FiArrowLeft size={20} />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden group">
            {/* Main Image */}
            <img
              src={allImages[currentImageIndex]?.imageUrl}
              alt={tour.name}
              className="w-full h-full object-cover transition-opacity duration-500"
            />

            {/* Image Counter */}
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {allImages.length}
            </div>

            {/* Previous Button */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <FiChevronLeft size={24} />
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <FiChevronRight size={24} />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tour Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tour Title & Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {tour.name}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <FiClock className="text-primary" size={20} />
                  <span className="font-medium">{tour.duration} ngày {tour.duration - 1} đêm</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="text-primary" size={20} />
                  <span className="font-medium">{tour.availableSeats} chỗ còn trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-primary" size={20} />
                  <span className="font-medium">
                    {new Date(tour.startDate).toLocaleDateString("vi-VN")} - {new Date(tour.endDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiInfo className="text-primary" />
                Giới thiệu
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {tour.description}
              </p>
            </div>

            {/* Tabs - Schedule / Itinerary */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setCurrentView('schedule')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      currentView === 'schedule'
                        ? 'text-primary border-b-2 border-primary bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiCalendar className="inline mr-2" />
                    Chọn ngày khởi hành
                  </button>
                  <button
                    onClick={() => setCurrentView('itinerary')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      currentView === 'itinerary'
                        ? 'text-primary border-b-2 border-primary bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiList className="inline mr-2" />
                    Lịch trình tour
                  </button>
                </div>
              </div>

              <div className="p-6">
                {currentView === 'schedule' ? (
                  <Schedule tour={tour} />
                ) : (
                  <Itinerary tour={tour} />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Giá tour từ</p>
                  <p className="text-4xl font-bold text-amber-600">
                    {Number(tour.price || 0).toLocaleString("vi-VN")}
                    <span className="text-lg text-gray-600 font-normal">đ</span>
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Người lớn</span>
                    <span className="font-semibold text-gray-900">
                      {Number(tour.adultPrice || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trẻ em</span>
                    <span className="font-semibold text-gray-900">
                      {Number(tour.childPrice || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Em bé</span>
                    <span className="font-semibold text-gray-900">
                      {Number(tour.infantPrice || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBookNow}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Đặt tour ngay
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  📞 Liên hệ để được tư vấn chi tiết
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}