import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById, updateUserInfo, uploadAvatar } from "../../utils/api/TourApi";
import { FiUser, FiPhone, FiMapPin, FiCamera, FiSave, FiX, FiUpload, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const {user} = useAuth();
  
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [avatarPreview, setAvatarPreview] = useState("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    district: "",
    province: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        
        if (!user || !user.id) {
          console.log("No token data, redirecting to login");
          navigate("/login");
          return;
        }
        
        setUserId(user.id);
        
        const response = await getUserById(user.id);
        const userData = response.data;
        setFormData({
          fullName: userData.fullName || "",
          phoneNumber: userData.phoneNumber || "",
          district: userData.district || "",
          province: userData.province || "",
        });
        
        if (userData.avatar) {
          setAvatarPreview(userData.avatar);
        } else if (userData.fullName) {
          setAvatarPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0D8ABC&color=fff&size=200`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        console.error('Error response:', err.response); // Debug
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError(err.response?.data?.message || "Không thể tải thông tin người dùng");
        }
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Vui lòng chọn file ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !userId) return;
    
    setUploadingAvatar(true);
    setError(null);
    
    try {
      const response = await uploadAvatar(userId, avatarFile);
      setAvatarPreview(response.data.avatar || response.data);
      setAvatarFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading avatar', err);
      setError(err.response?.data?.message || "Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      await updateUserInfo(userId, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      console.error('Error updating user', err);
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }
  if (error && !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải thông tin</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={() => navigate("/profile")}
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <FiX size={20} />
            <span>Quay lại</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Hồ Sơ</h1>
          <p className="text-gray-600 mt-2">Cập nhật thông tin cá nhân của bạn</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <FiCheck className="text-green-600" size={20} />
            <p className="text-green-800 font-medium">Cập nhật thông tin thành công!</p>
          </div>
        )}

        {/* Error Message */}
        {error && userId && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-primary to-primary-light p-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 bg-white text-primary p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  title="Thay đổi ảnh đại diện"
                >
                  <FiCamera size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              
              {avatarFile && (
                <button
                  onClick={handleUploadAvatar}
                  disabled={uploadingAvatar}
                  className="mt-4 flex items-center gap-2 bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Đang tải lên...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload size={18} />
                      <span>Tải ảnh lên</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiUser size={18} />
                  Họ và Tên
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiPhone size={18} />
                  Số Điện Thoại
                </label>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Address Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Province */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiMapPin size={18} />
                    Tỉnh / Thành Phố
                  </label>
                  <input
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="Nhập tỉnh/thành phố"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiMapPin size={18} />
                    Quận / Huyện
                  </label>
                  <input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Nhập quận/huyện"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <FiSave size={20} />
                    <span>Lưu Thay Đổi</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate("/profile")}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <FiX size={20} />
                <span>Hủy</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}