import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { isAuthenticated, getUserRole } from "../utils/auth";
import { getProfile } from "../api/authApi";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notificationApi";

const Navbar = () => {
  const location = useLocation();
  const [authed, setAuthed] = useState(isAuthenticated());
  const [role, setRole] = useState(authed ? getUserRole() : null);
  const [profileImage, setProfileImage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationRef = useRef(null);

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const backendOrigin = apiBase.replace(/\/api\/?$/, "");
  const profileImageUrl = profileImage ? `${backendOrigin}${profileImage}` : "";

  useEffect(() => {
    const handler = async () => {
      const nextAuthed = isAuthenticated();
      setAuthed(nextAuthed);
      setRole(nextAuthed ? getUserRole() : null);

      if (!nextAuthed) {
        setProfileImage("");
        return;
      }

      try {
        const res = await getProfile();
        setProfileImage(res.data?.profileImage || "");
      } catch (e) {
        setProfileImage("");
      }
    };
    handler();
    window.addEventListener('auth-changed', handler);
    window.addEventListener('profile-updated', handler);
    return () => {
      window.removeEventListener('auth-changed', handler);
      window.removeEventListener('profile-updated', handler);
    };
  }, []);

  useEffect(() => {
    if (!authed) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const res = await getNotifications({ limit: 10 });
        setNotifications(res.data?.notifications || []);
        setUnreadCount(res.data?.unreadCount || 0);
      } catch (e) {
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    const refreshId = window.setInterval(fetchNotifications, 60000);
    window.addEventListener("notifications-updated", fetchNotifications);
    return () => {
      window.clearInterval(refreshId);
      window.removeEventListener("notifications-updated", fetchNotifications);
    };
  }, [authed]);

  useEffect(() => {
    setShowNotifications(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const getHomePath = () => {
    if (!authed) return "/";
    if (role === "student") return "/student/dashboard";
    if (role === "client") return "/client/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/";
  };

  const getProfilePath = () => {
    if (!authed) return "/";
    if (role === "student") return "/student/profile";
    if (role === "client") return "/client/profile";
    if (role === "admin") return "/admin/dashboard";
    return "/";
  };

  const isAuthPage = ["/auth", "/forgot-password", "/reset-password"].includes(
    location.pathname
  );
  const isStudentDashboard = role === "student" && location.pathname === "/student/dashboard";
  const isAdminDashboard = role === "admin" && location.pathname === "/admin/dashboard";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-inputBg/90 dark:bg-darkCard/90 backdrop-blur border-b border-light/50 dark:border-darkBorder">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={getHomePath()} className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold tracking-tight text-primary">Skill</span>
          <span className="text-2xl font-extrabold tracking-tight text-textDark dark:text-darkText">Link</span>
        </Link>
        {!isAuthPage && !authed && (
          <div className="hidden md:flex items-center gap-6 text-sm text-textDark/70 dark:text-darkText/70">
            <a href="/#home" className="hover:text-primary transition">Home</a>
            <a href="/#job-picks" className="hover:text-primary transition">Find Tasks</a>
            <a href="/#why" className="hover:text-primary transition">About Us</a>
            <a href="/#services" className="hover:text-primary transition">Services</a>
          </div>
        )}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!authed && !isAuthPage && (
            <>
              <Link
                to="/auth?mode=login"
                className="text-sm font-semibold text-textDark dark:text-darkText hover:text-primary transition"
              >
                Login
              </Link>
              <Link
                to="/auth?mode=signup"
                className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition"
              >
                Sign Up
              </Link>
            </>
          )}
          {authed && !isAuthPage && !isStudentDashboard && !isAdminDashboard && (
            <Link
              to={getHomePath()}
              className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition"
            >
              Dashboard
            </Link>
          )}
          {authed && !isAuthPage && (
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative w-9 h-9 rounded-full bg-accent/30 dark:bg-darkBorder flex items-center justify-center hover:ring-2 ring-primary transition"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-light/60 dark:border-darkBorder bg-white dark:bg-darkCard shadow-xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-textDark dark:text-darkText">Notifications</div>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={async () => {
                          await markAllNotificationsRead();
                          setNotifications([]);
                          setUnreadCount(0);
                        }}
                        className="text-xs font-semibold text-primary"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notificationsLoading && (
                    <div className="text-sm text-textDark/60 dark:text-darkText/60">Loading...</div>
                  )}
                  {!notificationsLoading && notifications.length === 0 && (
                    <div className="text-sm text-textDark/60 dark:text-darkText/60">No notifications yet.</div>
                  )}
                  <div className="space-y-3">
                    {notifications.map((item) => (
                      <Link
                        key={item._id}
                        to={item.link || getHomePath()}
                        onClick={async () => {
                          if (!item.isRead) {
                            await markNotificationRead(item._id);
                            setNotifications((prev) =>
                              prev.map((entry) =>
                                entry._id === item._id ? { ...entry, isRead: true } : entry
                              )
                            );
                            setUnreadCount((prev) => Math.max(prev - 1, 0));
                          }
                          setShowNotifications(false);
                        }}
                        className={`block rounded-xl border px-3 py-2 transition ${
                          item.isRead
                            ? "border-light/60 dark:border-darkBorder bg-light/40 dark:bg-darkBorder/40"
                            : "border-primary/40 bg-primary/10"
                        }`}
                      >
                        <div className="text-xs font-semibold text-textDark dark:text-darkText">
                          {item.title || "Update"}
                        </div>
                        <div className="text-xs text-textDark/60 dark:text-darkText/60">
                          {item.message}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {authed && !isAuthPage && (
            <Link
              to={getProfilePath()}
              className="w-9 h-9 rounded-full bg-accent/30 dark:bg-darkBorder flex items-center justify-center hover:ring-2 ring-primary transition"
              title="Profile"
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
