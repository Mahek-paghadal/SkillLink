const User = require("../models/User");
const Student = require("../models/Student");
const Job = require("../models/Job");
const JobPick = require("../models/JobPick");
const JobOpportunity = require("../models/JobOpportunity");
const Application = require("../models/Application");
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

const BADGE_THRESHOLDS = [
    { tier: "Bronze", min: 4 },
    { tier: "Silver", min: 8 },
    { tier: "Gold", min: 20 },
    { tier: "Diamond", min: 40 },
];

const getBadgeTier = (count) => {
    for (let i = BADGE_THRESHOLDS.length - 1; i >= 0; i -= 1) {
        if (count >= BADGE_THRESHOLDS[i].min) {
            return BADGE_THRESHOLDS[i].tier;
        }
    }
    return null;
};

const computeRankScore = (completedCount, avgRating, reliabilityScore, responseHours, rehireRate) => {
    const completedScore = Math.min(completedCount / 20, 1) * 45;
    const ratingScore = Math.min(avgRating / 5, 1) * 35;
    const reliability = Math.min(reliabilityScore / 5, 1) * 10;
    const responseBase = Number.isFinite(responseHours) ? responseHours : 72;
    const responseScore = (1 - Math.min(responseBase / 72, 1)) * 5;
    const rehireScore = Math.min(rehireRate, 1) * 5;
    return Math.round(completedScore + ratingScore + reliability + responseScore + rehireScore);
};

const getRankTier = (score) => {
    if (score >= 90) return "Diamond";
    if (score >= 75) return "Gold";
    if (score >= 55) return "Silver";
    return "Bronze";
};

const buildStudentFeatures = async () => {
    const students = await User.find({ role: "student" }).select("_id").lean();
    const completedApps = await Application.find({ status: "completed" }).lean();
    const hiredApps = await Application.find({ status: "hired" }).lean();

    const completedByStudent = new Map();
    const ratingsByStudent = new Map();
    const responseByStudent = new Map();
    const clientCountsByStudent = new Map();

    completedApps.forEach((app) => {
        const key = String(app.studentId);
        completedByStudent.set(key, (completedByStudent.get(key) || 0) + 1);
        if (Number.isFinite(app.clientRating)) {
            const ratings = ratingsByStudent.get(key) || [];
            ratings.push(app.clientRating);
            ratingsByStudent.set(key, ratings);
        }
        const clientMap = clientCountsByStudent.get(key) || new Map();
        const clientKey = String(app.clientId);
        clientMap.set(clientKey, (clientMap.get(clientKey) || 0) + 1);
        clientCountsByStudent.set(key, clientMap);
    });

    hiredApps.forEach((app) => {
        const key = String(app.studentId);
        if (app.hiredAt && app.createdAt) {
            const hours = (new Date(app.hiredAt) - new Date(app.createdAt)) / (1000 * 60 * 60);
            if (Number.isFinite(hours)) {
                const list = responseByStudent.get(key) || [];
                list.push(hours);
                responseByStudent.set(key, list);
            }
        }
    });

    return students.map((student) => {
        const studentId = String(student._id);
        const completedCount = completedByStudent.get(studentId) || 0;
        const ratings = ratingsByStudent.get(studentId) || [];
        const avgRating = ratings.length
            ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
            : 0;
        const responseHoursList = responseByStudent.get(studentId) || [];
        const responseHours = responseHoursList.length
            ? responseHoursList.reduce((sum, value) => sum + value, 0) / responseHoursList.length
            : 72;
        const clientMap = clientCountsByStudent.get(studentId) || new Map();
        const uniqueClients = clientMap.size;
        const repeatClients = Array.from(clientMap.values()).filter((count) => count >= 2).length;
        const rehireRate = uniqueClients ? repeatClients / uniqueClients : 0;

        return {
            studentId,
            completedCount,
            avgRating,
            responseHours,
            rehireRate,
        };
    });
};

const fetchRankingFromModel = async (features) => {
    if (!features.length) return null;
    const baseUrl = process.env.STUDENT_RANKING_API_URL || "http://localhost:8000";
    const url = `${baseUrl.replace(/\/+$/, "")}/student-rankings`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ students: features }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return Array.isArray(data?.ranked) ? data.ranked : null;
    } catch (error) {
        return null;
    }
};

