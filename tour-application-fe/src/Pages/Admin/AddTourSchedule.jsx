import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import styles from "./TourForm.module.css";

const initialFormState = {
  departureDate: "",
  returnDate: "",
  departureTime: "",
  returnTime: "",
  availableSeats: "",
  status: "ACTIVE",
  departureLocation: "",
  returnLocation: "",
};

const AddTourSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [tourName, setTourName] = useState("Đang tải...");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchTourName = async () => {
      if (!id) {
        setTourName("Thiếu Tour ID");
        return;
      }
      try {
        const tourRes = await api.get(`/api/tour/${id}`);
        setTourName(tourRes.data.name || `Tour ID: ${id}`);
      } catch (e) {
        console.error("Lỗi tải tên tour:", e);
        setTourName(`Tour ID (${id}) không tồn tại`);
        setMessage({ type: "error", text: `Không thể tải tên Tour ID: ${id}` });
      }
    };
    fetchTourName();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "availableSeats" ? parseInt(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.departureDate ||
      !formData.returnDate ||
      !formData.departureTime ||
      !formData.returnTime ||
      !formData.availableSeats
    ) {
      setMessage({
        type: "error",
        text: "Vui lòng điền đầy đủ các trường bắt buộc (*).",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Đang tạo lịch trình khởi hành mới..." });

    try {
      const payload = {
        ...formData,
        tourId: parseInt(id),
        availableSeats: parseInt(formData.availableSeats),
      };

      const res = await api.post(`/api/tour-schedules`, payload);

      setMessage({
        type: "success",
        text: `Đã thêm thành công một lịch trình mới (tour ID: ${
          res.data.id || "N/A"
        }) cho ngày ${formData.departureDate}.`,
      });

      setFormData(initialFormState);
      setTimeout(() => {
        navigate(`/admin/tours/detail/${id}`);
      }, 1000);
    } catch (err) {
      console.error("LỖI POST", err.response || err);

      const serverErrorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi không xác định từ Server. Vui lòng kiểm tra Console (F12).";
      // Hiển thị thông báo lỗi
      setMessage({
        type: "error",
        text: serverErrorMessage, // Hiển thị nguyên văn thông báo lỗi từ server
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const isFormValid =
    formData.departureDate &&
    formData.returnDate &&
    formData.departureTime &&
    formData.returnTime &&
    formData.availableSeats > 0;

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleGoBack}>
          &larr; Quay lại
        </button>
        <h2>Thêm Lịch Trình Khởi Hành</h2>
        <p className={styles.subtitle}>
          Tour: <strong>{tourName}</strong> (Tour ID: {id})
        </p>
      </div>

      <div
        className={styles.editFormContainer}
        style={{ borderTop: "none", paddingTop: 0 }}
      >
        <h3
          className={styles.sectionTitle}
          style={{ color: "#059669", marginBottom: "20px" }}
        >
          Điền thông tin lịch trình khởi hành
        </h3>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* MESSAGE BOX */}
          {message.type === "success" && (
            <div className={`${styles.messageBox} ${styles.messageSuccess}`}>
              {message.text}
            </div>
          )}
          {message.type === "error" && (
            <div className={`${styles.messageBox} ${styles.messageError}`}>
              <strong>{message.text} </strong>
            </div>
          )}
          {message.type === "info" && (
            <div className={`${styles.messageBox} ${styles.messageInfo}`}>
              {message.text}
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Thời gian & Địa điểm Khởi hành{" "}
              <span className={styles.required}>*</span>
            </h3>
            <div className={styles.gridTwo}>
              <div className={styles.formGroup}>
                <label>
                  Ngày khởi hành <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  Ngày về <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  Giờ khởi hành <span className={styles.required}>*</span>
                </label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  Giờ về <span className={styles.required}>*</span>
                </label>
                <input
                  type="time"
                  name="returnTime"
                  value={formData.returnTime}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Địa điểm khởi hành</label>
                <input
                  type="text"
                  name="departureLocation"
                  value={formData.departureLocation}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Địa điểm kết thúc</label>
                <input
                  type="text"
                  name="returnLocation"
                  value={formData.returnLocation}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Trạng thái đặt chỗ</h3>
            <div className={styles.gridTwo}>
              <div className={styles.formGroup}>
                <label>
                  Số chỗ trống <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  className={styles.input}
                  required
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* NÚT THAO TÁC */}
          <div
            className={styles.buttonGroup}
            style={{ justifyContent: "flex-end", marginTop: "10px" }}
          >
            <button
              type="submit"
              className={`${styles.submitButton} ${styles.saveButton}`}
              disabled={loading || !isFormValid}
              style={{ width: "100%" }}
            >
              {loading
                ? "Đang thêm Lịch trình..."
                : "Thêm Lịch Trình Khởi Hành Mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTourSchedule;
