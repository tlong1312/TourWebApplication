import React, { useState, useEffect } from "react";
import api from "../../utils/api/api";
import styles from "./TourForm.module.css";
import Alert from "../../Components/Alert/Alert";
import { useNavigate } from "react-router-dom";

const initialState = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  location: "",
  price: "",
  duration: 1,
  availableSeats: 10,
  startDate: "",
  endDate: "",
  status: "active",
  featured: "No",

  adultPrice: "",
  childPrice: 0,
  infantPrice: 0,
  singleRoomSurcharge: 0,
  departurePoint: "",
  returnPoint: "",
};

const AddTour = () => {
  const [formData, setFormData] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories");
        const data = response.data;
        setCategories(data);

        // Tự động chọn category đầu tiên nếu có
        if (data && data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
        setError("Không thể tải danh sách danh mục.");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const validateForm = () => {
    if (!formData.name.trim()) return "Tên tour không được để trống";

    if (!formData.categoryId) return "Vui lòng chọn danh mục";

    if (!formData.price || Number(formData.price) <= 0)
      return "Giá gốc phải lớn hơn 0";

    if (!formData.duration || Number(formData.duration) <= 0)
      return "Thời gian (ngày) phải lớn hơn 0";

    if (formData.adultPrice === "" || Number(formData.adultPrice) < 0)
      return "Giá người lớn không hợp lệ";

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) return "Ngày kết thúc không được nhỏ hơn ngày bắt đầu";
    }

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

    const tourData = new FormData();

    tourData.append("categoryId", formData.categoryId);
    tourData.append("name", formData.name.trim());
    tourData.append("price", formData.price);
    tourData.append("duration", formData.duration);
    tourData.append("adultPrice", formData.adultPrice);

    tourData.append("slug", formData.slug || "");
    tourData.append("description", formData.description || "");
    tourData.append("location", formData.location || "");
    tourData.append("status", formData.status);
    tourData.append("featured", formData.featured);
    tourData.append("departurePoint", formData.departurePoint || "");
    tourData.append("returnPoint", formData.returnPoint || "");

    tourData.append("availableSeats", formData.availableSeats || 0);
    tourData.append("childPrice", formData.childPrice || 0);
    tourData.append("infantPrice", formData.infantPrice || 0);
    tourData.append("singleRoomSurcharge", formData.singleRoomSurcharge || 0);

    if (formData.startDate) tourData.append("startDate", formData.startDate);
    if (formData.endDate) tourData.append("endDate", formData.endDate);

    selectedFiles.forEach((file) => {
      tourData.append("images", file);
    });

    try {
      await api.post("/api/tour", tourData, {
        headers: {},
      });

      setSuccess("Thêm tour thành công!");

      // Reset Form
      setFormData(initialState);
      setSelectedFiles([]);
      e.target.querySelector('input[type="file"]').value = "";

      // Reset lại category mặc định
      if (categories.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
      }

      window.scrollTo(0, 0);

      setTimeout(() => navigate("/admin/tours"), 1500);
    } catch (err) {
      console.error("Lỗi khi thêm tour:", err);
      const msg =
        err.response?.data?.message ||
        "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại dữ liệu.";
      setError(msg);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Thêm Tour Mới</h2>

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
        {/* --- PHẦN 1: THÔNG TIN CHUNG --- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>1. Thông tin chung</h3>
          <div className={styles.formGroup}>
            <label>Tên Tour (*)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên tour..."
              required
            />
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Danh mục (*)</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Slug (URL)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="Để trống tự động tạo"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>
        </div>

        {/* --- PHẦN 2: LỊCH TRÌNH & ĐỊA ĐIỂM --- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>2. Lịch trình & Địa điểm</h3>
          <div className={styles.gridThree}>
            <div className={styles.formGroup}>
              <label>Điểm khởi hành</label>
              <input
                type="text"
                name="departurePoint"
                value={formData.departurePoint}
                onChange={handleChange}
                placeholder="Hà Nội, TP.HCM..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>Điểm đến (Location)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Đà Nẵng, Phú Quốc..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>Điểm trở về</label>
              <input
                type="text"
                name="returnPoint"
                value={formData.returnPoint}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.gridThree}>
            <div className={styles.formGroup}>
              <label>Số ngày (*)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Ngày đi</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Ngày về</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* --- PHẦN 3: GIÁ (BIGDECIMAL) & CHỖ NGỒI --- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>3. Giá vé & Chỗ ngồi</h3>
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Giá gốc (Hiển thị) (*)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="VNĐ"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Số chỗ mở bán</label>
              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className={styles.gridFour}>
            <div className={styles.formGroup}>
              <label>Giá người lớn (*)</label>
              <input
                type="number"
                name="adultPrice"
                value={formData.adultPrice}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Giá trẻ em</label>
              <input
                type="number"
                name="childPrice"
                value={formData.childPrice}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Giá trẻ nhỏ</label>
              <input
                type="number"
                name="infantPrice"
                value={formData.infantPrice}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phụ thu phòng đơn</label>
              <input
                type="number"
                name="singleRoomSurcharge"
                value={formData.singleRoomSurcharge}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* --- PHẦN 4: CẤU HÌNH & HÌNH ẢNH --- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>4. Hình ảnh & Trạng thái</h3>

          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Kích hoạt</option>       
                <option value="inactive">Chưa kích hoạt</option> 
                <option value="draft">Nháp</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Nổi bật</label>
              <select
                name="featured"
                value={formData.featured}
                onChange={handleChange}
              >
                <option value="No">Không</option>
                <option value="Yes">Có</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu Tour Mới"}
        </button>
      </form>
    </div>
  );
};

export default AddTour;
