import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import styles from "./TourForm.module.css";

const initialFormState = {
  dayNumber: 1,
  title: "",
  description: "",
  activities: "",
  meals: "",
  accommodation: "",
};

const AddTourItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tourName, setTourName] = useState("Đang tải...");

  useEffect(() => {
    const fetchTourName = async () => {
      try {
        const response = await api.get(`/api/tour/${id}`);
        setTourName(response.data.name);
      } catch (err) {
        console.error("Lỗi tải tên tour:", err);
        setTourName(`Tour ID: ${id}`);
      }
    };
    fetchTourName();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dayNumber" ? parseInt(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const requestData = {
      ...formData,
      tourId: parseInt(id),
    };

    try {
      await api.post("/api/tour-itinerary", requestData);

      setSuccess("Thêm lịch trình chi tiết thành công!");
      setFormData(initialFormState); // Reset form

      setTimeout(() => {
        navigate(`/admin/tours/detail/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi thêm lịch trình:", err);
      setError(
        "Lỗi khi thêm lịch trình: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header} style={{ marginBottom: "30px" }}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "15px",
            padding: "10px 15px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#f8f8f8",
          }}
        >
          &larr; Quay lại
        </button>
        <h2 className={styles.sectionTitle}>Thêm Lịch Trình Chi Tiết Tour</h2>
        <p className={styles.subtitle} style={{ color: "#6b7280" }}>
          Tạo lịch trình cho Tour: <strong>{tourName}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div
            className={styles.errorMessage}
            style={{
              padding: "10px",
              backgroundColor: "#fecaca",
              color: "#dc2626",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className={styles.successMessage}
            style={{
              padding: "10px",
              backgroundColor: "#d1fae5",
              color: "#059669",
              borderRadius: "6px",
            }}
          >
            {success}
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>

          <div className={styles.formGroup}>
            <label htmlFor="dayNumber" className={styles.label}>
              Ngày thứ mấy trong Tour{" "}
              <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="number"
              id="dayNumber"
              name="dayNumber"
              value={formData.dayNumber}
              onChange={handleChange}
              className={styles.input}
              min="1"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Tiêu đề Ngày <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.input}
              placeholder="Ví dụ: Khởi hành Hà Nội - Hạ Long, thăm Vịnh"
              required
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Nội dung chi tiết</h3>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Mô tả chi tiết
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              rows="4"
              placeholder="Mô tả chi tiết các hoạt động, cảnh quan sẽ thăm quan trong ngày..."
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Hoạt động và Dịch vụ</h3>

          <div className={styles.formGroup}>
            <label htmlFor="activities" className={styles.label}>
              Hoạt động (Activities)
            </label>
            <input
              type="text"
              id="activities"
              name="activities"
              value={formData.activities}
              onChange={handleChange}
              className={styles.input}
              placeholder="Ví dụ: Chèo thuyền kayak, Tắm biển"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="meals" className={styles.label}>
              Ăn uống (Meals)
            </label>
            <input
              type="text"
              id="meals"
              name="meals"
              value={formData.meals}
              onChange={handleChange}
              className={styles.input}
              placeholder="Ví dụ: Sáng, Trưa, Tối (Đã bao gồm trong tour)"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="accommodation" className={styles.label}>
              Nghỉ đêm (Accommodation)
            </label>
            <input
              type="text"
              id="accommodation"
              name="accommodation"
              value={formData.accommodation}
              onChange={handleChange}
              className={styles.input}
              placeholder="Ví dụ: Khách sạn 4 sao, Du thuyền ngủ đêm"
            />
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Đang gửi..." : "Thêm Lịch Trình Chi Tiết"}
        </button>
      </form>
    </div>
  );
};

export default AddTourItinerary;
