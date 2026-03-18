import { Navigate } from "react-router-dom";
import * as tokenService from "../../utils/api/tokenService";

export default function ProtectedRoute({ element }) {
  const token = tokenService.getToken();
  const isTokenExpired = tokenService.isTokenExpired();
  if (!token || isTokenExpired) {
    return <Navigate to="/login" replace />;
  }
  return element;
}
