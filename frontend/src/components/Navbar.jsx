import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { isAuthenticated, getUserRole } from "../utils/auth";
import { getProfile } from "../api/authApi";

const Navbar = () => {
  const location = useLocation();
  const [authed, setAuthed] = useState(isAuthenticated());
  const [role, setRole] = useState(authed ? getUserRole() : null);
  const [profileImage, setProfileImage] = useState("");

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

  const getHomePath = () => {
    if (!authed) return "/";
    if (role === "student") return "/student/dashboard";
    if (role === "client") return "/client/dashboard";
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
            <Link
              to="/profile"
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
