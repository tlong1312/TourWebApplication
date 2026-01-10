import { Link } from "react-router-dom";
import { FiFacebook, FiTwitter, FiLinkedin, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Về Chúng Tôi</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ứng dụng đặt tour du lịch hàng đầu Việt Nam với các tour trong nước và quốc tế chất lượng cao.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-primary transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/tours" className="text-sm hover:text-primary transition-colors">
                  Tour du lịch
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm hover:text-primary transition-colors">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-primary transition-colors">
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Liên Hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <FiMail className="text-primary flex-shrink-0" size={16} />
                <a href="mailto:info@tourapp.com" className="hover:text-primary transition-colors">
                  info@tourapp.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <FiPhone className="text-primary flex-shrink-0" size={16} />
                <a href="tel:+84123456789" className="hover:text-primary transition-colors">
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <FiMapPin className="text-primary flex-shrink-0 mt-0.5" size={16} />
                <span>TP Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Theo Dõi Chúng Tôi</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} Tour Vietnam. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
              Điều khoản dịch vụ
            </Link>
            <Link to="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}