import axios from "axios";
import { getToken, clearToken, saveToken } from "./tokenService";

const hostname = window.location.hostname;
const protocol = window.location.protocol;

const API_URL = (hostname === "localhost" || hostname === "127.0.0.1")
  ? "http://localhost:8080"
  : `${protocol}//${hostname}`;
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    }else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url == '/login' || originalRequest.url === '/refresh') {
      return Promise.reject(error);
    }

    if(error.response?.status === 401 && !originalRequest._retry) {
      if(isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try{
        const rs = await api.post('/refresh')

        const newAccessToken = rs.data.access_token;
        saveToken(newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return api(originalRequest);
      }catch (_error) {
        processQueue(_error, null);
        clearToken();
        window.location.href = "/login";
        return Promise.reject(_error);
      }finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
