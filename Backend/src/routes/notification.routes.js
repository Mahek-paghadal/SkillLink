const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} = require("../controllers/notification.controllers");

router.get("/", protect, getNotifications);
router.post("/:notificationId/read", protect, markNotificationRead);
router.post("/read-all", protect, markAllNotificationsRead);

module.exports = router;
