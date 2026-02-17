const Notification = require("../models/Notification");

const buildNotificationResponse = (notifications) =>
    notifications.map((item) => ({
        _id: item._id,
        title: item.title,
        message: item.message,
        type: item.type,
        link: item.link,
        isRead: item.isRead,
        createdAt: item.createdAt,
    }));

exports.getNotifications = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const notifications = await Notification.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        const unreadCount = await Notification.countDocuments({
            userId: req.user.userId,
            isRead: false,
        });

        res.json({
            notifications: buildNotificationResponse(notifications),
            unreadCount,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load notifications" });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, userId: req.user.userId },
            { $set: { isRead: true } },
            { new: true }
        ).lean();

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({
            notification: buildNotificationResponse([notification])[0],
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notification" });
    }
};

exports.markAllNotificationsRead = async (req, res) => {
    try {
        const result = await Notification.deleteMany({ userId: req.user.userId });

        res.json({
            message: "Notifications cleared",
            deletedCount: result?.deletedCount || 0,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notifications" });
    }
};
