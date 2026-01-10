import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiPackage, FiCalendar, FiUsers, FiCreditCard, 
  FiPhone, FiMail, FiUser, FiCheckCircle, FiClock, 
  FiXCircle, FiAlertCircle, FiDownload, FiMessageSquare,
  FiMapPin, FiInfo, FiPrinter
} from 'react-icons/fi';
import { getUserHistory } from '../../utils/api/TourApi';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      const response = await getUserHistory();
      const foundBooking = response.data.find(b => b.id === parseInt(id));
      
      if (!foundBooking) {
        setError('Không tìm thấy thông tin đặt tour');
      } else {
        setBooking(foundBooking);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Không thể tải thông tin đặt tour. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          label: 'Đã xác nhận',
          icon: FiCheckCircle,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200'
        };
      case 'PENDING':
        return {
          label: 'Chờ xử lý',
          icon: FiClock,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200'
        };
      case 'CANCELLED':
        return {
          label: 'Đã hủy',
          icon: FiXCircle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200'
        };
      default:
        return {
          label: status,
          icon: FiAlertCircle,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getPaymentStatusConfig = (status) => {
    switch (status) {
      case 'SUCCESS':
        return { label: 'Đã thanh toán', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'PENDING':
        return { label: 'Chờ thanh toán', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case 'FAILED':
        return { label: 'Thanh toán thất bại', color: 'text-red-600', bgColor: 'bg-red-50' };
      default:
        return { label: status, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER': return 'Khác';
      default: return gender;
    }
  };

  const getParticipantTypeLabel = (type) => {
    switch (type) {
      case 'ADULT': return 'Người lớn';
      case 'CHILD': return 'Trẻ em';
      case 'INFANT': return 'Em bé';
      default: return type;
    }
  };

  const getRoomTypeLabel = (type) => {
    switch (type) {
      case 'SINGLE': return 'Phòng đơn';
      case 'DOUBLE': return 'Phòng đôi';
      default: return type;
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getDaysUntilDeparture = () => {
    const today = new Date();
    const departure = new Date(booking.departureDate);
    const diffTime = departure - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin đặt tour...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiXCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải thông tin</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/booking-history')}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              Quay lại lịch sử
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const paymentStatusConfig = getPaymentStatusConfig(booking.paymentStatus);
  const StatusIcon = statusConfig.icon;
  const daysUntil = getDaysUntilDeparture();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - No Print */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => navigate('/booking-history')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <FiArrowLeft size={20} />
            <span>Quay lại lịch sử đặt tour</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đặt tour</h1>
              <p className="text-gray-600">Mã đặt tour: <span className="font-semibold text-gray-900">{booking.bookingCode}</span></p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                <StatusIcon className={statusConfig.iconColor} size={18} />
                <span className={`font-semibold ${statusConfig.textColor}`}>
                  {statusConfig.label}
                </span>
              </div>
              
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${paymentStatusConfig.bgColor}`}>
                <FiCreditCard className={paymentStatusConfig.color} size={18} />
                <span className={`font-semibold ${paymentStatusConfig.color}`}>
                  {paymentStatusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Box - Countdown */}
        {booking.status === 'CONFIRMED' && daysUntil > 0 && daysUntil <= 30 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 print:hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCalendar className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-1">
                  Còn {daysUntil} ngày đến ngày khởi hành!
                </h3>
                <p className="text-blue-700">
                  Hãy chuẩn bị hành lý và giấy tờ cần thiết. Chúc bạn có chuyến đi vui vẻ!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tour Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FiPackage className="text-primary" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Thông tin tour</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.tourName}</h3>
                  <Link 
                    to={`/tours/${booking.tourId}`}
                    className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1 print:hidden"
                  >
                    Xem chi tiết tour <FiArrowLeft className="rotate-180" size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ngày khởi hành</p>
                      <p className="font-semibold text-gray-900">{formatDate(booking.departureDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ngày kết thúc</p>
                      <p className="font-semibold text-gray-900">{formatDate(booking.returnDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiClock className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ngày đặt</p>
                      <p className="font-semibold text-gray-900">{formatDateTime(booking.bookingDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiUsers className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tổng số khách</p>
                      <p className="font-semibold text-gray-900">
                        {booking.numAdults + booking.numChildren + booking.numInfants} người
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.numAdults} người lớn
                        {booking.numChildren > 0 && ` • ${booking.numChildren} trẻ em`}
                        {booking.numInfants > 0 && ` • ${booking.numInfants} em bé`}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.customerNotes && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl">
                      <FiMessageSquare className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-semibold text-amber-900 mb-1">Ghi chú của bạn</p>
                        <p className="text-amber-800">{booking.customerNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FiUser className="text-blue-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Thông tin liên hệ</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-gray-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Người liên hệ</p>
                    <p className="font-semibold text-gray-900">{booking.contactName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPhone className="text-gray-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                    <a href={`tel:${booking.contactPhone}`} className="font-semibold text-primary hover:text-primary-dark">
                      {booking.contactPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiMail className="text-gray-600" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <a href={`mailto:${booking.contactEmail}`} className="font-semibold text-primary hover:text-primary-dark break-all">
                      {booking.contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FiUsers className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Danh sách hành khách</h2>
                  <p className="text-sm text-gray-600 mt-1">{booking.participants.length} người</p>
                </div>
              </div>

              <div className="space-y-4">
                {booking.participants.map((participant, index) => (
                  <div key={participant.id} className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{participant.fullName}</h3>
                        <p className="text-sm text-gray-600">{calculateAge(participant.dateOfBirth)} tuổi</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Ngày sinh</p>
                        <p className="font-semibold text-gray-900">{new Date(participant.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Giới tính</p>
                        <p className="font-semibold text-gray-900">{getGenderLabel(participant.gender)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Loại khách</p>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {getParticipantTypeLabel(participant.participantType)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Loại phòng</p>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                          {getRoomTypeLabel(participant.roomType)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <FiCreditCard className="text-orange-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Chi phí</h2>
              </div>

              <div className="space-y-3">
                {booking.numAdults > 0 && (
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <p className="text-gray-600">Người lớn</p>
                      <p className="text-xs text-gray-500">{formatCurrency(booking.adultPrice)} × {booking.numAdults}</p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(booking.adultPrice * booking.numAdults)}
                    </span>
                  </div>
                )}

                {booking.numChildren > 0 && (
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <p className="text-gray-600">Trẻ em</p>
                      <p className="text-xs text-gray-500">{formatCurrency(booking.childPrice)} × {booking.numChildren}</p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(booking.childPrice * booking.numChildren)}
                    </span>
                  </div>
                )}

                {booking.numInfants > 0 && (
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <p className="text-gray-600">Em bé</p>
                      <p className="text-xs text-gray-500">{formatCurrency(booking.infantPrice)} × {booking.numInfants}</p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(booking.infantPrice * booking.numInfants)}
                    </span>
                  </div>
                )}

                {booking.numSingleRooms > 0 && (
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <p className="text-gray-600">Phụ thu phòng đơn</p>
                      <p className="text-xs text-gray-500">{formatCurrency(booking.singleRoomSurcharge)} × {booking.numSingleRooms}</p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(booking.singleRoomSurcharge * booking.numSingleRooms)}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(booking.finalPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {booking.paymentStatus === 'SUCCESS' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button 
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                >
                  <FiPrinter size={18} />
                  In thông tin
                </button>

                <Link
                  to={`/tours/${booking.tourId}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                >
                  <FiPackage size={18} />
                  Xem tour
                </Link>

                <Link
                  to="/booking-history"
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  <FiArrowLeft size={18} />
                  Quay lại
                </Link>
              </div>

              {/* Support Box */}
              <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-start gap-3">
                  <FiInfo className="text-indigo-600 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-indigo-900 mb-2">Cần hỗ trợ?</h4>
                    <p className="text-sm text-indigo-700 mb-3">
                      Liên hệ với chúng tôi để được tư vấn và hỗ trợ
                    </p>
                    <div className="space-y-2 text-sm">
                      <a href="tel:1900xxxx" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
                        <FiPhone size={16} />
                        Hotline: 1900 xxxx
                      </a>
                      <a href="mailto:support@example.com" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
                        <FiMail size={16} />
                        Email hỗ trợ
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}