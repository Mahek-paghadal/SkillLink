const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const Student = require("../models/Student");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const path = require("path");

const sanitizeTags = (tags) => {
    if (!Array.isArray(tags)) return [];
    return tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter((tag) => tag.length > 0);
};

const createNotification = async ({ userId, title, message, type = "info", link = "" }) => {
    if (!userId) return;
    try {
        await Notification.create({
            userId,
            title,
            message,
            type,
            link,
        });
    } catch (error) {
        // Notification failures should not break primary flows.
    }
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

const buildRankings = async () => {
    const features = await buildStudentFeatures();
    const reliabilityScore = 4.8;

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

const buildClientStudentSummary = async (clientId) => {
    const completedWithClient = await Application.find({
        clientId,
        status: "completed",
    })
        .select("studentId")
        .lean();

    const completedByStudent = new Map();
    completedWithClient.forEach((app) => {
        const key = String(app.studentId);
        completedByStudent.set(key, (completedByStudent.get(key) || 0) + 1);
    });

    const uniqueStudentIds = Array.from(completedByStudent.keys());
    if (uniqueStudentIds.length === 0) return [];

    const rankings = await buildRankings();
    const rankIndexByStudent = new Map(
        rankings.map((entry, index) => [String(entry.studentId), { entry, index }])
    );

    const students = await User.find({ _id: { $in: uniqueStudentIds } })
        .select("name email profileImage")
        .lean();

    const enrichedStudents = students.map((student) => {
        const rankData = rankIndexByStudent.get(String(student._id));
        const rankScore = rankData?.entry?.score ?? 0;
        const rankTier = getRankTier(rankScore);
        const rankPosition = rankData ? rankData.index + 1 : null;
        const completedJobsWithClient = completedByStudent.get(String(student._id)) || 0;

        return {
            ...student,
            rankTier,
            rankPosition,
            completedJobsWithClient,
        };
    });

    enrichedStudents.sort((a, b) => {
        if (b.completedJobsWithClient !== a.completedJobsWithClient) {
            return b.completedJobsWithClient - a.completedJobsWithClient;
        }
        const rankA = Number.isFinite(a.rankPosition) ? a.rankPosition : Number.MAX_SAFE_INTEGER;
        const rankB = Number.isFinite(b.rankPosition) ? b.rankPosition : Number.MAX_SAFE_INTEGER;
        return rankA - rankB;
    });

    return enrichedStudents;
};

exports.listJobs = async (req, res) => {
    try {
        const query = { status: "open" };
        if (req.user.role === "student") {
            query.$or = [
                { visibility: { $exists: false } },
                { visibility: "global" },
                { visibility: "targeted", allowedStudents: req.user.userId },
            ];
        }

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .populate("createdBy", "name profileImage");
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Failed to load jobs" });
    }
};

exports.createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            location,
            employmentType,
            level,
            salary,
            tags,
            companyName,
            visibility,
            allowedStudents,
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const targetVisibility = visibility === "targeted" ? "targeted" : "global";
        let allowedStudentIds = [];

        if (targetVisibility === "targeted") {
            if (!Array.isArray(allowedStudents) || allowedStudents.length === 0) {
                return res.status(400).json({ message: "Select at least one student" });
            }

            const eligibleStudents = await Application.distinct("studentId", {
                clientId: req.user.userId,
                status: "completed",
            });
            const eligibleSet = new Set(eligibleStudents.map((id) => String(id)));
            allowedStudentIds = allowedStudents
                .map((id) => String(id))
                .filter((id) => eligibleSet.has(id));

            if (allowedStudentIds.length !== allowedStudents.length) {
                return res.status(400).json({ message: "Selected students are not eligible" });
            }
        }

        const job = await Job.create({
            title: title.trim(),
            description: description.trim(),
            location: location || "",
            employmentType: employmentType || "",
            level: level || "",
            salary: salary || "",
            tags: sanitizeTags(tags),
            companyName: companyName || user.name || "Client",
            createdBy: req.user.userId,
            status: "open",
            visibility: targetVisibility,
            allowedStudents: allowedStudentIds,
        });

        if (targetVisibility === "targeted" && allowedStudentIds.length > 0) {
            const selectedStudents = await User.find({ _id: { $in: allowedStudentIds } })
                .select("name email")
                .lean();

            await Promise.all(selectedStudents.map(async (student) => {
                await createNotification({
                    userId: student._id,
                    title: "New job shared with you",
                    message: `${user.name || "Client"} shared a job: ${job.title}.`,
                    type: "job",
                    link: "/student/jobs",
                });

                if (student.email) {
                    await sendEmail({
                        to: student.email,
                        subject: `New job from ${user.name || "Client"}`,
                        html: `
                            <h2>New job shared with you</h2>
                            <p><strong>Job:</strong> ${job.title}</p>
                            <p><strong>Client:</strong> ${user.name || "Client"}</p>
                            <p>Log in to SkillLink to view the details.</p>
                        `,
                    });
                }
            }));
        }

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: "Failed to create job" });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findOne({ _id: jobId, createdBy: req.user.userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const updates = {
            title: req.body.title?.trim() || job.title,
            description: req.body.description?.trim() || job.description,
            location: req.body.location ?? job.location,
            employmentType: req.body.employmentType ?? job.employmentType,
            level: req.body.level ?? job.level,
            salary: req.body.salary ?? job.salary,
            tags: req.body.tags ? sanitizeTags(req.body.tags) : job.tags,
            companyName: req.body.companyName ?? job.companyName,
            status: req.body.status ?? job.status,
        };

        Object.assign(job, updates);
        await job.save();

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: "Failed to update job" });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findOne({ _id: jobId, createdBy: req.user.userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        await Application.deleteMany({ jobId: job._id });
        await job.deleteOne();

        res.json({ message: "Job deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete job" });
    }
};

