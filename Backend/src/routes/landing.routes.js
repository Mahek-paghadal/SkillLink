const express = require("express");
const {
    getJobPicks,
    createJobPick,
    getJobOpportunities,
    createJobOpportunity,
} = require("../controllers/landing.controllers");

const router = express.Router();

router.get("/job-picks", getJobPicks);
router.post("/job-picks", createJobPick);
router.get("/job-opportunities", getJobOpportunities);
router.post("/job-opportunities", createJobOpportunity);

module.exports = router;
