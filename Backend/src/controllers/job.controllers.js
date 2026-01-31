const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");

const sanitizeTags = (tags) => {
    if (!Array.isArray(tags)) return [];
    return tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter((tag) => tag.length > 0);
};

exports.listJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: "open" }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Failed to load jobs" });
    }
};

exports.createJob = async (req, res) => {
    try {
        const { title, description, location, employmentType, level, salary, tags, companyName } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
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
        });

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
        const jobs = await Job.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
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
            .populate("studentId", "name email");

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

        const existing = await Application.findOne({ jobId, studentId: req.user.userId });
        if (existing) {
            return res.status(400).json({ message: "You already applied to this job" });
        }

        const student = await User.findById(req.user.userId);
        const client = await User.findById(job.createdBy);
        const studentProfile = await Student.findOne({ userId: req.user.userId });

        const application = await Application.create({
            jobId: job._id,
            studentId: req.user.userId,
            clientId: job.createdBy,
            studentName: req.body?.fullName || student?.name || "",
            studentEmail: req.body?.email || student?.email || "",
            contactNumber: req.body?.phone || "",
            coverMessage: req.body?.coverMessage || "",
            experience: req.body?.experience || "",
            resumeLink: req.body?.resumeLink || "",
            studentSkills: studentProfile?.skills || [],
            status: "pending",
        });

        if (client?.email) {
            await sendEmail({
                to: client.email,
                subject: `New application: ${job.title}`,
                html: `
                    <h2>New Application Received</h2>
                    <p><strong>Job:</strong> ${job.title}</p>
                    <p><strong>Company:</strong> ${job.companyName || "Client"}</p>
                    <p><strong>Student:</strong> ${application.studentName || "Student"}</p>
                    <p><strong>Email:</strong> ${application.studentEmail || ""}</p>
                    <p><strong>Contact:</strong> ${application.contactNumber || ""}</p>
                    <p><strong>Cover message:</strong></p>
                    <p>${application.coverMessage || "(No message)"}</p>
                    <p><strong>Resume/Portfolio:</strong> ${application.resumeLink || "(Not provided)"}</p>
                `,
            });
        }

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

        application.status = "completed";
        await application.save();

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

        res.json({ message: "Application rejected", application });
    } catch (error) {
        res.status(500).json({ message: "Failed to reject applicant" });
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
        const jobs = await Job.find({
            createdBy: req.user.userId,
            status: { $in: ["closed", "completed"] },
            archivedByClient: false,
        }).sort({ updatedAt: -1 });

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

        job.archivedByClient = true;
        await job.save();

        res.json({ message: "History item removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear history" });
    }
};

exports.clearClientHistory = async (req, res) => {
    try {
        await Job.updateMany(
            { createdBy: req.user.userId, status: { $in: ["closed", "completed"] }, archivedByClient: false },
            { $set: { archivedByClient: true } }
        );
        res.json({ message: "History cleared" });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear history" });
    }
};
