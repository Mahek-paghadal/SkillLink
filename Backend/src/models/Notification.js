const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, default: "", trim: true },
        message: { type: String, default: "", trim: true },
        type: { type: String, default: "info", trim: true },
        link: { type: String, default: "", trim: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
