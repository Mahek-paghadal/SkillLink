const User = require("../models/User");
const JobPick = require("../models/JobPick");
const JobOpportunity = require("../models/JobOpportunity");

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

const getProfileCompletion = (user) => {
    let score = 40;
    if (user?.name) score += 20;
    if (user?.email) score += 20;
    if (user?.profileImage) score += 20;
    return Math.min(score, 100);
};

exports.getStudentOverview = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-passwordHash");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const [recommendations, totalRecommendations, nearbyCount] = await Promise.all([
            JobPick.find().sort({ createdAt: -1 }).limit(6),
            JobPick.countDocuments(),
            JobOpportunity.countDocuments(),
        ]);

        const profileCompletion = getProfileCompletion(user);
        const resolvedRecommendations = recommendations.length > 0 ? recommendations : fallbackRecommendations;

        res.json({
            profile: user,
            stats: {
                profileCompletion,
                totalRecommendations: totalRecommendations || resolvedRecommendations.length,
                nearbyOpportunities: nearbyCount || 0,
                activeApplications: 0,
                matchScore: 92,
                reliabilityScore: 4.8,
            },
            recommendations: resolvedRecommendations,
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
