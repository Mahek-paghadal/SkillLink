const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const { getStudentOverview } = require("../controllers/student.controllers");

router.get("/overview", protect, allowRoles("student", "admin"), getStudentOverview);

module.exports = router;
