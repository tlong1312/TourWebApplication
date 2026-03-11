import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const { user, logoutContext } = useAuth();
  
  const isLoggedIn = !!user;
  const isHomePage = location.pathname === "/";

  // Handle scroll for transparent header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutContext();
    navigate("/login");
    setIsMenuOpen(false);
  };

  // Transparent on homepage, white on other pages
  const headerClass = isHomePage && !scrolled
    ? "bg-transparent text-white"
    : "bg-white text-gray-900 shadow-md";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-xl font-bold hidden sm:block">Tour Vietnam</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="font-medium hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link to="/tours" className="font-medium hover:text-primary transition-colors">
              Tours
            </Link>
            {isLoggedIn ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 font-medium hover:text-primary transition-colors"
                >
                  <FiUser size={20} />
                  <span>{user?.username || "Tài khoản"}</span>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 text-gray-900">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/booking-history"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      Lịch sử đặt tour
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-red-600"
                    >
                      <FiLogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white text-gray-900 border-t">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="block py-2 font-medium">Trang chủ</Link>
            <Link to="/tours" className="block py-2 font-medium">Tours</Link>
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="block py-2 font-medium">Thông tin cá nhân</Link>
                <Link to="/booking-history" className="block py-2 font-medium">Lịch sử đặt tour</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 font-medium text-red-600">
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-2 font-medium text-primary">Đăng nhập</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}