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

const UpdateTourSchedule = () => {
  const { tourId, scheduleId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!scheduleId) return;

      try {
        const res = await api.get(`/api/tour-schedules/${scheduleId}`);
        const data = res.data;

        setFormData({
          departureDate: data.departureDate || "",
          returnDate: data.returnDate || "",
          departureTime: data.departureTime || "",
          returnTime: data.returnTime || "",
          availableSeats:
            data.availableSeats !== undefined ? data.availableSeats : "",
          status: data.status || "ACTIVE",
          departureLocation: data.departureLocation || "",
          returnLocation: data.returnLocation || "",
        });
        setDataFetched(true);
      } catch (e) {
        console.error("Lỗi tải dữ liệu lịch trình:", e);
        setMessage({
          type: "error",
          text: `Không thể tải dữ liệu lịch trình ID: ${scheduleId}.`,
        });
      }
    };
    fetchScheduleData();
  }, [scheduleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "availableSeats"
          ? value === ""
            ? ""
            : parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.departureDate ||
      !formData.returnDate ||
      !formData.departureTime ||
      !formData.returnTime ||
      formData.availableSeats === ""
    ) {
      setMessage({
        type: "error",
        text: "Vui lòng điền đầy đủ các trường bắt buộc (*).",
      });
      return;
    }

    setLoading(true);
    setMessage({
      type: "info",
      text: `Đang cập nhật Lịch trình ID: ${scheduleId}...`,
    });

    try {
      const payload = {
        ...formData,
        tourId: parseInt(tourId),
        availableSeats: parseInt(formData.availableSeats),
      };

      await api.put(`/api/tour-schedules/${scheduleId}`, payload);

      setMessage({
        type: "success",
        text: `Đã cập nhật thành công Lịch trình ID: ${scheduleId}.`,
      });
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      console.error("LỖI CẬP NHẬT:", err.response || err);

      const serverErrorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Lỗi không xác định từ Server.";

      setMessage({
        type: "error",
        text: serverErrorMessage,
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
    formData.availableSeats !== "" &&
    parseInt(formData.availableSeats) >= 0;

  if (!dataFetched && scheduleId) {
    return (
      <div
        className={styles.formContainer}
        style={{ textAlign: "center", padding: "20px" }}
      >
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleGoBack}>
          &larr; Quay lại
        </button>
        <h2>Chỉnh Sửa Lịch Trình Khởi Hành</h2>
        <p className={styles.subtitle}>
          Lịch trình ID: <strong>{scheduleId}</strong>
        </p>
      </div>

      <div
        className={styles.editFormContainer}
        style={{ borderTop: "none", paddingTop: 0 }}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* MESSAGE BOX */}
          {message.type === "success" && (
            <div className={`${styles.messageBox} ${styles.messageSuccess}`}>
              {message.text}
            </div>
          )}
          {message.type === "error" && (
            <div className={`${styles.messageBox} ${styles.messageError}`}>
              <strong>Lỗi API: </strong> {message.text}
            </div>
          )}
          {message.type === "info" && (
            <div className={`${styles.messageBox} ${styles.messageInfo}`}>
              {message.text}
            </div>
          )}

          {/* THỜI GIAN KHỞI HÀNH VÀ KẾT THÚC */}
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

          {/* CHỖ NGỒI VÀ TRẠNG THÁI */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Chỗ ngồi & Trạng thái</h3>
            <div className={styles.gridTwo}>
              <div className={styles.formGroup}>
                <label>
                  Số chỗ trống còn lại{" "}
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  className={styles.input}
                  required
                  min="0"
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
              {loading ? "Đang cập nhật..." : "Lưu Thay Đổi Lịch Trình"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTourSchedule;
