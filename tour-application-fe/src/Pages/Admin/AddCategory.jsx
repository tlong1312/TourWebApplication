import React, { useState } from "react";
import api from "../../utils/api/api";
import styles from "./CategoryForm.module.css";
import Alert from "../../Components/Alert/Alert";
import { useNavigate } from "react-router-dom";

const initialState = {
  name: "",
  description: "",
  isActive: true,
};

const AddCategory = () => {
  const [formData, setFormData] = useState(initialState);
  const [selectedIcon, setSelectedIcon] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedIcon(e.target.files[0]);
    } else {
      setSelectedIcon(null);
    }
  };
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Tên danh mục không được để trống");
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError("Tên danh mục phải ít nhất 2 ký tự");
      return false;
    }

    if (formData.name.trim().length > 100) {
      setError("Tên danh mục không được vượt quá 100 ký tự");
      return false;
    }

    if (formData.description.trim().length > 500) {
      setError("Mô tả không được vượt quá 500 ký tự");
      return false;
    }
    if (selectedIcon && selectedIcon.size > 5 * 1024 * 1024) {
      setError("Dung lượng file không được vượt quá 5MB");
      return false;
    }

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (selectedIcon && !validImageTypes.includes(selectedIcon.type)) {
      setError("Chỉ hỗ trợ các định dạng: JPEG, PNG, GIF, WebP");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const categoryData = new FormData();
    categoryData.append("name", formData.name.trim());
    categoryData.append("description", formData.description.trim());
    categoryData.append("isActive", formData.isActive);
    if (selectedIcon) {
      categoryData.append("icon", selectedIcon);
    }

    try {
      await api.post("/api/categories", categoryData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Thêm danh mục thành công!");

      setTimeout(() => {
        navigate("/admin/categories");
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi thêm danh mục:", err);

      let errorMessage = "Thêm danh mục thất bại. Vui lòng thử lại.";

      if (err.response) {
        const status = err.response.status;
        const serverMsg =
          err.response.data?.message || err.response.data?.error || "";
        if (status === 409) {
          errorMessage = serverMsg || "Tên danh mục đã tồn tại";
        }
        else if (serverMsg) {
          errorMessage = serverMsg;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Thêm Danh Mục Mới</h2>

      {error && (
        <Alert message={error} type="error" onClose={() => setError(null)} />
      )}
      {success && (
        <Alert
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset className={styles.fieldGroup}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Tên Danh Mục (*)</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: Tour biển..."
              maxLength="100"
            />
            <small>{formData.name.length}/100</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Mô tả ngắn..."
              maxLength="500"
            ></textarea>
            <small>{formData.description.length}/500</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="icon">Thêm hình ảnh</label>
            <input
              type="file"
              id="icon"
              name="icon"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
            />
            {selectedIcon && (
              <span className={styles.fileName}>
                {selectedIcon.name} ({(selectedIcon.size / 1024).toFixed(2)} KB)
              </span>
            )}
          </div>

          <div className={styles.formGroupCheckbox}>
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label htmlFor="isActive">Kích hoạt</label>
          </div>
        </fieldset>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu Danh Mục"}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
