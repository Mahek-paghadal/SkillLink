const mongoose = require("mongoose");

const jobPickSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        company: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        employmentType: { type: String, required: true, trim: true },
        level: { type: String, required: true, trim: true },
        salary: { type: String, default: "" },
        tags: [{ type: String, trim: true }],
        logoUrl: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("JobPick", jobPickSchema);