exports.getClientJobs = async (req, res) => {
    try {
        const statusFilter = typeof req.query.status === "string" ? req.query.status : "open";
        const query = { createdBy: req.user.userId };

        if (statusFilter === "open") {
            query.status = "open";
        } else if (statusFilter === "current") {
            const hiredJobIds = await Application.distinct("jobId", {
                clientId: req.user.userId,
                status: "hired",
            });
            if (hiredJobIds.length === 0) {
                return res.json([]);
            }
            const jobs = await Job.find({ _id: { $in: hiredJobIds } }).sort({ createdAt: -1 });
            return res.json(jobs);
        } else if (statusFilter === "pending") {
            const hiredJobIds = await Application.distinct("jobId", {
                clientId: req.user.userId,
                status: "hired",
            });
            query.status = "open";
            if (hiredJobIds.length > 0) {
                query._id = { $nin: hiredJobIds };
            }
        } else if (statusFilter === "closed") {
            query.status = { $in: ["closed", "completed"] };
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Failed to load jobs" });
    }
};

exports.getApplicants = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findOne({ _id: jobId, createdBy: req.user.userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const applications = await Application.find({ jobId: job._id })
            .sort({ createdAt: -1 })
            .populate("studentId", "name email profileImage");

        res.json({
            job,
            applications,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load applicants" });
    }
};

exports.getStudentApplications = async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user.userId })
            .sort({ createdAt: -1 })
            .populate("jobId", "title companyName location employmentType level salary status")
            .populate("clientId", "name email");

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: "Failed to load applications" });
    }
};

exports.getStudentHistory = async (req, res) => {
    try {
        const applications = await Application.find({
            studentId: req.user.userId,
            status: "completed",
            archivedByStudent: false,
        })
            .sort({ createdAt: -1 })
            .populate("jobId", "title companyName location employmentType level salary status")
            .populate("clientId", "name email");

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: "Failed to load history" });
    }
};

exports.archiveStudentApplication = async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        const application = await Application.findOne({
            _id: applicationId,
            studentId: req.user.userId,
            status: "completed",
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        application.archivedByStudent = true;
        await application.save();

        res.json({ message: "History item removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear history" });
    }
};

exports.clearStudentHistory = async (req, res) => {
    try {
        await Application.updateMany(
            { studentId: req.user.userId, status: "completed", archivedByStudent: false },
            { $set: { archivedByStudent: true } }
        );
        res.json({ message: "History cleared" });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear history" });
    }
};

