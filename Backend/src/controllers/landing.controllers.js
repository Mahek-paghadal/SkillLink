const JobPick = require("../models/JobPick");
const JobOpportunity = require("../models/JobOpportunity");

exports.getJobPicks = async (req, res) => {
    try {
        const jobs = await JobPick.find().sort({ createdAt: -1 });
        if (jobs.length > 0) {
            return res.status(200).json(jobs);
        }

        const fallback = [
            {
                title: "Home Tutor - Math (Grade 9)",
                company: "Local Parent Network",
                location: "Vesu, Surat",
                employmentType: "Part-time",
                level: "Beginner",
                salary: "₹300/hr",
                tags: ["tutoring", "math", "home"],
            },
            {
                title: "Canva Poster Designer",
                company: "Campus Event Club",
                location: "SVNIT Campus",
                employmentType: "Freelance",
                level: "Intermediate",
                salary: "₹800/poster",
                tags: ["design", "canva", "events"],
            },
            {
                title: "Resume & SOP Editor",
                company: "Career Cell",
                location: "Online",
                employmentType: "Remote",
                level: "Intermediate",
                salary: "₹500/doc",
                tags: ["writing", "editing", "resume"],
            },
            {
                title: "Laptop Setup Assistance",
                company: "Neighborhood Store",
                location: "Citylight, Surat",
                employmentType: "On-site",
                level: "Beginner",
                salary: "₹400/task",
                tags: ["tech", "setup", "support"],
            },
        ];

        return res.status(200).json(fallback);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch job picks" });
    }
};

exports.createJobPick = async (req, res) => {
    try {
        const job = await JobPick.create(req.body);
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: "Failed to create job pick" });
    }
};

exports.getJobOpportunities = async (req, res) => {
    try {
        const jobs = await JobOpportunity.find().sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch job opportunities" });
    }
};

exports.createJobOpportunity = async (req, res) => {
    try {
        const job = await JobOpportunity.create(req.body);
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: "Failed to create job opportunity" });
    }
};
