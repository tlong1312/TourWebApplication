import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api/api";
import styles from "./CategoryForm.module.css";

const UpdateCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: null,
    isActive: true,
  });

  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!id) {
        setError("Không tìm thấy ID danh mục để chỉnh sửa.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.get(`/api/categories/${id}`);
        const data = response.data;

        setFormData({
          name: data.name || "",
          description: data.description || "",
          icon: null, // Input file không thể pre-fill file object vì lý do bảo mật
          isActive: data.isActive !== undefined ? data.isActive : true,
        });

        // Nếu có icon cũ, bạn có thể hiển thị tên/url tại đây nếu cần
      } catch (err) {
        console.error("Lỗi tải dữ liệu danh mục:", err);
        setError(
          "Không thể tải dữ liệu danh mục. Vui lòng kiểm tra ID và kết nối."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      isActive: e.target.checked,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      icon: file || null,
    }));
    setFileName(file ? file.name : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description || "");
      if (formData.icon) {
        formPayload.append("icon", formData.icon); // Chỉ gửi file nếu có file mới được chọn
      }
      formPayload.append("isActive", formData.isActive);

      await api.put(`/api/categories/${id}`, formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Cập nhật danh mục thành công!");
      navigate("/admin/categories");
    } catch (err) {
      console.error("Lỗi khi cập nhật danh mục:", err);
      alert(
        `Cập nhật thất bại: ${
          err.response?.data?.message || "Lỗi không xác định."
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim().length >= 2;

  if (loading) {
    return (
      <div className={styles.formContainer} style={{ textAlign: "center" }}>
        Đang tải dữ liệu danh mục...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={styles.formContainer}
        style={{ textAlign: "center", color: "red" }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h2>Chỉnh Sửa Danh Mục</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Tên Danh Mục (*)</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              placeholder="Ví dụ: Du lịch biển, Du lịch văn hóa..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Mô Tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
              placeholder="Mô tả ngắn gọn về danh mục này (Tối đa 500 ký tự)"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="icon">Tải lên Icon Danh Mục (Tùy chọn)</label>
            <input
              type="file"
              id="icon"
              name="icon"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
            />
            {fileName ? (
              <span className={styles.fileName}>
                File mới đã chọn: **{fileName}**
              </span>
            ) : (
              // Thông báo nếu người dùng chưa chọn file mới
              <span className={styles.fileName}>
                Chọn file mới để thay thế icon hiện tại.
              </span>
            )}
          </div>

          <div className={styles.formGroupCheckbox}>
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="isActive">
              Kích hoạt danh mục (**Đang hoạt động**)
            </label>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting
            ? "Đang Cập Nhật..."
            : formData.name.length < 2
            ? "Vui lòng điền Tên Danh Mục (ít nhất 2 ký tự)"
            : "Cập Nhật Danh Mục"}
        </button>
      </form>
    </div>
  );
};

export default UpdateCategory;
