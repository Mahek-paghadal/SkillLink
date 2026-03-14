import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  logoutUser,
  uploadProfileImage,
  removeProfileImage,
} from "../api/authApi";
import { getClientStats, getClientStatsDetails } from "../api/jobApi";
import { removeToken } from "../utils/auth";

const ClientProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [stats, setStats] = useState({
    totalJobsPosted: 0,
    activeHiredJobs: 0,
    pendingJobs: 0,
    uniqueStudentsWorkedWith: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsType, setDetailsType] = useState("posted");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsData, setDetailsData] = useState({
    postedJobs: [],
    activeHiredJobs: [],
    pendingJobs: [],
    uniqueStudents: [],
  });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageMenuRef = useRef(null);
  const imageButtonRef = useRef(null);

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const backendOrigin = apiBase.replace(/\/api\/?$/, "");
  const profileImageUrl = user?.profileImage ? `${backendOrigin}${user.profileImage}` : "";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setUser(res.data);
      } catch (err) {
        setError("Failed to load profile");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setStatsError("");
        const res = await getClientStats();
        if (!isMounted) return;
        setStats({
          totalJobsPosted: res.data?.totalJobsPosted ?? 0,
          activeHiredJobs: res.data?.activeHiredJobs ?? 0,
          pendingJobs: res.data?.pendingJobs ?? 0,
          uniqueStudentsWorkedWith: res.data?.uniqueStudentsWorkedWith ?? 0,
        });
      } catch (err) {
        if (!isMounted) return;
        setStatsError("Failed to load stats");
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    fetchStats();
    const intervalId = window.setInterval(fetchStats, 30000);
    window.addEventListener("jobs-updated", fetchStats);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("jobs-updated", fetchStats);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      if (!detailsOpen) return;
      setDetailsLoading(true);
      setDetailsError("");
      try {
        const res = await getClientStatsDetails();
        if (!isMounted) return;
        setDetailsData({
          postedJobs: res.data?.postedJobs || [],
          activeHiredJobs: res.data?.activeHiredJobs || [],
          pendingJobs: res.data?.pendingJobs || [],
          uniqueStudents: res.data?.uniqueStudents || [],
        });
      } catch (err) {
        if (!isMounted) return;
        setDetailsError("Failed to load details");
      } finally {
        if (isMounted) setDetailsLoading(false);
      }
    };

    fetchDetails();
    const handler = () => fetchDetails();
    let intervalId = null;
    if (detailsOpen) {
      window.addEventListener("jobs-updated", handler);
      intervalId = window.setInterval(fetchDetails, 30000);
    }
    return () => {
      isMounted = false;
      window.removeEventListener("jobs-updated", handler);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [detailsOpen]);

  useEffect(() => {
    if (!showImageMenu) return;
    const handleOutsideClick = (event) => {
      if (imageMenuRef.current?.contains(event.target)) return;
      if (imageButtonRef.current?.contains(event.target)) return;
      setShowImageMenu(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showImageMenu]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadProfileImage(formData);
      setUser((prev) => ({
        ...(prev || {}),
        profileImage: res.data.profileImage,
      }));
      setSelectedImage(null);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e) {
      setUploadError(e.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    setSelectedImage(file);
    handleUpload(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowImageMenu(false);
  };

  const handleRemoveImage = async () => {
    setUploading(true);
    setUploadError("");
    try {
      await removeProfileImage();
      setUser((prev) => ({
        ...(prev || {}),
        profileImage: "",
      }));
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e) {
      setUploadError(e.response?.data?.message || "Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore
    } finally {
      removeToken();
      window.location.href = "/";
    }
  };

  const detailConfig = {
    posted: {
      title: "All posted jobs",
      items: detailsData.postedJobs,
      empty: "No jobs posted yet.",
      type: "jobs",
    },
    activeHired: {
      title: "Active hired jobs",
      items: detailsData.activeHiredJobs,
      empty: "No active hired jobs yet.",
      type: "jobs",
    },
    pending: {
      title: "Pending jobs",
      items: detailsData.pendingJobs,
      empty: "No pending jobs right now.",
      type: "jobs",
    },
    students: {
      title: "Unique students",
      items: detailsData.uniqueStudents,
      empty: "No students hired yet.",
      type: "students",
    },
  };

  const handleOpenDetails = (type) => {
    setDetailsType(type);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-darkBg">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-darkBg">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-bgLight dark:bg-darkBg">
      <div className="container mx-auto px-4 py-4 max-w-6xl h-full">
        <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-5 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">Client Profile</h2>
              <p className="text-textDark/70 dark:text-darkText/70">Your account details</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition"
            >
              Logout
            </button>
          </div>
        </div>
        <div className={`transition ${detailsOpen ? "blur-md" : ""}`}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-4 items-stretch">
            <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-6 h-full">
            <div className="mb-6 flex flex-col items-center">
              <div className="relative w-24 h-24">
                <div className="w-24 h-24 rounded-full bg-accent/30 dark:bg-darkBorder overflow-hidden flex items-center justify-center">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="absolute -bottom-2 right-1">
                  <button
                    type="button"
                    onClick={() => setShowImageMenu((prev) => !prev)}
                    ref={imageButtonRef}
                    className="w-9 h-9 rounded-full bg-light/80 dark:bg-darkBorder text-textDark dark:text-darkText flex items-center justify-center shadow hover:bg-accent/30 dark:hover:bg-accent/20 transition"
                    aria-label="Edit profile image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h3l2-2h8l2 2h3v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                  </button>
                  {showImageMenu && (
                    <div
                      ref={imageMenuRef}
                      className="absolute left-0 mt-2 w-32 rounded-xl border border-light/60 dark:border-darkBorder bg-white dark:bg-darkCard shadow-lg overflow-hidden z-10"
                    >
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full text-left px-3 py-2 text-sm text-textDark dark:text-darkText hover:bg-light/60 dark:hover:bg-darkBorder/60"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={!user?.profileImage || uploading}
                        className="w-full text-left px-3 py-2 text-sm text-textDark dark:text-darkText hover:bg-light/60 dark:hover:bg-darkBorder/60 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {uploading && (
                <div className="mt-2 text-xs text-textDark/60 dark:text-darkText/60">Uploading...</div>
              )}
              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-xl border border-light/60 dark:border-darkBorder p-4 bg-white/70 dark:bg-darkCard/70">
                <p className="text-sm text-textDark/70 dark:text-darkText/70">Name</p>
                <p className="text-base font-semibold text-textDark dark:text-darkText">{user?.name || user?.fullName || "-"}</p>
              </div>
              <div className="rounded-xl border border-light/60 dark:border-darkBorder p-4 bg-white/70 dark:bg-darkCard/70">
                <p className="text-sm text-textDark/70 dark:text-darkText/70">Email</p>
                <p className="text-base font-semibold text-textDark dark:text-darkText break-all">{user?.email || "-"}</p>
              </div>
              <div className="rounded-xl border border-light/60 dark:border-darkBorder p-4 bg-white/70 dark:bg-darkCard/70">
                <p className="text-sm text-textDark/70 dark:text-darkText/70">Role</p>
                <p className="text-base font-semibold text-textDark dark:text-darkText">{user?.role || "-"}</p>
              </div>
              <div className="rounded-xl border border-light/60 dark:border-darkBorder p-4 bg-white/70 dark:bg-darkCard/70">
                <p className="text-sm text-textDark/70 dark:text-darkText/70">Joined</p>
                <p className="text-base font-semibold text-textDark dark:text-darkText">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                </p>
              </div>
            </div>
            </div>
            <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-textDark dark:text-darkText">Job activity</h3>
                <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-1">
                  Live stats across your posted jobs and hires.
                </p>
              </div>
            </div>
            {statsError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {statsError}
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 auto-rows-fr flex-1">
              {[
                { key: "posted", label: "Total jobs posted", value: stats.totalJobsPosted },
                { key: "activeHired", label: "Active hired jobs", value: stats.activeHiredJobs },
                { key: "pending", label: "Pending jobs", value: stats.pendingJobs },
                { key: "students", label: "Unique students", value: stats.uniqueStudentsWorkedWith },
              ].map((item) => (
                <div
                  key={item.key}
                  className="rounded-2xl border border-light/60 dark:border-darkBorder bg-inputBg dark:bg-darkCard p-4 flex flex-col justify-between"
                >
                  <p className="text-xs uppercase tracking-wide text-textDark/60 dark:text-darkText/60 text-center">
                    {item.label}
                  </p>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="px-6 py-3 rounded-full bg-light/70 dark:bg-darkBorder text-3xl font-bold text-primary shadow-sm">
                      {statsLoading ? "..." : item.value}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(item.key)}
                    className="text-sm font-semibold text-primary text-center"
                  >
                    View details
                  </button>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>

        {detailsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDetailsOpen(false)}
            />
            <div className="relative w-full max-w-3xl mx-4 rounded-2xl bg-white dark:bg-darkCard border border-light/60 dark:border-darkBorder p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-textDark dark:text-darkText">
                  {detailConfig[detailsType].title}
                </h3>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="text-textDark/60 dark:text-darkText/60 hover:text-primary"
                >
                  ✕
                </button>
              </div>
              {detailsError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {detailsError}
                </div>
              )}
              <div className="mt-4 max-h-[60vh] overflow-auto pr-1">
                {detailsLoading ? (
                  <div className="text-sm text-textDark/60 dark:text-darkText/60">Loading...</div>
                ) : detailConfig[detailsType].items.length === 0 ? (
                  <div className="text-sm text-textDark/60 dark:text-darkText/60">
                    {detailConfig[detailsType].empty}
                  </div>
                ) : detailConfig[detailsType].type === "students" ? (
                  <div className="space-y-3">
                    {detailConfig[detailsType].items.map((student) => {
                      const studentImage = student.profileImage
                        ? `${backendOrigin}${student.profileImage}`
                        : "";
                      const rankLabel = student.rankPosition
                        ? `${student.rankTier || "Bronze"} ${student.rankPosition}`
                        : student.rankTier || "Bronze";
                      return (
                        <div
                          key={student._id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-light/60 dark:border-darkBorder bg-inputBg dark:bg-darkCard p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-accent/30 dark:bg-darkBorder flex items-center justify-center overflow-hidden">
                              {studentImage ? (
                                <img
                                  src={studentImage}
                                  alt={student.name || "Student"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-primary">
                                  {(student.name || "S").slice(0, 1).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-textDark dark:text-darkText">
                                {student.name || "Student"}
                              </div>
                              <div className="text-sm text-textDark/60 dark:text-darkText/60">
                                {student.email || ""}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-xs text-textDark/60 dark:text-darkText/60">
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                              Rank: {rankLabel}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-accent/20 text-textDark dark:text-darkText font-semibold">
                              Jobs completed with you: {student.completedJobsWithClient ?? 0}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detailConfig[detailsType].items.map((job) => (
                      <div
                        key={job._id}
                        className="rounded-2xl border border-light/60 dark:border-darkBorder bg-inputBg dark:bg-darkCard p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-textDark dark:text-darkText">
                              {job.title || "Job"}
                            </div>
                            <div className="text-sm text-textDark/60 dark:text-darkText/60">
                              {job.companyName || "Client"}
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder text-textDark/70 dark:text-darkText/70">
                            {job.status || "open"}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-textDark/60 dark:text-darkText/60">
                          Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
