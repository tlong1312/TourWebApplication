import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import styles from "./TourForm.module.css";
import Alert from "../../Components/Alert/Alert";
// import { format } from "date-fns"; // Thư viện giúp format ngày tháng

const initialTourData = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  location: "",
  price: 0,
  duration: 0,
  availableSeats: 0,
  startDate: "",
  endDate: "",
  status: "DRAFT",
  featured: "false",
  adultPrice: 0,
  childPrice: 0,
  infantPrice: 0,
  singleRoomSurcharge: 0,
  departurePoint: "",
  returnPoint: "",
  // Không cần images ở đây vì sẽ xử lý riêng
};

const UpdateTour = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialTourData);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchTourAndCategories = async () => {
      try {
        const catRes = await api.get("/api/categories");
        setCategories(catRes.data);
        

        const tourRes = await api.get(`/api/tour/${id}`);
        const tourData = tourRes.data;

        setFormData({
          categoryId: tourData.category?.id || "",
          name: tourData.name || "",
          slug: tourData.slug || "",
          description: tourData.description || "",
          location: tourData.location || "",
          price: tourData.price || 0,
          duration: tourData.duration || 0,
          availableSeats: tourData.availableSeats || 0,
          startDate: tourData.startDate || "",
          endDate: tourData.endDate || "",
          status: tourData.status || "DRAFT",
          featured: tourData.featured ? "true" : "false",
          adultPrice: tourData.adultPrice || 0,
          childPrice: tourData.childPrice || 0,
          infantPrice: tourData.infantPrice || 0,
          singleRoomSurcharge: tourData.singleRoomSurcharge || 0,
          departurePoint: tourData.departurePoint || "",
          returnPoint: tourData.returnPoint || "",
        });
      
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
        setError("Không thể tải dữ liệu Tour hoặc Danh mục.");
      } finally {
        setFetching(false);
      }
    };

    fetchTourAndCategories();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;

    if (type === "number") {
      finalValue = value === "" ? "" : parseFloat(value);
    } else if (type === "checkbox") {
      finalValue = checked ? "true" : "false";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Tên tour không được để trống";
    if (!formData.categoryId) return "Danh mục (Category) không được để trống";
    if (formData.price <= 0) return "Giá phải lớn hơn 0";
    if (formData.duration <= 0) return "Thời gian (duration) phải lớn hơn 0";
    if (formData.adultPrice < 0) return "Giá người lớn không được âm";

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

    // 1. Gửi các trường dữ liệu Text/Number/Date
    for (const key in formData) {
      // Không gửi các trường không phải String/Number qua FormData nếu là null/empty
      if (
        formData[key] !== null &&
        formData[key] !== undefined &&
        formData[key] !== ""
      ) {
        tourData.append(key, formData[key]);
      }
    }

    try {
      await api.put(`/api/tour/${id}`, tourData, {
        headers: {},
      });

      setSuccess(`Cập nhật Tour ${formData.name} thành công!`);
      window.scrollTo(0, 0);
      setTimeout(() => navigate("/admin/tours"), 1500);
    } catch (err) {
      console.error("Lỗi khi cập nhật Tour:", err);
      const msg =
        err.response?.data?.message ||
        "Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.";
      setError(msg);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className={styles.formContainer} style={{ textAlign: "center" }}>
        Đang tải dữ liệu Tour...
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h2>Chỉnh Sửa Tour</h2>

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
        {/* --- PHẦN 1: THÔNG TIN CƠ BẢN --- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>1. Thông tin Tour Cơ bản</h3>

          {/* Tên Tour và Danh mục */}
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Tên Tour (*)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Danh mục (*)</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">--- Chọn Danh mục ---</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slug và Location */}
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Slug (URL thân thiện)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="tour-da-nang-4-ngay"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Địa điểm (Location)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Mô tả Tour</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>

        {/* --- PHẦN 2: GIÁ & THỜI GIAN --- */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>2. Chi tiết Giá và Thời gian</h3>

          {/* Giá cơ bản, Thời lượng, Số chỗ */}
          <div className={styles.gridThree}>
            <div className={styles.formGroup}>
              <label>Giá Cơ bản (*)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Thời lượng (ngày) (*)</label>
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
              <label>Số chỗ (Available Seats)</label>
              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* Các loại giá chi tiết (THÊM MỚI) */}
          <div className={styles.gridFour}>
            <div className={styles.formGroup}>
              <label>Giá người lớn (*)</label>
              <input
                type="number"
                name="adultPrice"
                value={formData.adultPrice}
                onChange={handleChange}
                min="0"
                required
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

          {/* Ngày khởi hành và kết thúc */}
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Ngày khởi hành</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Ngày kết thúc</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Điểm khởi hành và kết thúc */}
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Điểm khởi hành</label>
              <input
                type="text"
                name="departurePoint"
                value={formData.departurePoint}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Điểm đến (Return Point)</label>
              <input
                type="text"
                name="returnPoint"
                value={formData.returnPoint}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Status và Featured */}
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label>Trạng thái (Status)</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="inactive">Chưa kích hoạt</option>
                <option value="active">Kích hoạt</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ alignSelf: "flex-end" }}>
              <div
                className={styles.formGroupCheckbox}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured === "true"}
                  onChange={handleChange}
                  style={{ width: "auto", height: "18px", margin: "0" }}
                />
                <label
                  htmlFor="featured"
                  style={{ marginBottom: "0", fontWeight: "normal" }}
                >
                  Tour Nổi bật (Featured)
                </label>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || fetching}
        >
          {loading ? "Đang cập nhật..." : "Lưu Thay Đổi Tour"}
        </button>
      </form>
    </div>
  );
};

export default UpdateTour;
