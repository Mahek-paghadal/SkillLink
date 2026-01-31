const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const {
	getStudentOverview,
	getStudentProfile,
	updateStudentSkills,
	getJobsByCategory,
} = require("../controllers/student.controllers");

router.get("/overview", protect, allowRoles("student"), getStudentOverview);
router.get("/profile", protect, allowRoles("student"), getStudentProfile);
router.patch("/profile/skills", protect, allowRoles("student"), updateStudentSkills);
router.get("/jobs", protect, allowRoles("student"), getJobsByCategory);

module.exports = router;
