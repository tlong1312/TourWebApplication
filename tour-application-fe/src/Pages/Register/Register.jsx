import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import * as tokenService from "../../utils/api/tokenService";
import axios from "axios";
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import TermsOfService from "../Login/TermsOfService";

export default function Register({ onSuccess }) {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    provinceCode: "",
    provinceName: "",
    districtCode: "",
    districtName: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách tỉnh/thành", err);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    const selected = provinces.find((p) => p.code === Number(provinceCode));
    const provinceName = selected?.name || "";

    setFormData((prev) => ({
      ...prev,
      provinceCode,
      provinceName,
      districtCode: "",
      districtName: "",
    }));

    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      setDistricts(res.data.districts);
    } catch (err) {
      console.error("Lỗi lấy danh sách quận/huyện", err);
      setDistricts([]);
    }
  };

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    const selected = districts.find((d) => d.code === Number(districtCode));
    const districtName = selected?.name || "";

    setFormData((prev) => ({
      ...prev,
      districtCode,
      districtName,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (
    !formData.fullName ||
    !formData.email ||
    !formData.phoneNumber ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.provinceCode ||
    !formData.districtCode
  ) {
    setError("Vui lòng điền đầy đủ thông tin");
    setLoading(false);
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError("Mật khẩu xác nhận không khớp");
    setLoading(false);
    return;
  }

  try {
    const res = await api.post("/register", {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      province: formData.provinceName,
      district: formData.districtName,
    });

    // Check status code 200 or 201 = success
    if (res.status === 200 || res.status === 201) {
      // Registration successful, redirect to login
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/login", { 
          state: { successMessage: "Đăng ký thành công! Vui lòng đăng nhập." } 
        });
      }
    } else {
      setError(res.data?.message || "Đăng ký thất bại");
    }
  } catch (err) {
    console.error("Lỗi đăng ký", err);
    const errorData = err.response?.data;
    let errorMsg = "Đăng ký thất bại";
    if (errorData) {
      if (typeof errorData === "string") {
        errorMsg = errorData;
      } else if (errorData.message) {
        errorMsg = errorData.message;
      } else {
        errorMsg = Object.values(errorData).join(", ");
      }
    }
    setError(errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiUser className="text-purple-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Đăng Ký</h1>
            <p className="text-white/80">Tạo tài khoản mới của bạn</p>
          </div>

          {/* Body */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiUser size={18} />
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiMail size={18} />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiPhone size={18} />
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    placeholder="0987654321"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiLock size={18} />
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiLock size={18} />
                    Nhập lại mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Province & District */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiMapPin size={18} />
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.provinceCode}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FiMapPin size={18} />
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.districtCode}
                    onChange={handleDistrictChange}
                    disabled={!formData.provinceCode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-800 font-medium">Đăng ký thất bại</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  "Đăng Ký"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
              </div>

              {/* Additional Info */}
              <p className="text-center text-gray-500 text-sm mt-6">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <button
                      onClick={() => setShowTerms(true)}
                      className="text-purple-600 hover:underline"
                  >
                      Điều khoản dịch vụ
                  </button>
              </p>
              <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
      </div>
    </div>
  );
}
