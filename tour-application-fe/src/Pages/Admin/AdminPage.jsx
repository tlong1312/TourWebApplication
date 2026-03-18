import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import "./TourAdminPage.css";

const AdminPage = () => {
  const [admin, setAdmin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/users");
      setAdmin(response.data);
    } catch (err) {
      console.error("Lỗi tải danh sách người quản trị:", err);
      setError("Không thể tải danh sách người quản trị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa người quản trị này không? Hành động này không thể hoàn tác!"
      )
    ) {
      try {
        await api.delete(`/api/users/${id}`);
        setAdmin((prevAdmin) => prevAdmin.filter((admin) => admin.id !== id));

        alert("Đã xóa người quản trị thành công!");
        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      } catch (err) {
        console.error("Lỗi khi xóa người quản trị:", err);
        const message =
          err.response?.data?.message ||
          "Xóa thất bại. Có thể người quản trị này đang có dữ liệu liên quan.";
        alert(message);
      }
    }
  };

  const handleEdit = (userId) => {
    navigate(`/admin/update/${userId}`);
  };

  const handleAddAdmin = () => {
    navigate("/admin/add");
  };

  if (loading) {
    return <div className="admin-container">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="tour-admin-container">
      <h1>Quản Lý người dùng</h1>

      {error && <div className="tour-admin-error">{error}</div>}

      <div className="tour-admin-actions">
        <button
          className="tour-admin-button button-primary"
          onClick={handleAddAdmin}
        >
          + Thêm người Quản Trị Mới
        </button>
      </div>

      <table className="tour-admin-table">
        <thead>
          <tr>
            <th className="col-center" style={{ width: "60px" }}>
              ID
            </th>

            <th>Tên Admin</th>

            <th>Email</th>

            <th>Số điện thoại</th>

            <th>Địa chỉ</th>

            <th>Quyền</th>

            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {admin.length === 0 ? (
            <tr>
              <td colSpan="8" className="col-center">
                Chưa có admin nào.
              </td>
            </tr>
          ) : (
            admin.map((admin) => (
              <tr key={admin.id}>
                <td className="col-center">{admin.id}</td>

                <td className="tour-name">{admin.fullName}</td>

                <td>{admin.email}</td>

                <td>{admin.phoneNumber}</td>

                <td>{admin.district}</td>

                <td>
                  <span
                    className={`status-badge ${
                      admin.role === "ADMIN" ? "status-admin" : "status-user"
                    }`}
                  >
                    {admin.role}
                  </span>
                </td>

                <td>
                  <button
                    className="tour-admin-button button-edit"
                    onClick={() => handleEdit(admin.id)}
                  >
                    Sửa
                  </button>
                  <button
                    className="tour-admin-button button-delete"
                    onClick={() => handleDelete(admin.id)}
                  >
                    Xóa
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

export default AdminPage;
