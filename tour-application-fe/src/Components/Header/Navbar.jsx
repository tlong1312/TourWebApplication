import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Navbar.module.css'; // Import styles object

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      {/* Logo dẫn về trang chủ */}
      <Link to="/" className={styles.brand}>
        TourAdmin.
      </Link>

      <ul className={styles.navMenu}>
        <li className={styles.navItem}>
          {/* Quản lý Tour */}
          <NavLink
            to="/admin/tours"
            /* Logic kiểm tra active với CSS Modules */
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Quản lý Tour
          </NavLink>
        </li>

        <li className={styles.navItem}>
          {/* Quản lý Danh mục */}
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Quản lý Danh mục
          </NavLink>
        </li>

        <li className={styles.navItem}>
          {/* Quản lý Người dùng */}
          <NavLink
            to="/admin/users"
            end /* Đã thêm 'end' để chỉ active khi URL chính xác là /admin */
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Quản lý Người dùng
          </NavLink>
        </li>

        <li className={styles.navItem}>
          {/* Quản lý Booking */}
          <NavLink
            to="/admin/bookings"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Quản lý Booking
          </NavLink>
        </li>
        <li className={styles.navItem}>
          <NavLink
            to="/admin/statistics"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Thống kê
          </NavLink>
        </li>

      </ul>
    </nav>
  );
};

export default Navbar;