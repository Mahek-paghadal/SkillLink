const mongoose = require('mongoose');

/// user schema
/// base model for student , client , data

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["student", "client", "admin"],
            required: true
        },
        authToken: {
            type: String,
            default: null,
        },

        tokenExpiry: {
            type: Date,
            default: null,
        },
        profileImage: {
            type: String,
            default: "",
        },
        resetPasswordToken: String,
        resetPasswordExpiry: Date,
    },
    { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);