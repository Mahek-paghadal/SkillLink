import API from "./authApi";

export const getStudentOverview = () => API.get("/student/overview");
export const getStudentProfile = () => API.get("/student/profile");
export const updateStudentSkills = (skills) => API.patch("/student/profile/skills", { skills });
export const getStudentJobsByCategory = (category) =>
	API.get("/student/jobs", { params: { category } });
