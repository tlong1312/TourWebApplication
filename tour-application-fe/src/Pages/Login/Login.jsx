import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api/api";
import { saveToken, getUserRole } from "../../utils/api/tokenService";
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import TermsOfService from "./TermsOfService";
import { useAuth } from "../../contexts/AuthContext";

const GOOGLE_CLIENT_ID = "963385142006-q9rq41egr2tnp5vjrmbl8cqpj9jgeqca.apps.googleusercontent.com";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showTerms, setShowTerms] = useState(false);
  const successMessage = location.state?.successMessage;
  const { loginContext } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/login", { email, password });
      const data = res.data;

      if (data.access_token) {
        loginContext(data.access_token);

        const role = getUserRole();
        if (role === "ROLE_ADMIN") {
          navigate("/admin/tours");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Sai thông tin đăng nhập.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/oauth2/redirect", {
        token: response.credential,
      });

      const data = res.data;

      if (data.access_token) {
        saveToken(data.access_token);
        const role = getUserRole();

        if (role === "ROLE_ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        setError(data.message || "Sai thông tin đăng nhập.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.response?.data?.message || "Đăng nhập Google thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-light p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiLock className="text-primary" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Đăng Nhập</h1>
            <p className="text-white/80">Chào mừng bạn trở lại!</p>
          </div>

          {/* Body */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiMail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiLock size={18} />
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Success Alert (from Register) */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <FiCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-green-800 font-medium">Thành công</p>
                    <p className="text-green-700 text-sm">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-800 font-medium">Đăng nhập thất bại</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  "Đăng Nhập"
                )}
              </button>
            </form>

            {/* Google Login (commented out) */}
            {/* <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập với</span>
                </div>
              </div>
              <div id="googleSignInDiv" className="mt-4"></div>
            </div> */}

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <button
            onClick={() => setShowTerms(true)}
            className="text-primary hover:underline"
          >
            Điều khoản dịch vụ
          </button>
        </p>
        <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)}></TermsOfService>
      </div>
    </div>
  );
}