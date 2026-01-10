import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "access_token";

/* Lưu access token */
export function saveToken(token, useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  storage.setItem(TOKEN_KEY, token);
}

/* Lấy token */
export function getToken(useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  return storage.getItem(TOKEN_KEY);
}

/* Lấy role từ JWT */
export function getUserRole() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded JWT:", decoded);

    // Spring Security dùng "authorities": ["ROLE_USER", ...]
    if (decoded.authorities) {
      if (Array.isArray(decoded.authorities)) {
        return decoded.authorities[0];
      }
      return decoded.authorities; // Trường hợp là string
    }

    if (decoded.role) return decoded.role;

    if (decoded.roles && Array.isArray(decoded.roles)) {
      return decoded.roles[0];
    }

    return null;
  } catch (err) {
    console.error("JWT decode error:", err);
    return null;
  }
}

// Get user information from JWT
export function getUserInfo() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded JWT:", decoded); // Debug để xem structure
    
    return {
      id: decoded.userId || decoded.sub || decoded.id, // <<<< Lấy userId từ claim
      username: decoded.username,
      email: decoded.email || decoded.username,
      fullName: decoded.fullName || decoded.name,
      phone: decoded.phone,
      address: decoded.address,
      province: decoded.province,
      district: decoded.district,
      dateOfBirth: decoded.dateOfBirth
    };
  } catch (err) {
    console.error("JWT decode error:", err);
    return null;
  }
}

// Logout
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}


/* Xóa token */
export function clearToken(useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  storage.removeItem(TOKEN_KEY);
}

/* Kiểm tra token hết hạn */
export function isTokenExpired(useSession = false) {
  const token = getToken(useSession);
  if (!token) return true;

  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}