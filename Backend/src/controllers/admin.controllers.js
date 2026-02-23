const User = require("../models/User");
const Student = require("../models/Student");
const Client = require("../models/Client");
const Admin = require("../models/Admin");
const Job = require("../models/Job");
const Application = require("../models/Application");


exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const students = await Student.countDocuments();
    const clients = await Client.countDocuments();
    const admins = await Admin.countDocuments();
    const totalUsers = await User.countDocuments();
    const [openJobs, closedJobs, completedJobs] = await Promise.all([
      Job.countDocuments({ status: "open" }),
      Job.countDocuments({ status: "closed" }),
      Job.countDocuments({ status: "completed" }),
    ]);
    const [pendingApps, hiredApps, rejectedApps, completedApps] = await Promise.all([
      Application.countDocuments({ status: "pending" }),
      Application.countDocuments({ status: "hired" }),
      Application.countDocuments({ status: "rejected" }),
      Application.countDocuments({ status: "completed" }),
    ]);

    res.json({
      students,
      clients,
      admins,
      totalUsers,
      jobs: {
        open: openJobs,
        closed: closedJobs,
        completed: completedJobs,
      },
      applications: {
        pending: pendingApps,
        hired: hiredApps,
        rejected: rejectedApps,
        completed: completedApps,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).populate("createdBy", "name email");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to load jobs" });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = status || job.status;
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to update job" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
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

exports.listApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .sort({ createdAt: -1 })
      .populate("jobId", "title companyName status")
      .populate("studentId", "name email")
      .populate("clientId", "name email");
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to load applications" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status || application.status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Failed to update application" });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await application.deleteOne();
    res.json({ message: "Application deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete application" });
  }
};