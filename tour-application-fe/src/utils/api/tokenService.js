import { jwtDecode } from "jwt-decode";

let inMemoryToken = null;

export function saveToken(token) {
  inMemoryToken = token;
}

export function getToken() {
  return inMemoryToken;
}

export function clearToken() {
  inMemoryToken = null;
}

export function getUserRole() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    if (decoded.authorities) { 
      return decoded.authorities.split(',')[0].trim();
    }
    return null;
  } catch (err) {
    console.error("JWT decode error:", err);
    return null;
  }
}

export function getUserInfo() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    
    return {
      id: decoded.userId || decoded.sub || decoded.id, 
      username: decoded.username,
    };
  } catch (err) {
    console.error("JWT decode error:", err);
    return null;
  }
}
