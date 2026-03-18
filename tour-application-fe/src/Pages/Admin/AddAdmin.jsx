import React, { useState } from "react";
import api from "../../utils/api/api";
import styles from "./TourForm.module.css";
import Alert from "../../Components/Alert/Alert";
import { useNavigate } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
  fullName: "",
  phoneNumber: "",

  province: "",
  district: "",
  role: "ADMIN",
  avatar: "",
};

const AddAdmin = () => {
  const [formData, setFormData] = useState(initialState);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

    if (!formData.fullName.trim()) return "Họ và tên không được để trống";
    if (!formData.email.trim() || !emailRegex.test(formData.email))
      return "Email không đúng định dạng";
    if (formData.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    if (formData.phoneNumber.trim() && !phoneRegex.test(formData.phoneNumber))
      return "Số điện thoại không hợp lệ";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validateMsg = validateForm();
    if (validateMsg) {
      setError(validateMsg);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        province: formData.province || null,
        district: formData.district || null,
        role: formData.role,
        avatar: formData.avatar || null,
      };

      await api.post("/api/users/admin", userData);

      setSuccess("Thêm Admin/Người dùng thành công!");
      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);
      setFormData(initialState);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Lỗi khi thêm Admin/Người dùng:", err);
      const msg =
        err.response?.data?.message ||
        "Thêm thất bại. Vui lòng kiểm tra lại dữ liệu.";
      setError(msg);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Thêm Admin mới</h2>

      {error && (
        <Alert message={error} type="error" onClose={() => setError(null)} />
      )}
      {success && (
        <Alert
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* --- PHẦN 1: THÔNG TIN CÁ NHÂN & TÀI KHOẢN --- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>1. Thông tin tài khoản</h3>

          {/* Email và Mật khẩu */}
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Email (*)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="VD: admin@example.com"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Mật khẩu (*)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ít nhất 6 ký tự"
                required
                minLength="6"
              />
            </div>
          </div>

          {/* Họ tên và Điện thoại */}
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Họ và tên (*)</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Số điện thoại</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="0901234567 hoặc +84..."
              />
            </div>
          </div>

          {/* Vai trò */}
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Phân quyền</label>
              <div name="role" value={formData.role} onChange={handleChange}>
                <input
                  type="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={true}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Ảnh đại diện (URL)</label>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="URL ảnh đại diện (Tùy chọn)"
              />
            </div>
          </div>
        </div>

        {/* --- PHẦN 2: ĐỊA CHỈ (Tùy chọn) --- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>2. Địa chỉ</h3>
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Tỉnh/Thành phố</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Quận/Huyện</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu Người Dùng Mới"}
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;
