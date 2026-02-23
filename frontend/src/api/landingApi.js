import API from "./authApi";

export const getJobPicks = () => API.get("/landing/job-picks");
export const addJobPick = (data) => API.post("/landing/job-picks", data);

export const getJobOpportunities = () => API.get("/landing/job-opportunities");
export const addJobOpportunity = (data) => API.post("/landing/job-opportunities", data);
