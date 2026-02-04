const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const {
    listJobs,
    createJob,
    updateJob,
    deleteJob,
    getClientJobs,
    getApplicants,
    getStudentApplications,
    getStudentHistory,
    archiveStudentApplication,
    clearStudentHistory,
    applyForJob,
    hireApplicant,
    completeApplication,
    rejectApplicant,
    closeJob,
    getClientHistory,
    archiveClientJob,
    clearClientHistory,
} = require("../controllers/job.controllers");

const resumesDir = path.join(__dirname, "..", "..", "uploads", "resumes");
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(resumesDir, { recursive: true });
        cb(null, resumesDir);
    },
    filename: (req, file, cb) => {
        const safeExt = path.extname(file.originalname || "").toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
});

const resumeUpload = multer({
    storage: resumeStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", protect, allowRoles("student", "client"), listJobs);
router.get("/applications/me", protect, allowRoles("student"), getStudentApplications);
router.get("/applications/history", protect, allowRoles("student"), getStudentHistory);
router.post("/applications/history/clear", protect, allowRoles("student"), clearStudentHistory);
router.post("/applications/:applicationId/archive", protect, allowRoles("student"), archiveStudentApplication);
router.post("/", protect, allowRoles("client"), createJob);
router.get("/my", protect, allowRoles("client"), getClientJobs);
router.get("/history", protect, allowRoles("client"), getClientHistory);
router.post("/history/clear", protect, allowRoles("client"), clearClientHistory);
router.put("/:jobId", protect, allowRoles("client"), updateJob);
router.post("/:jobId/close", protect, allowRoles("client"), closeJob);
router.post("/:jobId/archive", protect, allowRoles("client"), archiveClientJob);
router.delete("/:jobId", protect, allowRoles("client"), deleteJob);
router.get("/:jobId/applications", protect, allowRoles("client"), getApplicants);
router.post(
    "/:jobId/apply",
    protect,
    allowRoles("student"),
    resumeUpload.single("resume"),
    applyForJob
);
router.post("/:jobId/applications/:applicationId/hire", protect, allowRoles("client"), hireApplicant);
router.post("/:jobId/applications/:applicationId/complete", protect, allowRoles("student"), completeApplication);
router.post("/:jobId/applications/:applicationId/reject", protect, allowRoles("client"), rejectApplicant);

module.exports = router;
