import API from "./authApi";

export const getStudentOverview = () => API.get("/student/overview");
