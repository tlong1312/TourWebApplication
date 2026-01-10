import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import "./TourAdminPage.css";

const CategoriesAdminPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Lỗi tải danh sách danh mục:", err);
      setError("Không thể tải danh sách danh mục. Vui lòng kiểm tra kết nối.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác!"
      )
    ) {
      try {
        await api.delete(`/api/categories/${id}`);

        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== id)
        );

        alert("Đã xóa danh mục thành công!");
      } catch (err) {
        console.error("Lỗi khi xóa danh mục:", err);
        const message =
          err.response?.data?.message ||
          "Xóa thất bại. Có thể danh mục này đang có dữ liệu liên quan.";
        alert(message);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/categories/update/${id}`);
  };

  const handleAddCategory = () => {
    navigate("/admin/categories/add");
  };

  if (loading) {
    return <div className="tour-admin-container">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="tour-admin-container">
      <h1>Quản Lý Danh mục</h1>

      {error && <div className="tour-admin-error">{error}</div>}

      <div className="tour-admin-actions">
        <button
          className="tour-admin-button button-primary"
          onClick={handleAddCategory}
        >
          + Thêm Danh Mục
        </button>
      </div>

      <table className="tour-admin-table">
        <thead>
          <tr>
            <th className="col-center" style={{ width: "60px" }}>
              ID
            </th>

            <th>Tên Danh mục</th>

            <th>Mô tả</th>

            <th>Trạng thái</th>

            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="7" className="col-center">
                Chưa có danh mục nào.
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id}>
                <td className="col-center">{category.id}</td>

                <td className="tour-name">{category.name}</td>

                <td className="tour-price">{category.description}</td>

                <td>
                  <span
                    className={`status-badge ${
                      category.isActive ? "status-active" : "status-draft"
                    }`}
                  >
                    {category.isActive ? "Kích hoạt" : "Chưa kích hoạt"}
                  </span>
                </td>

                <td>
                  <button
                    className="tour-admin-button button-edit"
                    onClick={() => handleEdit(category.id)}
                  >
                    Sửa
                  </button>
                  <button
                    className="tour-admin-button button-delete"
                    onClick={() => handleDelete(category.id)}
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
export default CategoriesAdminPage;
