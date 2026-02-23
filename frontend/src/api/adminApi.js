import API from "./authApi";

export const getStats = () => API.get("/admin/stats");
export const listUsers = () => API.get("/admin/users");
export const listJobs = () => API.get("/admin/jobs");
export const updateJobStatus = (jobId, status) => API.patch(`/admin/jobs/${jobId}/status`, { status });
export const deleteJob = (jobId) => API.delete(`/admin/jobs/${jobId}`);
export const listApplications = () => API.get("/admin/applications");
export const updateApplicationStatus = (applicationId, status) =>
	API.patch(`/admin/applications/${applicationId}/status`, { status });
export const deleteApplication = (applicationId) => API.delete(`/admin/applications/${applicationId}`);
