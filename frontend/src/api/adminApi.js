import API from "./authApi";

export const getStats = () => API.get("/admin/stats");
export const listUsers = () => API.get("/admin/users");
