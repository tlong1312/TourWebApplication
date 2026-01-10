import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserHistory } from '../../utils/api/TourApi';
import { 
  FiCalendar, FiUsers, FiCreditCard, FiArrowLeft, 
  FiPackage, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle 
} from 'react-icons/fi';

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await getUserHistory(); 
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch booking history. Please try again later.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return {
          label: 'Đã xác nhận',
          icon: FiCheckCircle,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'pending':
        return {
          label: 'Chờ xử lý',
          icon: FiClock,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          icon: FiXCircle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      default:
        return {
          label: 'Chờ xử lý',
          icon: FiAlertCircle,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải lịch sử đặt tour...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiXCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải dữ liệu</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <FiArrowLeft size={20} />
            <span>Quay lại trang hồ sơ</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <FiPackage className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lịch sử đặt tour</h1>
              <p className="text-gray-600 mt-1">
                {bookings.length > 0 ? `Bạn đã đặt ${bookings.length} tour` : 'Chưa có đặt tour nào'}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="text-gray-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đặt tour nào</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Khám phá các tour du lịch tuyệt vời và bắt đầu cuộc hành trình của bạn ngay hôm nay!
            </p>
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-sm"
            >
              <FiPackage size={20} />
              Khám phá các tour
            </Link>
          </div>
        ) : (
          /* Booking List */
          <div className="space-y-6">
            {bookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FiPackage className="text-primary" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Mã đặt tour</p>
                          <p className="font-bold text-gray-900">{booking.bookingCode}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig.bgColor}`}>
                        <StatusIcon className={statusConfig.iconColor} size={18} />
                        <span className={`font-semibold ${statusConfig.textColor}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Tour Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">
                      {booking.tourName}
                    </h3>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Booking Date */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiCalendar className="text-blue-600" size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Ngày đặt</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                      </div>

                      {/* Departure Date */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiClock className="text-green-600" size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Ngày khởi hành</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatDate(booking.departureDate)}
                          </p>
                        </div>
                      </div>

                      {/* Passengers */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiUsers className="text-purple-600" size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Số lượng khách</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {booking.passengerCount} người
                          </p>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiCreditCard className="text-orange-600" size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                          <p className="font-bold text-primary text-sm">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(booking.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                      <Link
                        to={`/booking-details/${booking.id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <FiPackage size={18} />
                        Xem chi tiết
                      </Link>
                      {booking.status.toLowerCase() === 'confirmed' && (
                        <button
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                          <FiCreditCard size={18} />
                          Tải hóa đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}