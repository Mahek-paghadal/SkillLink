import API from "./authApi";

export const getJobs = () => API.get("/jobs");
export const applyToJob = (jobId, payload) =>
	API.post(`/jobs/${jobId}/apply`, payload, payload instanceof FormData
		? { headers: { "Content-Type": "multipart/form-data" } }
		: undefined
	);
export const getStudentApplications = () => API.get("/jobs/applications/me");
export const getStudentHistory = () => API.get("/jobs/applications/history");
export const completeApplication = (jobId, applicationId) =>
	API.post(`/jobs/${jobId}/applications/${applicationId}/complete`);
export const archiveStudentApplication = (applicationId) =>
	API.post(`/jobs/applications/${applicationId}/archive`);
export const clearStudentHistory = () => API.post("/jobs/applications/history/clear");

export const getClientJobs = (params) => API.get("/jobs/my", { params });
export const createJob = (payload) => API.post("/jobs", payload);
export const updateJob = (jobId, payload) => API.put(`/jobs/${jobId}`, payload);
export const deleteJob = (jobId) => API.delete(`/jobs/${jobId}`);
export const getApplicants = (jobId) => API.get(`/jobs/${jobId}/applications`);
export const hireApplicant = (jobId, applicationId) => API.post(`/jobs/${jobId}/applications/${applicationId}/hire`);
export const rejectApplicant = (jobId, applicationId) => API.post(`/jobs/${jobId}/applications/${applicationId}/reject`);
export const submitClientReview = (jobId, applicationId, payload) =>
	API.post(`/jobs/${jobId}/applications/${applicationId}/review`, payload);
export const closeJob = (jobId) => API.post(`/jobs/${jobId}/close`);
export const getClientHistory = () => API.get("/jobs/history");
export const archiveClientJob = (jobId) => API.post(`/jobs/${jobId}/archive`);
export const clearClientHistory = () => API.post("/jobs/history/clear");
