const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        studentName: { type: String, default: "", trim: true },
        studentEmail: { type: String, default: "", trim: true },
        contactNumber: { type: String, default: "", trim: true },
        coverMessage: { type: String, default: "", trim: true },
        experience: { type: String, default: "", trim: true },
        resumeLink: { type: String, default: "", trim: true },
    resumeFile: { type: String, default: "", trim: true },
    resumeFileName: { type: String, default: "", trim: true },
        studentSkills: [{ type: String, trim: true }],
        status: { type: String, enum: ["pending", "hired", "rejected", "completed"], default: "pending" },
        archivedByStudent: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
