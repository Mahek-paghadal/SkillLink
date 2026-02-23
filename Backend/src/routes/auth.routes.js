const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const {
    signup , 
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    logout,
    uploadProfileImage,
    removeProfileImage
} = require("../controllers/auth.controllers");

const {protect} = require("../middleware/auth.middleware");

const profileImagesDir = path.join(__dirname, "..", "..", "uploads", "profile-images");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(profileImagesDir, { recursive: true });
        cb(null, profileImagesDir);
    },
    filename: (req, file, cb) => {
        const safeExt = path.extname(file.originalname || "").toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
});

router.post("/signup" , signup);
router.post("/login" , login);

router.post("/forgot-password" , forgotPassword);
router.post("/reset-password" , resetPassword);

router.get("/profile" , protect , getProfile);
router.post("/logout" , protect,logout);

router.post(
    "/profile-image",
    protect,
    upload.single("image"),
    uploadProfileImage
);

router.delete("/profile-image", protect, removeProfileImage);

module.exports = router;