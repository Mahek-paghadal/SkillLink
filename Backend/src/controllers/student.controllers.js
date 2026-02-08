const User = require("../models/User");
const Student = require("../models/Student");
const Job = require("../models/Job");
const JobPick = require("../models/JobPick");
const JobOpportunity = require("../models/JobOpportunity");
const { getContentRecommendations } = require("../services/recommendation.service");

const fallbackRecommendations = [
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

const getProfileCompletion = (user, studentProfile) => {
    let score = 30;
    if (user?.name) score += 20;
    if (user?.email) score += 20;
    if (user?.profileImage) score += 20;
    if (studentProfile?.skills?.length) score += 10;
    return Math.min(score, 100);
};

const categoryJobs = [
    {
        key: "academic-educational",
        title: "Academic & Educational Services",
        jobs: [
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
                title: "Online Doubt Solver",
                company: "Campus Study Group",
                location: "Remote",
                employmentType: "Remote",
                level: "Intermediate",
                salary: "₹250/hr",
                tags: ["academics", "online", "support"],
            },
            {
                title: "Exam Prep Assistant",
                company: "Local Coaching Center",
                location: "Athwa, Surat",
                employmentType: "Part-time",
                level: "Beginner",
                salary: "₹400/session",
                tags: ["exam", "prep", "guidance"],
            },
            {
                title: "Language Tutor - English",
                company: "Neighborhood Academy",
                location: "Citylight, Surat",
                employmentType: "Part-time",
                level: "Intermediate",
                salary: "₹350/hr",
                tags: ["language", "english", "teaching"],
            },
            {
                title: "Coding Basics Coach",
                company: "Student Tech Club",
                location: "SVNIT Campus",
                employmentType: "Freelance",
                level: "Beginner",
                salary: "₹500/session",
                tags: ["coding", "basics", "mentoring"],
            },
        ],
    },
    {
        key: "technical-it-support",
        title: "Technical & IT Support",
        jobs: [
            {
                title: "Laptop Setup Assistance",
                company: "Neighborhood Store",
                location: "Citylight, Surat",
                employmentType: "On-site",
                level: "Beginner",
                salary: "₹400/task",
                tags: ["tech", "setup", "support"],
            },
            {
                title: "App Installation Helper",
                company: "Community Help Desk",
                location: "Adajan, Surat",
                employmentType: "On-site",
                level: "Beginner",
                salary: "₹300/task",
                tags: ["apps", "install", "support"],
            },
            {
                title: "Senior Tech Support",
                company: "Local NGO",
                location: "Remote",
                employmentType: "Remote",
                level: "Intermediate",
                salary: "₹250/hr",
                tags: ["support", "seniors", "remote"],
            },
            {
                title: "Bug Reporting & Testing",
                company: "Startup Studio",
                location: "Remote",
                employmentType: "Freelance",
                level: "Intermediate",
                salary: "₹600/task",
                tags: ["testing", "bugs", "qa"],
            },
            {
                title: "Smartphone Guidance",
                company: "Community Center",
                location: "Nanpura, Surat",
                employmentType: "On-site",
                level: "Beginner",
                salary: "₹200/session",
                tags: ["mobile", "guidance", "support"],
            },
        ],
    },
    {
        key: "community-campus",
        title: "Community & Campus Micro Tasks",
        jobs: [
            {
                title: "Event Volunteer",
                company: "Campus Event Club",
                location: "SVNIT Campus",
                employmentType: "On-site",
                level: "Beginner",
                salary: "₹500/event",
                tags: ["events", "volunteer", "campus"],
            },
            {
                title: "Survey & Data Collector",
                company: "Local Research Group",
                location: "Vesu, Surat",
                employmentType: "Part-time",
                level: "Beginner",
                salary: "₹300/task",
                tags: ["survey", "data", "field"],
            },
            {
                title: "Campus Ambassador",
                company: "Student Startup",
                location: "SVNIT Campus",
                employmentType: "Part-time",
                level: "Intermediate",
                salary: "₹1,500/month",
                tags: ["ambassador", "marketing", "campus"],
            },
            {
                title: "Library Assistance",
                company: "University Library",
                location: "SVNIT Campus",
                employmentType: "On-site",
                level: "Beginner",
                salary: "₹250/hr",
                tags: ["library", "assist", "campus"],
            },
            {
                title: "Local Research Reporter",
                company: "Community NGO",
                location: "Adajan, Surat",
                employmentType: "Part-time",
                level: "Intermediate",
                salary: "₹600/report",
                tags: ["research", "reporting", "local"],
            },
        ],
    },
    {
        key: "personal-online",
        title: "Personal & Online Assistance",
        jobs: [
            {
                title: "Online Form Filling",
                company: "Local Services Hub",
                location: "Remote",
                employmentType: "Remote",
                level: "Beginner",
                salary: "₹150/form",
                tags: ["forms", "online", "assist"],
            },
            {
                title: "Document Scanning & Sorting",
                company: "Neighborhood Office",
                location: "Athwa, Surat",
                employmentType: "On-site",
                level: "Beginner",
                salary: "₹300/task",
                tags: ["documents", "scan", "organize"],
            },
            {
                title: "Travel Planning Help",
                company: "Family Travel Desk",
                location: "Remote",
                employmentType: "Freelance",
                level: "Intermediate",
                salary: "₹500/plan",
                tags: ["travel", "planning", "online"],
            },
            {
                title: "Appointment Booking",
                company: "Local Clinic",
                location: "Nanpura, Surat",
                employmentType: "Remote",
                level: "Beginner",
                salary: "₹200/task",
                tags: ["booking", "appointments", "support"],
            },
            {
                title: "Online Chat Assistance",
                company: "Small Business",
                location: "Remote",
                employmentType: "Part-time",
                level: "Intermediate",
                salary: "₹250/hr",
                tags: ["chat", "support", "online"],
            },
        ],
    },
];

