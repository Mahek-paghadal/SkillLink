const express = require("express");
const router = express.Router();
const {
    signup , 
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    logout
} = require("../controllers/auth.controllers");

const {protect} = require("../middleware/auth.middleware");

router.post("/signup" , signup);
router.post("/login" , login);

router.post("/forgot-password" , forgotPassword);
router.post("/reset-password" , resetPassword);

router.get("/profile" , protect , getProfile);
router.post("/logout" , protect,logout);

module.exports = router;