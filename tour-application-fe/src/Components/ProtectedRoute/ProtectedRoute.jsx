import { Navigate } from "react-router-dom";
import * as tokenService from "../../utils/api/tokenService";

export default function ProtectedRoute({ element }) {
  const token = tokenService.getToken();
  const isTokenExpired = tokenService.isTokenExpired();

  // Nếu không có token hoặc token hết hạn, redirect về login
  if (!token || isTokenExpired) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token hợp lệ, cho phép truy cập
  return element;
}
