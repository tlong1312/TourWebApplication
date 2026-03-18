import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import "./TourAdminPage.css";

const TourAdminPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingStats, setBookingStats] = useState({});

  const navigate = useNavigate();

  const fetchBookingStats = async (tourId) => {
    try {
      const response = await api.get(`/api/tour/${tourId}/booking-stats`);
      return response.data;
    } catch (err) {
      console.error(`Lỗi tải thống kê tour ${tourId}:`, err);
      return { available: "Lỗi" };
    }
  };

  const fetchToursAndStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/tour");
      const fetchedTours = response.data;
      setTours(fetchedTours);
      const statsPromises = fetchedTours.map((tour) =>
        fetchBookingStats(tour.id).then((stats) => ({ id: tour.id, stats }))
      );

      const results = await Promise.all(statsPromises);
      const newBookingStats = results.reduce((acc, current) => {
        acc[current.id] = current.stats;
        return acc;
      }, {});

      setBookingStats(newBookingStats);
    } catch (err) {
      console.error("Lỗi tải danh sách tour hoặc thống kê:", err);
      setError("Không thể tải danh sách tour. Vui lòng kiểm tra kết nối.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToursAndStats();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tour này không? Hành động này không thể hoàn tác!"
      )
    ) {
      try {
        await api.delete(`/api/tour/${id}`);

        setTours((prevTours) => prevTours.filter((tour) => tour.id !== id));

        alert("Đã xóa tour thành công!");
        setTimeout(() => {
          navigate("/admin/tours");
        }, 1500);
      } catch (err) {
        console.error("Lỗi khi xóa tour:", err);
        const message =
          err.response?.data?.message ||
          "Xóa thất bại. Có thể tour này đang có dữ liệu liên quan.";
        alert(message);
      }
    }
  };

  const handleEdit = (tourId) => {
    navigate(`/admin/tours/update/${tourId}`);
  };

  const handleShowDetail = (tourId) => {
    navigate(`/admin/tours/detail/${tourId}`);
  };

  const handleAddTour = () => {
    navigate("/admin/tours/add");
  };

  if (loading) {
    return <div className="tour-admin-container">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="tour-admin-container">
      <h1>Quản Lý Tour Du Lịch</h1>

      {error && <div className="tour-admin-error">{error}</div>}

      <div className="tour-admin-actions">
        <button
          className="tour-admin-button button-primary"
          onClick={handleAddTour}
        >
          + Thêm Tour Mới
        </button>
      </div>

      <table className="tour-admin-table">
        <thead>
          <tr>
            <th className="col-center" style={{ width: "10px" }}>
              ID
            </th>

            <th>Tên Tour</th>

            <th>Thời gian</th>

            <th>Danh mục</th>

            <th>Giá gốc</th>

            <th>Lượt đăng ký</th>

            <th>Trạng thái</th>

            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {tours.length === 0 ? (
            <tr>
              <td colSpan="8" className="col-center">
                Chưa có tour nào.
              </td>
            </tr>
          ) : (
            tours.map((tour) => (
              <tr key={tour.id}>
                <td className="col-center">{tour.id}</td>

                <td className="tour-name">{tour.name}</td>

                <td>{tour.duration} ngày</td>

                <td>
                  {tour.categoryName ? (
                    <span className="category-tag">{tour.categoryName}</span>
                  ) : (
                    <span className="text-danger">Không có</span>
                  )}
                </td>

                <td className="tour-price">
                  {tour.price ? tour.price.toLocaleString("vi-VN") : 0} ₫
                </td>

                <td className="col-center">
                  {bookingStats[tour.id]?.booked !== undefined &&
                  bookingStats[tour.id]?.booked !== "Lỗi"
                    ? bookingStats[tour.id].booked
                    : bookingStats[tour.id]?.booked === "Lỗi"
                    ? "Lỗi"
                    : "..."}
                  /{tour.availableSeats}
                </td>

                <td>
                  <span
                    className={`status-badge ${
                      tour.status === "active"
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {tour.status === "active" ? "kích hoạt" : "Chưa kích hoạt"}
                  </span>
                </td>

                <td>
                  <button
                    className="tour-admin-button button-edit"
                    onClick={() => handleEdit(tour.id)}
                  >
                    Sửa
                  </button>
                  <button
                    className="tour-admin-button button-delete"
                    onClick={() => handleDelete(tour.id)}
                  >
                    Xóa
                  </button>

                  <button
                    className="tour-admin-button button-detail"
                    onClick={() => handleShowDetail(tour.id)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TourAdminPage;