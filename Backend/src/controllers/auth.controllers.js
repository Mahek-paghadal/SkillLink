const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const Client = require("../models/Client");
const Admin = require("../models/Admin");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

/// signup controller

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        /// check any field is blank or not
        if (!name || !name.trim() || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        /// check email already exists or not
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        /// hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email,
            passwordHash: hashedPassword,
            role,
        });

        /// create role based profile
        if (role === "student") {
            await Student.create({ userId: user._id });
        }

        if (role === "client") {
            await Client.create({ userId: user._id });
        }

        if (role === "admin") {
            await Admin.create({ userId: user._id, permissions: [] });
        }

        res.status(201).json({
            message: "Signup successful",
            userId: user._id,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: "server error" });
    }
};

/// login controller
exports.login = async (req, res) => {
    try {
        const { email, password, expectedRole } = req.body;

        /// check user exists or not
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (expectedRole && user.role !== expectedRole) {
            return res.status(403).json({ message: `Please use the ${user.role} login option` });
        }

        /// compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        /// generate jwt token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '2d' }
        );

        /// save token in DB
        user.authToken = token;
        user.tokenExpiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        await user.save();

        res.json({
            message: "Login successful",
            token,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: "server error" });
    }
};

exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profileImage = `/uploads/profile-images/${req.file.filename}`;
        await user.save();

        res.json({
            message: "Profile image updated",
            profileImage: user.profileImage,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.removeProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingPath = user.profileImage;
        user.profileImage = "";
        await user.save();

        if (existingPath && typeof existingPath === "string" && existingPath.startsWith("/uploads/profile-images/")) {
            const filename = path.basename(existingPath);
            const filePath = path.join(__dirname, "..", "..", "uploads", "profile-images", filename);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                // ignore file deletion errors
            }
        }

        res.json({ message: "Profile image removed", profileImage: "" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/// forgot password controller
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        /// generate secure random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; /// 15 mins

        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        /// send email
        await sendEmail({
            to: user.email,
            subject: "Reset your SkillLink Password",
            html: `
            <h2>Password reset Request</h2>
            <p>You requested to reset your password.</p>
            <p>Click the link below to reset it (valid for 15 minutes):</p>
            <a href = "${resetLink}" target = "_blank">${resetLink}</a>
            <p> If you didn't request this, please ignore this email.</p>
            `
        });

        res.json({
            message: "Password link send to your email",
            resetToken
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/// reset password controller
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or Expired token please try again" });
        }

        /// hash new password
        user.passwordHash = await bcrypt.hash(newPassword, 10);


        /// clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;

        await user.save();

        res.json({ message: "Password reset successful" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/// profile controller
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-passwordHash");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

/// logout controller
exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.authToken = null;
        user.tokenExpiry = null;
        await user.save();
        
        res.json({ message: "Logout successful. Please login again" });
    } catch (error) {
        res.status(500).json({ message: "server error" });
    }
};