exports.applyForJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findById(jobId);
        if (!job || job.status !== "open") {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.visibility === "targeted") {
            const allowed = (job.allowedStudents || []).map((id) => String(id));
            if (!allowed.includes(String(req.user.userId))) {
                return res.status(403).json({ message: "You are not allowed to apply for this job" });
            }
        }

        const fullName = (req.body?.fullName || "").trim();
        const email = (req.body?.email || "").trim();
        const phone = (req.body?.phone || "").trim();
        const coverMessage = (req.body?.coverMessage || "").trim();
        const experience = (req.body?.experience || "").trim();
        const resumeLink = (req.body?.resumeLink || "").trim();
        const hasResumeFile = Boolean(req.file);
        const hasPortfolio = Boolean(resumeLink);

        if (!fullName || !email || !phone || !coverMessage) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        if (!hasResumeFile && !hasPortfolio) {
            return res.status(400).json({ message: "Resume upload or portfolio link is required." });
        }

        const existing = await Application.findOne({ jobId, studentId: req.user.userId });
        if (existing) {
            return res.status(400).json({ message: "You already applied to this job" });
        }

        const student = await User.findById(req.user.userId);
        const client = await User.findById(job.createdBy);
        const studentProfile = await Student.findOne({ userId: req.user.userId });

        const resumeFile = req.file
            ? `/uploads/resumes/${req.file.filename}`
            : "";
        const resumeFileName = req.file?.originalname || "";

        const application = await Application.create({
            jobId: job._id,
            studentId: req.user.userId,
            clientId: job.createdBy,
            studentName: fullName || student?.name || "",
            studentEmail: email || student?.email || "",
            contactNumber: phone,
            coverMessage,
            experience,
            resumeLink,
            resumeFile,
            resumeFileName,
            studentSkills: studentProfile?.skills || [],
            status: "pending",
        });

        if (client?.email) {
            const attachments = [];
            if (resumeFile) {
                attachments.push({
                    filename: resumeFileName || path.basename(resumeFile),
                    path: path.join(__dirname, "..", "..", resumeFile.replace(/^\/+/g, "")),
                });
            }
            const emailLines = [
                "<h2>New Application Received</h2>",
                `<p><strong>Job:</strong> ${job.title}</p>`,
                `<p><strong>Company:</strong> ${job.companyName || "Client"}</p>`,
                `<p><strong>Student:</strong> ${application.studentName || "Student"}</p>`,
            ];

            if (application.studentEmail) {
                emailLines.push(`<p><strong>Email:</strong> ${application.studentEmail}</p>`);
            }
            if (application.contactNumber) {
                emailLines.push(`<p><strong>Contact:</strong> ${application.contactNumber}</p>`);
            }
            if (application.coverMessage) {
                emailLines.push("<p><strong>Cover message:</strong></p>");
                emailLines.push(`<p>${application.coverMessage}</p>`);
            }
            if (application.resumeLink) {
                emailLines.push(`<p><strong>Portfolio link:</strong> ${application.resumeLink}</p>`);
            }
            if (resumeFileName) {
                emailLines.push(`<p><strong>Resume file:</strong> ${resumeFileName}</p>`);
            }
            await sendEmail({
                to: client.email,
                subject: `New application: ${job.title}`,
                html: emailLines.join("\n"),
                attachments,
            });
        }

        await createNotification({
            userId: job.createdBy,
            title: "New application",
            message: `${application.studentName || "A student"} applied for ${job.title}.`,
            type: "application",
            link: "/client/dashboard",
        });

        res.status(201).json({ message: "Application submitted", application });
    } catch (error) {
        res.status(500).json({ message: "Failed to apply" });
    }
};

