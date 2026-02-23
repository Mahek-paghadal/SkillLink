const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        location: { type: String, default: "", trim: true },
        employmentType: { type: String, default: "", trim: true },
        level: { type: String, default: "", trim: true },
        salary: { type: String, default: "", trim: true },
        tags: [{ type: String, trim: true }],
        companyName: { type: String, default: "", trim: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["open", "closed", "completed"], default: "open" },
        archivedByClient: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
