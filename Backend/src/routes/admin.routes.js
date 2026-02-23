const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const {
	listUsers,
	getStats,
	listJobs,
	updateJobStatus,
	deleteJob,
	listApplications,
	updateApplicationStatus,
	deleteApplication,
} = require("../controllers/admin.controllers");
 
router.get("/users", protect, allowRoles("admin"), listUsers);
router.get("/stats", protect, allowRoles("admin"), getStats);
router.get("/jobs", protect, allowRoles("admin"), listJobs);
router.patch("/jobs/:jobId/status", protect, allowRoles("admin"), updateJobStatus);
router.delete("/jobs/:jobId", protect, allowRoles("admin"), deleteJob);
router.get("/applications", protect, allowRoles("admin"), listApplications);
router.patch("/applications/:applicationId/status", protect, allowRoles("admin"), updateApplicationStatus);
router.delete("/applications/:applicationId", protect, allowRoles("admin"), deleteApplication);


module.exports = router;