import API from "./authApi";

export const getNotifications = (params) => API.get("/notifications", { params });
export const markNotificationRead = (notificationId) =>
    API.post(`/notifications/${notificationId}/read`);
export const markAllNotificationsRead = () => API.post("/notifications/read-all");
