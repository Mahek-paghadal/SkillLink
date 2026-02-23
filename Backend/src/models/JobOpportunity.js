const mongoose = require("mongoose");

const jobOpportunitySchema = new mongoose.Schema(
    {
        role: { type: String, required: true, trim: true },
        company: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        openings: { type: Number, default: 1 },
        employmentType: { type: String, default: "" },
        logoUrl: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("JobOpportunity", jobOpportunitySchema);
