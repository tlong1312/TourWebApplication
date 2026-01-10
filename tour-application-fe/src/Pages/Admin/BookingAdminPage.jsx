import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api/api';
import "./BookingAdminPage.css"

const BookingAdminPage = () => {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get("/api/bookings/all");
                setBookings(res.data);
            } catch (err) {
                setError("Không thể tải danh sách booking.");
                console.log("Không thể tải danh sách booking: " + err)
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleDelete = async (bookingCode) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa booking này?")) {
            try {
                await api.delete(`/api/bookings/${bookingCode}`);
                setBookings((prev) => prev.filter((b) => b.bookingCode !== bookingCode));
                alert("Xóa booking thành công!");
            } catch (err) {
                alert("Xóa booking thất bại!");
                console.log("Xóa thất bại: " + err);
            }
        }
    };


    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>{error}</div>;

    return (
    <div className="booking-admin-container">
      <h1>Quản Lý Booking</h1>
      <table className="booking-admin-table">
        <thead>
          <tr>
            <th>Mã Booking</th>
            <th>Tour</th>
            <th>Khách hàng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.bookingCode}>
              <td>{b.bookingCode}</td>
              <td>{b.tourName}</td>
              <td>{b.userName}</td>
              <td>
                <span className={
                  `status-badge ${
                    b.status === "CONFIRMED"
                      ? "status-confirmed"
                      : b.status === "CANCELLED"
                      ? "status-cancelled"
                      : "status-pending"
                  }`
                }>
                  {b.status === "CONFIRMED"
                    ? "Đã xác nhận"
                    : b.status === "CANCELLED"
                    ? "Đã hủy"
                    : "Chờ xác nhận"}
                </span>
              </td>
              <td>
                <button
                  className="booking-admin-button button-detail"
                  onClick={() => navigate(`/admin/bookings/detail/${b.bookingCode}`)}
                >
                  Xem chi tiết
                </button>
                <button
                  className="booking-admin-button button-delete"
                  onClick={() => handleDelete(b.bookingCode)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BookingAdminPage