exports.hireApplicant = async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;
        const job = await Job.findOne({ _id: jobId, createdBy: req.user.userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const application = await Application.findOne({ _id: applicationId, jobId: job._id });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        application.status = "hired";
        application.hiredAt = new Date();
        await application.save();

        job.status = "closed";
        await job.save();

        const student = await User.findById(application.studentId);
        const client = await User.findById(req.user.userId);

        if (student?.email) {
            await sendEmail({
                to: student.email,
                subject: `You are hired for ${job.title}!`,
                html: `
                    <h2>Congratulations!</h2>
                    <p>You have been hired for <strong>${job.title}</strong>.</p>
                    <p><strong>Client:</strong> ${client?.name || "Client"}</p>
                    <p><strong>Contact:</strong> ${client?.email || ""}</p>
                    <p><strong>Next steps:</strong> Please reply to the client to coordinate start details.</p>
                `,
            });
        }

        await createNotification({
            userId: application.studentId,
            title: "You're hired",
            message: `You were hired for ${job.title}.`,
            type: "status",
            link: "/student/jobs",
        });

        res.json({ message: "Applicant hired", application });
    } catch (error) {
        res.status(500).json({ message: "Failed to hire applicant" });
    }
};

exports.completeApplication = async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;
        const application = await Application.findOne({
            _id: applicationId,
            jobId,
            studentId: req.user.userId,
            status: "hired",
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const job = await Job.findById(jobId).select("title").lean();
        const client = await User.findById(application.clientId);

        application.status = "completed";
        application.completedAt = new Date();
        await application.save();

        if (client?.email) {
            await sendEmail({
                to: client.email,
                subject: `Job completed: ${job?.title || "Job"}`,
                html: `
                    <h2>Job marked completed</h2>
                    <p>The student marked <strong>${job?.title || "a job"}</strong> as completed.</p>
                    <p>Please review the work and leave feedback.</p>
                `,
            });
        }

        await createNotification({
            userId: application.clientId,
            title: "Job marked completed",
            message: `${application.studentName || "A student"} marked ${job?.title || "a job"} as completed.`,
            type: "status",
            link: "/client/dashboard",
        });

        res.json({ message: "Job marked as completed", application });
    } catch (error) {
        res.status(500).json({ message: "Failed to complete job" });
    }
};

exports.rejectApplicant = async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;
        const job = await Job.findOne({ _id: jobId, createdBy: req.user.userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const application = await Application.findOne({ _id: applicationId, jobId: job._id });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        application.status = "rejected";
        await application.save();

        const student = await User.findById(application.studentId);
        const client = await User.findById(req.user.userId);

        if (student?.email) {
            await sendEmail({
                to: student.email,
                subject: `Update on your application for ${job.title}`,
                html: `
                    <h2>Application Update</h2>
                    <p>Thank you for applying for <strong>${job.title}</strong>.</p>
                    <p>Unfortunately, there are no available slots at the moment.</p>
                    <p><strong>Client:</strong> ${client?.name || "Client"}</p>
                    <p>We appreciate your interest and encourage you to apply again in the future.</p>
                `,
            });
        }

        await createNotification({
            userId: application.studentId,
            title: "Application update",
            message: `Your application for ${job.title} was not accepted.`,
            type: "status",
            link: "/student/jobs",
        });

        res.json({ message: "Application rejected", application });
    } catch (error) {
        res.status(500).json({ message: "Failed to reject applicant" });
    }
};

exports.submitClientReview = async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;
        const { rating, review } = req.body;

        const numericRating = Number(rating);
        if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const job = await Job.findOne({ _id: jobId, createdBy: req.user.userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const application = await Application.findOne({ _id: applicationId, jobId: job._id });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.status !== "completed") {
            return res.status(400).json({ message: "Job must be completed before reviewing" });
        }

        if (application.clientRating) {
            return res.status(400).json({ message: "Review already submitted" });
        }

        application.clientRating = numericRating;
        application.clientReview = typeof review === "string" ? review.trim() : "";
        application.reviewedAt = new Date();
        await application.save();

        await createNotification({
            userId: application.studentId,
            title: "New review",
            message: `You received a review for ${job.title}.`,
            type: "review",
            link: "/profile",
        });

        res.json({ message: "Review submitted", application });
    } catch (error) {
        res.status(500).json({ message: "Failed to submit review" });
    }
};

