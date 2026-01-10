import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import styles from "./TourForm.module.css";
import Alert from "../../Components/Alert/Alert";

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

const UpdateAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [adminData, setAdminData] = useState(null);
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!id) {
        setError("Thiếu ID người dùng trong URL.");
        setInitialLoading(false);
        return;
      }

      try {
        const res = await api.get(`/api/users/${id}`);
        const data = res.data;

        setAdminData(data);
        setFormData({
          email: data.email || "",
          password: "",
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          province: data.province || "",
          district: data.district || "",
          role: data.role || "ADMIN",
          avatar: data.avatar || "",
        });
      } catch (e) {
        console.error("Lỗi tải dữ liệu Admin:", e);
        setError(
          `Không thể tải dữ liệu người dùng ID: ${id}. Vui lòng kiểm tra API.`
        );
      } finally {
        setInitialLoading(false);
      }
    };
    fetchAdminData();
  }, [id]);

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

    if (formData.password.length > 0 && formData.password.length < 6)
      return "Mật khẩu (nếu nhập) phải có ít nhất 6 ký tự";

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
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        province: formData.province || null,
        district: formData.district || null,
        role: formData.role,
        avatar: formData.avatar || null,
      };

      if (formData.password.length >= 6) {
        userData.password = formData.password;
      }

      await api.put(`/api/users/${id}`, userData);

      setSuccess(`Cập nhật Admin/Người dùng với id là ${id} thành công!`);
      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);

      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Lỗi khi cập nhật Admin/Người dùng:", err);
      const msg =
        err.response?.data?.message ||
        "Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.";
      setError(msg);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div
        className={styles.formContainer}
        style={{ textAlign: "center", padding: "40px" }}
      >
        <h2 style={{ color: styles["--color-primary"] || "#4f46e5" }}>
          Đang tải dữ liệu người dùng...
        </h2>
      </div>
    );
  }

  if (!adminData && !initialLoading) {
    return (
      <div
        className={styles.formContainer}
        style={{ textAlign: "center", padding: "40px" }}
      >
        <h2 style={{ color: "#ef4444" }}>Không tìm thấy người dùng ID: {id}</h2>
        <button
          className={styles.submitButton}
          onClick={() => navigate("/admin/users")}
          style={{ marginTop: "20px" }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h2>Cập Nhật Thông Tin Người Dùng </h2>
      <h3>ID Người Dùng: {id}</h3>

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
                required
                disabled={true}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Mật khẩu (Để trống nếu không thay đổi)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ít nhất 6 ký tự (Tùy chọn)"
                minLength="0"
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
              <label>Vai trò (Role)</label>
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
          {loading ? "Đang lưu thay đổi..." : "Lưu Thay Đổi"}
        </button>
      </form>
    </div>
  );
};

export default UpdateAdmin;
