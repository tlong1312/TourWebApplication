import api from "./api";
export const getUserById = (userId) => api.get(`/api/users/${userId}`);

export const updateUserInfo = (userid, data) =>
    api.put(`/api/users/${userid}`, data);

export const changePassword = (userId, data) =>
    api.put(`/api/users/${userId}/password`, data);

export const uploadAvatar = (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/users/${userId}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
export const getUserHistory = () => api.get(`/api/bookings/my-bookings`);
export const getCategories = () => api.get("/api/categories");
export const getTours = (params) => api.get("/api/tour", { params });
export const getTourById = (tourId) => api.get(`/api/tour/${tourId}`);

export const createTour = (data) =>
    api.post("/api/tour", data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const getTourImages = () => api.get("/api/tour-images");

export const getTourImagesByTourId = (tourId) => api.get(`/api/tour-images/${tourId}`);

export const uploadTourImage = (data) =>
    api.post("/api/tour-images/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const getItinerary = () => api.get("/api/tour-itinerary");

export const createItinerary = (data) =>
    api.post("/api/tour-itinerary", data);
export const getToursByCategory = (categoryId) =>
    api.get(`/api/categories/${categoryId}/tours`);
export const chatbot = (message, userId) => api.post("/api/chatbot/chat", 
{
    message, userId 
});
export const searchTours = (params) =>
    api.get("/api/tour/search", { params });
export const filterByPriceRange = (min, max) =>
    api.get(`/api/tour/filter/price-range?min=${min}&max=${max}`);
export const filterByDuration = (days) =>
    api.get(`/api/tour/filter/duration?days=${days}`);
export const handleVNPayReturn = (params) =>
  api.get("/api/bookings/vnpay-return", { params })