const buildRankings = async () => {
    const features = await buildStudentFeatures();
    const reliabilityScore = 4.8;
    const rankedFromModel = await fetchRankingFromModel(features);

    if (rankedFromModel && rankedFromModel.length) {
        return rankedFromModel.map((entry) => ({
            studentId: String(entry.studentId),
            score: Math.round(entry.score || 0),
            completedCount: entry.completedCount || 0,
            avgRating: entry.avgRating || 0,
            responseHours: entry.responseHours || 0,
            rehireRate: entry.rehireRate || 0,
        }));
    }

    const ranked = features.map((entry) => ({
        studentId: entry.studentId,
        score: computeRankScore(
            entry.completedCount,
            entry.avgRating,
            reliabilityScore,
            entry.responseHours,
            entry.rehireRate
        ),
        completedCount: entry.completedCount,
        avgRating: entry.avgRating,
        responseHours: entry.responseHours,
        rehireRate: entry.rehireRate,
    }));

    ranked.sort((a, b) => b.score - a.score);
    return ranked;
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

        const [
            fallbackJobs,
            totalRecommendations,
            nearbyCount,
            openJobs,
            completedApps,
            rankings,
            activeApplicationsCount,
        ] = await Promise.all([
            JobPick.find().sort({ createdAt: -1 }).limit(6),
            JobPick.countDocuments(),
            JobOpportunity.countDocuments(),
            Job.find({ status: "open" }).sort({ createdAt: -1 }).lean(),
            Application.find({ studentId: req.user.userId, status: "completed" })
                .populate("jobId", "tags title")
                .populate("clientId", "name")
                .lean(),
            buildRankings(),
            Application.countDocuments({
                studentId: req.user.userId,
                status: { $in: ["pending", "hired"] },
            }),
        ]);

        const completedCount = completedApps.length;
        const ratings = completedApps
            .map((app) => app.clientRating)
            .filter((rating) => Number.isFinite(rating));
        const reviewAverage = ratings.length
            ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10
            : 0;
        const reviewCount = ratings.length;

        const skillCounts = new Map();
        const skillLabels = new Map();
        completedApps.forEach((app) => {
            const tags = Array.isArray(app.jobId?.tags) ? app.jobId.tags : [];
            const sourceSkills = tags.length > 0
                ? tags
                : Array.isArray(app.studentSkills)
                    ? app.studentSkills
                    : [];
            sourceSkills.forEach((skill) => {
                const raw = String(skill).trim();
                if (!raw) return;
                const key = raw.toLowerCase();
                if (!key) return;
                if (!skillLabels.has(key)) {
                    skillLabels.set(key, raw);
                }
                skillCounts.set(key, (skillCounts.get(key) || 0) + 1);
            });
        });

        const badges = Array.from(skillCounts.entries())
            .map(([skill, count]) => ({
                skill: skillLabels.get(skill) || skill,
                count,
                tier: getBadgeTier(count),
            }))
            .filter((item) => item.tier)
            .sort((a, b) => b.count - a.count);

                const badgeProgress = Array.from(skillCounts.entries())
                    .map(([skill, count]) => {
                        let nextTier = null;
                        let remaining = 0;
                        for (const threshold of BADGE_THRESHOLDS) {
                            if (count < threshold.min) {
                                nextTier = threshold.tier;
                                remaining = threshold.min - count;
                                break;
                            }
                        }
                        return {
                            skill: skillLabels.get(skill) || skill,
                            count,
                            nextTier,
                            remaining,
                        };
                    })
                    .filter((item) => item.nextTier)
                    .sort((a, b) => a.remaining - b.remaining)
                    .slice(0, 6);

        const reviews = completedApps
            .filter((app) => app.clientRating)
            .map((app) => ({
                rating: app.clientRating,
                review: app.clientReview || "",
                jobTitle: app.jobId?.title || "Job",
                clientName: app.clientId?.name || "Client",
                reviewedAt: app.reviewedAt || app.updatedAt,
            }))
            .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
            .slice(0, 6);

        const reliabilityScore = 4.8;
        const rankingEntry = rankings.find(
            (entry) => entry.studentId === String(req.user.userId)
        );
        const rankScore = rankingEntry?.score ?? computeRankScore(
            completedCount,
            reviewAverage,
            reliabilityScore,
            rankingEntry?.responseHours,
            rankingEntry?.rehireRate
        );
        const rankTier = getRankTier(rankScore);
        const rankPosition = rankings.findIndex(
            (entry) => entry.studentId === String(req.user.userId)
        );

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
                activeApplications: activeApplicationsCount || 0,
                matchScore: 92,
                reliabilityScore,
                completedJobs: completedCount,
                reviewAverage,
                reviewCount,
                rankScore,
                rankTier,
                rankPosition: rankPosition === -1 ? null : rankPosition + 1,
            },
            recommendations: hasSkills ? resolvedRecommendations : [],
            categories: hasSkills
                ? []
                : categoryJobs.map((category) => ({
                      key: category.key,
                      title: category.title,
                      jobs: category.jobs,
                  })),
            badges,
            badgeProgress,
            reviews,
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
