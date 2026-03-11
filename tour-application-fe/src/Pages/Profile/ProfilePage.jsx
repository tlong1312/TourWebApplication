import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserById } from "../../utils/api/TourApi";
import { useAuth } from "../../contexts/AuthContext";
import { 
  FiUser, FiEdit3, FiLock, FiClock, FiLogOut, 
  FiMenu, FiX, FiMail, FiPhone, FiMapPin, FiCalendar
} from "react-icons/fi";


export default function ProfilePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const {user, logoutContext} = useAuth();
  const [userData, setUserData] = useState({
    district: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    province: "",
    address: "",
    dateOfBirth: "",
    avatarUrl: "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=200",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        
        if (user && user.id) {
          const response = await getUserById(user.id);
          const data = response.data;

          setUserData({
            district: data.district || "",
            email: data.email || "",
            fullName: data.fullName || "Người dùng",
            phoneNumber: data.phoneNumber || data.phone || "",
            province: data.province || "",
            address: data.address || "",
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth).toLocaleDateString("vi-VN")
              : "",
            avatarUrl: data.avatar || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName || 'User')}&background=0D8ABC&color=fff&size=200`,
          });
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, user]);

  const handleLogout = async () => {
    await logoutContext();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Sidebar - Desktop & Mobile Drawer */}
          <aside className={`
            fixed lg:static top-20 lg:top-0 bottom-0 left-0 z-50 w-80 bg-white
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:w-72 lg:rounded-2xl lg:shadow-sm overflow-y-auto lg:z-0 lg:self-start
          `}>
            {/* Desktop Sidebar Content - Sticky with proper spacing */}
            <div className="lg:sticky lg:top-28">
              <div className="sticky top-0 bg-white z-10 p-6 border-b lg:border-b-0 lg:static lg:z-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Cài đặt tài khoản</h3>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              <nav className="p-6 space-y-6">
                {/* Account Section */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Tài khoản
                  </p>
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium transition-all"
                    >
                      <FiUser size={20} />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link
                      to="/editprofile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all"
                    >
                      <FiEdit3 size={20} />
                      <span>Chỉnh sửa hồ sơ</span>
                    </Link>
                    <Link
                      to="/changepassword"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all"
                    >
                      <FiLock size={20} />
                      <span>Đổi mật khẩu</span>
                    </Link>
                  </div>
                </div>

                {/* Transactions Section */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Giao dịch
                  </p>
                  <div className="space-y-1">
                    <Link
                      to="/booking-history"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all"
                    >
                      <FiClock size={20} />
                      <span>Lịch sử đặt tour</span>
                    </Link>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-all"
                  >
                    <FiLogOut size={20} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 space-y-6 relative z-10">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden fixed bottom-6 right-6 z-30 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
            >
              <FiMenu size={24} />
            </button>

            {/* Header Card with Cover & Avatar */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Cover Photo */}
              <div className="h-40 bg-gradient-to-r from-primary via-primary-light to-primary relative">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              {/* Profile Header */}
              <div className="relative px-6 pb-6 pt-4">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-20">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                    <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                      <img
                        src={userData.avatarUrl}
                        alt={userData.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center sm:text-left mb-2 mt-20 sm:pt-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                        {userData.fullName}
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2 justify-center sm:justify-start">
                        <FiMail size={16} />
                        {userData.email}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
                    <Link
                      to="/editprofile"
                      className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-sm"
                    >
                      <FiEdit3 size={18} />
                      <span className="hidden sm:inline">Chỉnh sửa</span>
                    </Link>
                    <Link
                      to="/changepassword"
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <FiLock size={18} />
                      <span className="hidden sm:inline">Đổi mật khẩu</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
                <Link
                  to="/editprofile"
                  className="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  <FiEdit3 size={16} />
                  Chỉnh sửa
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    <FiUser size={16} />
                    Họ và tên
                  </label>
                  <p className="text-gray-900 font-medium text-lg">
                    {userData.fullName || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    <FiMail size={16} />
                    Email
                  </label>
                  <p className="text-gray-900 font-medium text-lg break-all">
                    {userData.email || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    <FiPhone size={16} />
                    Số điện thoại
                  </label>
                  <p className="text-gray-900 font-medium text-lg">
                    {userData.phoneNumber || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    <FiCalendar size={16} />
                    Ngày sinh
                  </label>
                  <p className="text-gray-900 font-medium text-lg">
                    {userData.dateOfBirth || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Province */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    <FiMapPin size={16} />
                    Tỉnh / Thành phố
                  </label>
                  <p className="text-gray-900 font-medium text-lg">
                    {userData.province || "Chưa cập nhật"}
                  </p>
                </div>

                {/* District */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    <FiMapPin size={16} />
                    Quận / Huyện
                  </label>
                  <p className="text-gray-900 font-medium text-lg">
                    {userData.district || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Address - Full Width */}
                {userData.address && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      <FiMapPin size={16} />
                      Địa chỉ chi tiết
                    </label>
                    <p className="text-gray-900 font-medium text-lg">
                      {userData.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  to="/editprofile"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <FiEdit3 size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Chỉnh sửa hồ sơ</h3>
                    <p className="text-sm text-gray-600">Cập nhật thông tin</p>
                  </div>
                </Link>

                <Link
                  to="/changepassword"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <FiLock size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Đổi mật khẩu</h3>
                    <p className="text-sm text-gray-600">Bảo mật tài khoản</p>
                  </div>
                </Link>

                <Link
                  to="/booking-history"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <FiClock size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Lịch sử đặt tour</h3>
                    <p className="text-sm text-gray-600">Xem các chuyến đi</p>
                  </div>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}