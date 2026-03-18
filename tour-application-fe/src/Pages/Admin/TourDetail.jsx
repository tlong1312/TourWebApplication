import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import styles from "./TourDetail.module.css";

const TourDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [imageStatus, setImageStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchTourDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const tourInfoPromise = api.get(`/api/tour/${id}`);
        const itineraryPromise = api.get(`/api/tour-itinerary/of_tour/${id}`);
        const schedulePromise = api.get(`/api/tour-schedules/tour/${id}/all`);
        const imagesPromise = api.get(`/api/tour-images/of_tour/${id}`);
        const [tourInfoResponse, itineraryResponse, scheduleResponse, imagesResponse] =
          await Promise.all([
            tourInfoPromise,
            itineraryPromise,
            schedulePromise,
            imagesPromise,
          ]);
        setTour({
          ...tourInfoResponse.data,
          itineraries: itineraryResponse.data,
          schedules: scheduleResponse.data,
        });
        setImages(imagesResponse.data);
        console.log("Images data:", imagesResponse.data); // Thêm dòng này
      } catch (err) {
        console.error("Lỗi tải chi tiết tour:", err);
        if (err.response && err.response.status === 404) {
          setError("Không tìm thấy Tour với ID này.");
        } else {
          setError(
            "Không thể tải toàn bộ thông tin tour. Vui lòng kiểm tra kết nối API."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [id]);

  useEffect(() => {
    if (imageStatus.message) {
      const timer = setTimeout(() => {
        setImageStatus({ type: "", message: "" });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [imageStatus]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleAddItinerary = () => {
    navigate(`/admin/tours/${id}/itinerary/add`);
  };
  const handleUpdateItinerary = () => {
    navigate(`/admin/tours/${id}/itinerary/update`);
  };
  const handleAddSchedule = () => {
    navigate(`/admin/tours/${id}/schedules/add`);
  };
  const handleUpdateSchedule = (scheduleId) => {
    navigate(`/admin/tours/${id}/schedules/update/${scheduleId}`);
  };
  const handleDeleteSchedule = async (scheduleIdToDelete) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa lịch này không? Hành động này không thể hoàn tác!"
      )
    ) {
      try {
        await api.delete(`/api/tour-schedules/${scheduleIdToDelete}`);

        setTour((prevTour) => ({
          ...prevTour,
          schedules: prevTour.schedules.filter(
            (schedule) => schedule.id !== scheduleIdToDelete
          ),
        }));

        alert("Đã xóa lịch thành công!");
      } catch (err) {
        console.error("Lỗi khi xóa lịch:", err);
        const message =
          err.response?.data?.message ||
          "Xóa thất bại. Có thể tour này đang có dữ liệu liên quan.";
        alert(message);
      }
    }
  };

  if (loading)
    return <div className={styles.loadingContainer}>Đang tải dữ liệu...</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;
  if (!tour) return null;

  return (
    <div className={styles.container}>
      {/* --- PHẦN 1: HEADER INFO (Đang dùng Placeholder) --- */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          &larr; Quay lại
        </button>

        <div className={styles.titleSection}>
          <h1 className={styles.tourName}>{tour.name}</h1>
          <div className={styles.priceTag}>
            Giá gốc: {formatCurrency(tour.price)}
          </div>
        </div>

        <div className={styles.metaInfo}>
          <span>🆔 Mã Tour: {tour.id}</span>
          <span>📍 {tour.location}</span>
          <span>⏳ Hành trình: {tour.duration} ngày</span>
          {/* Hiển thị ảnh nếu có */}
          {/* {tour.images && tour.images.length > 0 && (
                        <div className={styles.bannerImage}>
                             <img src={tour.images[0]} alt={tour.name} />
                        </div>
                    )} */}
        </div>

        <div>
          <h3>Giới thiệu</h3>
          <p>{tour.description}</p>
        </div>
      </div>

      {/* --- PHẦN 2: TABS NAVIGATION --- */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === "itinerary" ? styles.active : ""
              }`}
            onClick={() => setActiveTab("itinerary")}
          >
            🗺️ Lịch trình chi tiết
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "schedule" ? styles.active : ""
              }`}
            onClick={() => setActiveTab("schedule")}
          >
            📅 Lịch khởi hành & Đặt chỗ
          </button>

          {/* {activeTab === "schedule" && (
            <button
              className={`${styles.actionBtn} ${styles.addButton}`}
              style={{ marginLeft: "auto", marginBlockStart: "20px" }}
              onClick={handleAddSchedule}
            >
              + Thêm Lịch
            </button>
          )} */}
          <button
            className={`${styles.tabBtn} ${activeTab === "images" ? styles.active : ""}`}
            onClick={() => setActiveTab("images")}
          >
            🖼️ Hình ảnh tour
          </button>
        </div>
        {activeTab === "schedule" && (
          <div style={{ marginTop: "16px", marginBottom: "20px" }}>
            <button
              className={`${styles.actionBtn} ${styles.addButton}`}
              onClick={handleAddSchedule}
            >
              + Thêm Lịch
            </button>
          </div>
        )}
      </div>

      <div className={styles.contentSection}>
        {/* === TAB 1: HIỂN THỊ ITINERARY === */}
        {activeTab === "itinerary" && (
          <div className={styles.itineraryList}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <button
                className={`${styles.actionBtn} ${styles.addButton}`}
                onClick={handleAddItinerary}
              >
                + Thêm Lịch Trình
              </button>
              <button
                className={`${styles.actionBtn} ${styles.editButton}`}
                onClick={handleUpdateItinerary}
              >
                + Sửa Lịch Trình
              </button>
            </div>
            {tour.itineraries && tour.itineraries.length > 0 ? (
              tour.itineraries.map((item) => (
                <div key={item.id} className={styles.itineraryItem}>
                  <div className={styles.dayBadge}>Ngày {item.dayNumber}</div>
                  <div className={styles.dayContent}>
                    <h3 className={styles.dayTitle}>{item.title}</h3>
                    <p className={styles.dayDesc}>{item.description}</p>

                    <div className={styles.detailsGrid}>
                      {item.activities && (
                        <div className={styles.detailRow}>
                          <strong>🏃 Hoạt động:</strong> {item.activities}
                        </div>
                      )}
                      {item.meals && (
                        <div className={styles.detailRow}>
                          <strong>🍽️ Ăn uống:</strong> {item.meals}
                        </div>
                      )}
                      {item.accommodation && (
                        <div className={styles.detailRow}>
                          <strong>🏨 Nghỉ đêm:</strong> {item.accommodation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>Chưa có thông tin lịch trình.</p>
            )}
          </div>
        )}

        {/* === TAB 2: HIỂN THỊ SCHEDULE === */}
        {activeTab === "schedule" && (
          <div className={styles.scheduleList}>
            {tour.schedules && tour.schedules.length > 0 ? (
              <table className={styles.scheduleTable}>
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Khởi hành</th>
                    <th>Kết thúc</th>
                    <th>Điểm đón</th>
                    <th>Điểm trả</th>
                    <th>Chỗ trống</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {tour.schedules.map((sch) => (
                    <tr key={sch.id}>
                      <td>
                        <div>{sch.id}</div>
                      </td>
                      <td>
                        <div className={styles.dateHighlight}>
                          {formatDate(sch.departureDate)}
                        </div>
                        <small>{sch.departureTime}</small>
                      </td>
                      <td>
                        <div>{formatDate(sch.returnDate)}</div>
                        <small>{sch.returnTime}</small>
                      </td>
                      <td>{sch.departureLocation}</td>
                      <td>{sch.returnLocation}</td>
                      <td>
                        <span
                          className={
                            sch.availableSeats > 0
                              ? styles.seatsOk
                              : styles.seatsFull
                          }
                        >
                          {sch.availableSeats} vé
                        </span>
                      </td>
                      <td>
                        <button
                          className={`${styles.schBtn} ${styles.editButton}`}
                          onClick={() => handleUpdateSchedule(sch.id)}
                        >
                          Sửa
                        </button>

                        <button
                          className={`${styles.schBtn} ${styles.deleteButton}`}
                          onClick={() => handleDeleteSchedule(sch.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.emptyText}>
                Hiện chưa có lịch khởi hành cho tour này.
              </p>
            )}
          </div>
        )}

        {/* === TAB 3: HIỂN THỊ HÌNH ẢNH === */}
        {activeTab === "images" && (
          <div className={styles.imagesSection}>
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="tour-image-upload" className={styles.uploadLabel}>
                📤 Thêm hình ảnh
              </label>
              <input
                id="tour-image-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const validTypes = ["image/jpeg", "image/png"];
                  if (!validTypes.includes(file.type)) {
                    setImageStatus({ type: "error", message: "Chỉ chấp nhận ảnh JPEG hoặc PNG!" });
                    return;
                  }
                  const formData = new FormData();
                  formData.append("image", file);
                  formData.append("tourId", id);
                  formData.append("isPrimary", true);
                  formData.append("displayOrder", images.length + 1);
                  try {
                    await api.post("/api/tour-images/upload", formData, {
                      headers: { "Content-Type": "multipart/form-data" },
                    });
                    const res = await api.get(`/api/tour-images/of_tour/${id}`);
                    setImages(res.data);
                    setImageStatus({ type: "success", message: "Thêm hình ảnh thành công!" });
                  } catch (err) {
                    setImageStatus({ type: "error", message: "Thêm hình ảnh thất bại!" });
                    console.log('Lỗi thêm hình ảnh: ' + err);
                  }
                }}
              />
              {imageStatus.message && (
                <div
                  className={
                    imageStatus.type === "success"
                      ? styles.statusSuccess
                      : styles.statusError
                  }
                  style={{ marginTop: "8px" }}
                >
                  {imageStatus.message}
                </div>
              )}
            </div>
            <div className={styles.imagesGrid}>
              {images.length > 0 ? (
                images.map((img) => (
                  <div key={img.id} className={styles.imageItem}>
                    <img src={img.imageUrl} alt={`Tour ${id}`} className={styles.tourImage} />
                    <button
                      className={styles.deleteButton}
                      onClick={async () => {
                        if (window.confirm("Xóa hình ảnh này?")) {
                          try {
                            await api.delete(`/api/tour-images/${img.id}`);
                            setImages((prev) => prev.filter((i) => i.id !== img.id));
                            setImageStatus({ type: "success", message: "Xóa hình ảnh thành công!" });
                          } catch (err) {
                            setImageStatus({ type: "error", message: "Xóa hình ảnh thất bại!" });
                            console.log('Lỗi xóa hình ảnh: ' + err);
                          }
                        }
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                ))
              ) : (
                <p>Chưa có hình ảnh cho tour này.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourDetailAdmin;