exports.closeJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findOne({ _id: jobId, createdBy: req.user.userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        job.status = "closed";
        await job.save();

        res.json({ message: "Job closed", job });
    } catch (error) {
        res.status(500).json({ message: "Failed to close job" });
    }
};

exports.getClientHistory = async (req, res) => {
    try {
        const hiredJobIds = await Application.distinct("jobId", {
            clientId: req.user.userId,
            status: "hired",
        });

        const query = {
            createdBy: req.user.userId,
            status: { $in: ["closed", "completed"] },
            archivedByClient: false,
        };
        if (hiredJobIds.length > 0) {
            query._id = { $nin: hiredJobIds };
        }

        const jobs = await Job.find(query).sort({ updatedAt: -1 });

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Failed to load history" });
    }
};

exports.archiveClientJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findOne({ _id: jobId, createdBy: req.user.userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        await job.deleteOne();

        res.json({ message: "Job removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear history" });
    }
};

exports.clearClientHistory = async (req, res) => {
    try {
        const hiredJobIds = await Application.distinct("jobId", {
            clientId: req.user.userId,
            status: "hired",
        });

        const query = {
            createdBy: req.user.userId,
            status: { $in: ["closed", "completed"] },
        };
        if (hiredJobIds.length > 0) {
            query._id = { $nin: hiredJobIds };
        }

        const result = await Job.deleteMany(query);
        res.json({
            message: "History cleared",
            deletedCount: result?.deletedCount || 0,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear history" });
    }
};

exports.getClientStats = async (req, res) => {
    try {
        const clientId = req.user.userId;

        const totalJobsPosted = await Job.countDocuments({ createdBy: clientId });

        const activeHiredJobIds = await Application.distinct("jobId", {
            clientId,
            status: "hired",
        });

        const hiredOrCompletedJobIds = await Application.distinct("jobId", {
            clientId,
            status: { $in: ["hired", "completed"] },
        });

        const pendingQuery = { createdBy: clientId, status: "open" };
        if (hiredOrCompletedJobIds.length) {
            pendingQuery._id = { $nin: hiredOrCompletedJobIds };
        }

        const pendingJobs = await Job.countDocuments(pendingQuery);

        const uniqueStudentsWorkedWith = await Application.distinct("studentId", {
            clientId,
            status: { $in: ["hired", "completed"] },
        });

        res.json({
            totalJobsPosted,
            activeHiredJobs: activeHiredJobIds.length,
            pendingJobs,
            uniqueStudentsWorkedWith: uniqueStudentsWorkedWith.length,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load client stats" });
    }
};

exports.getClientStatsDetails = async (req, res) => {
    try {
        const clientId = req.user.userId;

        const postedJobs = await Job.find({ createdBy: clientId })
            .select("title companyName status createdAt")
            .sort({ createdAt: -1 })
            .lean();

        const activeHiredJobIds = await Application.distinct("jobId", {
            clientId,
            status: "hired",
        });

        const hiredOrCompletedJobIds = await Application.distinct("jobId", {
            clientId,
            status: { $in: ["hired", "completed"] },
        });

        const activeHiredJobs = activeHiredJobIds.length
            ? await Job.find({ _id: { $in: activeHiredJobIds } })
                .select("title companyName status createdAt")
                .sort({ createdAt: -1 })
                .lean()
            : [];

        const pendingQuery = { createdBy: clientId, status: "open" };
        if (hiredOrCompletedJobIds.length) {
            pendingQuery._id = { $nin: hiredOrCompletedJobIds };
        }

        const pendingJobs = await Job.find(pendingQuery)
            .select("title companyName status createdAt")
            .sort({ createdAt: -1 })
            .lean();

        const enrichedStudents = await buildClientStudentSummary(clientId);

        res.json({
            postedJobs,
            activeHiredJobs,
            pendingJobs,
            uniqueStudents: enrichedStudents,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load client stats details" });
    }
};

exports.getShareableStudents = async (req, res) => {
    try {
        const clientId = req.user.userId;
        const students = await buildClientStudentSummary(clientId);
        res.json({ students });
    } catch (error) {
        res.status(500).json({ message: "Failed to load students" });
    }
};
