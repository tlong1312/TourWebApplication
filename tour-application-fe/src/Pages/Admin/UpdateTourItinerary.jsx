import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import styles from "./TourForm.module.css";

const initialFormState = {
  dayNumber: "",
  title: "",
  description: "",
  activities: "",
  meals: "",
  accommodation: "",
};

const UpdateTourItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [itineraryList, setItineraryList] = useState([]);
  const [selectedItinId, setSelectedItinId] = useState(null);

  const [formData, setFormData] = useState(initialFormState);
  const [tourName, setTourName] = useState("Đang tải...");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchItineraries = async () => {
    if (!id) return;
    setMessage({ type: "", text: "Đang tải dữ liệu..." });

    try {
      const listRes = await api.get(`/api/tour-itinerary/of_tour/${id}`, {
        params: { tourId: id },
      });

      const rawList = Array.isArray(listRes.data)
        ? listRes.data
        : listRes.data.data || [];
      const sortedList = rawList.sort((a, b) => a.dayNumber - b.dayNumber);
      setItineraryList(sortedList);

      if (sortedList.length > 0) {
        if (
          !selectedItinId ||
          !sortedList.some((item) => item.id === selectedItinId)
        ) {
          fillFormData(sortedList[0]);
        } else {
          const currentItem = sortedList.find(
            (item) => item.id === selectedItinId
          );
          if (currentItem) fillFormData(currentItem);
        }
      } else {
        setMessage({ type: "info", text: "Tour này chưa có lịch trình nào." });
        setSelectedItinId(null);
        setFormData(initialFormState);
      }
    } catch (err) {
      console.error("Lỗi TẢI DỮ LIỆU:", err);
      setMessage({
        type: "error",
        text: `Lỗi kết nối API. Vui lòng kiểm tra lại endpoint: '/api/tour-itinerary/of_tour/${id}'`,
      });
    }
  };

  useEffect(() => {
    const fetchTourName = async () => {
      if (!id) return;
      try {
        const tourRes = await api.get(`/api/tour/${id}`);
        setTourName(tourRes.data.name || "Tour không tên");
      } catch (e) {
        setTourName("Không tìm thấy tên Tour", e);
      }
    };

    fetchTourName();
    fetchItineraries();
  }, [id]);

  const fillFormData = (itinData) => {
    setSelectedItinId(itinData.id);
    setFormData({
      dayNumber: itinData.dayNumber,
      title: itinData.title,
      description: itinData.description || "",
      activities: itinData.activities || "",
      meals: itinData.meals || "",
      accommodation: itinData.accommodation || "",
    });
    setMessage({ type: "", text: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dayNumber" ? parseInt(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItinId) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put(`/api/tour-itinerary/${selectedItinId}`, {
        ...formData,
        tourId: id,
      });

      setMessage({
        type: "success",
        text: `Đã lưu cập nhật cho Ngày ${formData.dayNumber} (ID: ${selectedItinId})`,
      });

      setItineraryList((prevList) =>
        prevList.map((item) =>
          item.id === selectedItinId ? { ...item, ...formData } : item
        )
      );
    } catch (err) {
      console.error("Lỗi lưu:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Lỗi khi cập nhật.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !selectedItinId ||
      !window.confirm(
        `Bạn có chắc chắn muốn xóa Lịch trình Ngày ${formData.dayNumber} (ID: ${selectedItinId}) không?`
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.delete(`/api/tour-itinerary/${selectedItinId}`);

      setMessage({
        type: "success",
        text: `Đã xóa thành công Lịch trình Ngày ${formData.dayNumber}!`,
      });

      const newList = itineraryList.filter(
        (item) => item.id !== selectedItinId
      );
      setItineraryList(newList);

      if (newList.length > 0) {
        fillFormData(newList[0]);
      } else {
        setSelectedItinId(null);
        setFormData(initialFormState);
      }
    } catch (err) {
      console.error("Lỗi xóa:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Lỗi khi xóa lịch trình.",
      });
    } finally {
      setLoading(false);
    }
  };
  const getMessageClass = () => {
    switch (message.type) {
      case "success":
        return styles.messageSuccess;
      case "error":
        return styles.messageError;
      case "info":
        return styles.messageInfo;
      default:
        return "";
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          &larr; Quay lại
        </button>
        <h2>Cập Nhật Lịch Trình Tour</h2>
        <p className={styles.subtitle}>
          Tour: <strong>{tourName}</strong> (Tour ID: {id})
        </p>
      </div>

      {/* --- PHẦN HIỂN THỊ DANH SÁCH CÁC ID LỊCH TRÌNH ĐÃ LỌC --- */}
      <div className={styles.itinerarySelectionContainer}>
        <h4 className={styles.itineraryListTitle}>
          Danh sách các ngày đã được lọc theo Tour ID = {id}:
          <h3>Chọn ngày chỉnh sửa</h3>
        </h4>

        {message.type &&
          message.type !== "success" &&
          message.type !== "error" && (
            <div className={getMessageClass()}>{message.text}</div>
          )}

        <div className={styles.itineraryList}>
          {itineraryList.length === 0 && message.type !== "error" && (
            <p>Chưa có lịch trình nào được tìm thấy cho Tour này.</p>
          )}

          {itineraryList.map((itin) => (
            <div
              key={itin.id}
              onClick={() => fillFormData(itin)}
              className={`${styles.itineraryItem} ${
                selectedItinId === itin.id ? styles.itineraryItemSelected : ""
              }`}
            >
              <div className={styles.itemDayNumber}>Ngày {itin.dayNumber}</div>
              <div className={styles.itemItinId}>
                ID Lịch Trình: <strong>{itin.id}</strong>
              </div>
              <div className={styles.itemTitle}>{itin.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form chỉnh sửa */}
      <div className={styles.editFormContainer}>
        <h3 className={styles.sectionTitle}>
          {selectedItinId
            ? `Đang sửa: Ngày ${formData.dayNumber} (ID: ${selectedItinId})`
            : "Chọn một ngày để chỉnh sửa"}
        </h3>

        {selectedItinId && (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Message box cho Save/Delete */}
            {(message.type === "success" || message.type === "error") && (
              <div className={`${styles.messageBox} ${getMessageClass()}`}>
                {message.text}
              </div>
            )}

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>
              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label>
                    Số thứ tự Ngày <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="dayNumber"
                    value={formData.dayNumber}
                    onChange={handleChange}
                    className={styles.input}
                    required
                    min="1"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    Tiêu đề ngày <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả chi tiết</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows="4"
                />
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Hoạt động và Dịch vụ</h3>
              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label>Hoạt động</label>
                  <input
                    type="text"
                    name="activities"
                    value={formData.activities}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ăn uống</label>
                  <input
                    type="text"
                    name="meals"
                    value={formData.meals}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.spanTwo}`}>
                  <label>Nghỉ đêm</label>
                  <input
                    type="text"
                    name="accommodation"
                    value={formData.accommodation}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Phần nút nhấn, dùng class mới cho layout */}
            <div className={styles.buttonGroup}>
              {/* Nút XÓA */}
              <button
                type="button"
                onClick={handleDelete}
                className={`${styles.submitButton} ${styles.deleteButton}`}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Xóa Ngày này"}
              </button>

              {/* Nút LƯU */}
              <button
                type="submit"
                className={`${styles.submitButton} ${styles.saveButton}`}
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateTourItinerary;