const sanitizeSkills = (skills) => {
    if (!Array.isArray(skills)) return [];
    const cleaned = skills
        .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
        .filter((skill) => skill.length > 0);
    return Array.from(new Set(cleaned));
};

exports.getStudentOverview = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-passwordHash");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const studentProfile = await Student.findOne({ userId: req.user.userId });
        const skills = studentProfile?.skills || [];
        const hasSkills = skills.length > 0;

        const [fallbackJobs, totalRecommendations, nearbyCount, openJobs] = await Promise.all([
            JobPick.find().sort({ createdAt: -1 }).limit(6),
            JobPick.countDocuments(),
            JobOpportunity.countDocuments(),
            Job.find({ status: "open" }).sort({ createdAt: -1 }).lean(),
        ]);

        const profileCompletion = getProfileCompletion(user, studentProfile);
        const scoredRecommendations = hasSkills
            ? getContentRecommendations(skills, openJobs, 6)
            : [];
        const resolvedRecommendations = scoredRecommendations.length > 0
            ? scoredRecommendations.map((item) => ({
                  _id: item.job._id,
                  title: item.job.title,
                  company: item.job.companyName || "Client",
                  location: item.job.location || "Remote",
                  employmentType: item.job.employmentType || "Flexible",
                  level: item.job.level || "Any level",
                  salary: item.job.salary || "",
                  tags: item.job.tags || [],
                  score: item.score,
              }))
            : fallbackJobs.length > 0
                ? fallbackJobs
                : fallbackRecommendations;

        res.json({
            profile: user,
            studentProfile: {
                skills,
            },
            hasSkills,
            stats: {
                profileCompletion,
                totalRecommendations: hasSkills ? resolvedRecommendations.length : totalRecommendations || resolvedRecommendations.length,
                nearbyOpportunities: nearbyCount || 0,
                activeApplications: 0,
                matchScore: 92,
                reliabilityScore: 4.8,
            },
            recommendations: hasSkills ? resolvedRecommendations : [],
            categories: hasSkills
                ? []
                : categoryJobs.map((category) => ({
                      key: category.key,
                      title: category.title,
                      jobs: category.jobs,
                  })),
            insights: [
                { title: "Skill Match", value: "92/100", hint: "Based on your skills & ratings" },
                { title: "Response Speed", value: "Fast", hint: "Avg reply under 2 hrs" },
                { title: "Fraud Risk", value: "Low", hint: "Account verified" },
            ],
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load student dashboard" });
    }
};

exports.getStudentRecommendations = async (req, res) => {
    try {
        const studentProfile = await Student.findOne({ userId: req.user.userId });
        const skills = studentProfile?.skills || [];
        if (!skills.length) {
            return res.json({ recommendations: [] });
        }

        const openJobs = await Job.find({ status: "open" }).sort({ createdAt: -1 }).lean();
        const scoredRecommendations = getContentRecommendations(skills, openJobs, 10);

        const recommendations = scoredRecommendations.map((item) => ({
            _id: item.job._id,
            title: item.job.title,
            company: item.job.companyName || "Client",
            location: item.job.location || "Remote",
            employmentType: item.job.employmentType || "Flexible",
            level: item.job.level || "Any level",
            salary: item.job.salary || "",
            tags: item.job.tags || [],
            score: item.score,
        }));

        res.json({ recommendations });
    } catch (error) {
        res.status(500).json({ message: "Failed to load recommendations" });
    }
};

exports.getStudentProfile = async (req, res) => {
    try {
        const studentProfile = await Student.findOne({ userId: req.user.userId });
        if (!studentProfile) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        res.json({
            skills: studentProfile.skills || [],
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load student profile" });
    }
};

exports.updateStudentSkills = async (req, res) => {
    try {
        const incomingSkills = sanitizeSkills(req.body?.skills || []);
        const studentProfile = await Student.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: { skills: incomingSkills } },
            { new: true, upsert: true }
        );

        res.json({
            message: "Skills updated",
            skills: studentProfile.skills || [],
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update skills" });
    }
};

exports.getJobsByCategory = async (req, res) => {
    try {
        const categoryKey = req.query.category;
        const normalized = typeof categoryKey === "string" ? categoryKey : "";

        if (!normalized) {
            return res.json({
                categories: categoryJobs.map((category) => ({
                    key: category.key,
                    title: category.title,
                    jobs: category.jobs,
                })),
            });
        }

        const category = categoryJobs.find((item) => item.key === normalized);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({
            key: category.key,
            title: category.title,
            jobs: category.jobs,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load jobs" });
    }
};
