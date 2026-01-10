import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api/api';
import styles from './BookingDetailAdmin.module.css'

const BookingDetailAdmin = () => {
    const { bookingCode } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [status, setStatus] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");


    const fetchBooking = async () => {
        try {
            const res = await api.get(`/api/bookings/${bookingCode}`);
            setBooking(res.data);
            setStatus(res.data.status);
            setAdminNotes(res.data.adminNotes || "");
        } catch (err) {
            setMessage("Không thể tải thông tin booking.");
            setMessageType("error");
            console.log(err);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [bookingCode]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage("");
                setMessageType("");
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            await api.put(`/api/bookings/${bookingCode}/status`, { status });
            setMessage("Cập nhật trạng thái thành công!");
            setMessageType("success");
            await fetchBooking();
        } catch {
            setMessage("Cập nhật trạng thái thất bại!");
        }
    };


    const handleUpdateNotes = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            await api.put(`/api/bookings/${bookingCode}/admin-notes`, { adminNotes });
            setMessage("Cập nhật ghi chú thành công!");
            setMessageType("success");
            await fetchBooking();
        } catch {
            setMessage("Cập nhật ghi chú thất bại!");
        }
    };

    if (!booking) return <div>Đang tải...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Chi tiết Booking: {booking.bookingCode}</h2>
            {message && (
                <div className={messageType === "success" ? styles.messageSuccess : styles.messageError}>
                    {message}
                </div>
            )}
            <div className={styles.section}>
                <table className={styles.infoTable}>
                    <tbody>
                        <tr>
                            <th className={styles.label}>Tour</th>
                            <td className={styles.value}>{booking.tourName}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Khách hàng</th>
                            <td className={styles.value}>{booking.userName}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Liên hệ</th>
                            <td className={styles.value}>{booking.contactName} - {booking.contactPhone} - {booking.contactEmail}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Ngày đặt</th>
                            <td className={styles.value}>{booking.bookingDate}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Ngày khởi hành</th>
                            <td className={styles.value}>{booking.departureDate}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Ngày kết thúc</th>
                            <td className={styles.value}>{booking.returnDate}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Trạng thái booking</th>
                            <td>
                                <span className={
                                    booking.status === "CONFIRMED"
                                        ? styles.statusBadge
                                        : booking.status === "CANCELLED"
                                            ? styles.statusCancelled
                                            : styles.statusPending
                                }>
                                    {booking.status === "CONFIRMED"
                                        ? "Đã xác nhận"
                                        : booking.status === "CANCELLED"
                                            ? "Đã hủy"
                                            : "Chờ xác nhận"}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Trạng thái thanh toán</th>
                            <td className={styles.value}>{booking.paymentStatus}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Ghi chú khách hàng</th>
                            <td className={styles.value}>{booking.customerNotes}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Ghi chú admin</th>
                            <td className={styles.value}>{booking.adminNotes}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Giá người lớn</th>
                            <td className={styles.value}>{booking.adultPrice.toLocaleString()} đ</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Giá trẻ em</th>
                            <td className={styles.value}>{booking.childPrice.toLocaleString()} đ</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Phụ phí phòng đơn</th>
                            <td className={styles.value}>{booking.singleRoomSurcharge.toLocaleString()} đ</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Tổng tiền</th>
                            <td className={styles.value}>{booking.totalPrice.toLocaleString()} đ</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Thành tiền</th>
                            <td className={styles.value}>{booking.finalPrice.toLocaleString()} đ</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Số người lớn</th>
                            <td className={styles.value}>{booking.numAdults}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Trẻ em</th>
                            <td className={styles.value}>{booking.numChildren}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Em bé</th>
                            <td className={styles.value}>{booking.numInfants}</td>
                        </tr>
                        <tr>
                            <th className={styles.label}>Số phòng đơn</th>
                            <td className={styles.value}>{booking.numSingleRooms}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={styles.section}>
                <strong>Danh sách khách tham gia:</strong>
                <table className={styles.infoTable}>
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Ngày sinh</th>
                            <th>Giới tính</th>
                            <th>Loại khách</th>
                            <th>Loại phòng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {booking.participants.map(p => (
                            <tr key={p.id}>
                                <td>{p.fullName}</td>
                                <td>{p.dateOfBirth}</td>
                                <td>{p.gender === "MALE" ? "Nam" : "Nữ"}</td>
                                <td>{p.participantType === "ADULT" ? "Người lớn" : p.participantType === "CHILD" ? "Trẻ em" : "Em bé"}</td>
                                <td>{p.roomType === "SINGLE" ? "Phòng đơn" : "Phòng đôi"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <form onSubmit={handleUpdateStatus} className={styles.section}>
                <div className={styles.formRow}>
                    <label className={styles.formLabel}>Chỉnh sửa trạng thái:</label>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className={styles.formSelect}
                    >
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                    <button type="submit" className={styles.formButton}>Lưu trạng thái</button>
                </div>
            </form>
            <form onSubmit={handleUpdateNotes} className={styles.section}>
                <div className={styles.formRow}>
                    <label className={styles.formLabel}>Chỉnh sửa ghi chú admin:</label>
                    <input
                        type="text"
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        className={styles.formInput}
                    />
                    <button type="submit" className={styles.formButton}>Lưu ghi chú</button>
                </div>
            </form>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>← Quay lại</button>
        </div>
    );
}

export default BookingDetailAdmin