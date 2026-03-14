import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile, logoutUser, uploadProfileImage, removeProfileImage, getPreferences } from "../api/authApi";
import { updateStudentSkills, getStudentOverview } from "../api/studentApi";
import { getJobs } from "../api/jobApi";
import { removeToken } from "../utils/auth";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [skillsError, setSkillsError] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [rankStats, setRankStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState([]);
  const [showAllProgress, setShowAllProgress] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
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
        if (res.data?.role === "student") {
          setSkills(res.data?.skills || []);
          const [overviewRes, jobsRes, prefsRes] = await Promise.all([
            getStudentOverview(),
            getJobs(),
            getPreferences(),
          ]);

          const overview = overviewRes.data || {};
          setRankStats(overview.stats || null);
          setBadges(overview.badges || []);
          setBadgeProgress(overview.badgeProgress || []);
          setReviews(overview.reviews || []);
          setReviewSummary({
            average: overview.stats?.reviewAverage ?? 0,
            count: overview.stats?.reviewCount ?? 0,
          });

          const savedIds = prefsRes.data?.savedJobIds || [];
          if (savedIds.length > 0) {
            const saved = (jobsRes.data || []).filter((job) => savedIds.includes(job._id));
            setSavedJobs(saved);
          } else {
            setSavedJobs([]);
          }

          const tags = (jobsRes.data || [])
            .flatMap((job) => job.tags || [])
            .map((tag) => String(tag).trim())
            .filter(Boolean);
          setAvailableSkills(Array.from(new Set(tags)).sort());
        }
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

  const addSkill = () => {
    if (!selectedSkill) return;
    if (skills.includes(selectedSkill)) {
      setSelectedSkill("");
      return;
    }
    setSkills((prev) => [...prev, selectedSkill]);
    setSelectedSkill("");
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const saveSkills = async () => {
    setSkillsSaving(true);
    setSkillsError("");
    try {
      const res = await updateStudentSkills(skills);
      setSkills(res.data?.skills || []);
    } catch (e) {
      setSkillsError(e.response?.data?.message || "Failed to update skills");
    } finally {
      setSkillsSaving(false);
    }
  };

  const completedJobs = rankStats?.completedJobs ?? 0;
  const badgePalette = {
    Bronze: {
      frame: "from-[#b8734f] to-[#7a3f2a]",
      frameEdge: "from-[#e0b59a] to-[#a46345]",
      core: "from-[#d4a27a] to-[#8a553b]",
      inner: "from-[#f1d0b8] to-[#c58c6a]",
      ribbon: "from-[#8a553b] to-[#c68b6a]",
      text: "text-[#5c3b2b]",
    },
    Silver: {
      frame: "from-[#c2c7d0] to-[#6f7b8a]",
      frameEdge: "from-[#e7ebf0] to-[#a7b1bf]",
      core: "from-[#cfd6df] to-[#7f8a9a]",
      inner: "from-[#e5e9ef] to-[#b4bcc8]",
      ribbon: "from-[#7f8a9a] to-[#bfc6d1]",
      text: "text-[#2b3745]",
    },
    Gold: {
      frame: "from-[#f0c55a] to-[#a87313]",
      frameEdge: "from-[#ffe2a6] to-[#d2a241]",
      core: "from-[#f2d07c] to-[#b1781c]",
      inner: "from-[#ffe6a3] to-[#d2a241]",
      ribbon: "from-[#b1781c] to-[#e6c067]",
      text: "text-[#5a4306]",
    },
    Diamond: {
      frame: "from-[#6fd0ff] to-[#1f66d1]",
      frameEdge: "from-[#bfeeff] to-[#5aa6ff]",
      core: "from-[#8de6ff] to-[#3d86e8]",
      inner: "from-[#c8f5ff] to-[#6fb6ff]",
      ribbon: "from-[#2f7eea] to-[#86d8ff]",
      text: "text-[#0f3a6b]",
    },
  };
  const getBadgeTone = (tier) => badgePalette[tier] || badgePalette.Bronze;
  const nextBadge = badgeProgress?.[0] || null;
  const tierTargets = { Bronze: 4, Silver: 8, Gold: 20, Diamond: 40 };
  const tierOrder = { Diamond: 4, Gold: 3, Silver: 2, Bronze: 1 };
  const progressItems = (badgeProgress || [])
    .map((item) => {
    const target = tierTargets[item.nextTier] || 0;
    const remaining = Number.isFinite(item.remaining) ? item.remaining : target;
    const current = Math.max(0, target - remaining);
    const percent = target > 0 ? Math.min(100, Math.max(0, Math.round((current / target) * 100))) : 0;
    return { ...item, target, current, percent };
    })
    .sort((a, b) => {
      const tierDiff = (tierOrder[b.nextTier] || 0) - (tierOrder[a.nextTier] || 0);
      if (tierDiff !== 0) return tierDiff;
      return a.remaining - b.remaining;
    });
  const visibleProgress = progressItems.slice(0, 8);
  const getProgressBarClass = (tier) => {
    switch (tier) {
      case "Diamond":
        return "progress-diamond";
      case "Gold":
        return "bg-gradient-to-r from-amber-400/70 to-yellow-500/70";
      case "Silver":
        return "bg-gradient-to-r from-slate-300/80 to-slate-500/70";
      case "Bronze":
      default:
        return "bg-gradient-to-r from-primary/60 to-accent/70";
    }
  };
  const displayBadges = [
    ...(badges || []),
    { skill: "Testing", tier: "Gold", count: 20 },
    { skill: "Testing", tier: "Diamond", count: 40 },
  ];

  const handleDownloadBadge = (badge) => {
    if (!badge) return;
    const title = `${badge.skill} ${badge.tier} Badge`;
    const palette = {
      Bronze: {
        outer: ["#b8734f", "#7a3f2a"],
        mid: ["#e0b59a", "#a46345"],
        inner: ["#d4a27a", "#8a553b"],
        text: "#5c3b2b",
      },
      Silver: {
        outer: ["#c2c7d0", "#6f7b8a"],
        mid: ["#e7ebf0", "#a7b1bf"],
        inner: ["#cfd6df", "#7f8a9a"],
        text: "#2b3745",
      },
      Gold: {
        outer: ["#f0c55a", "#a87313"],
        mid: ["#ffe2a6", "#d2a241"],
        inner: ["#f2d07c", "#b1781c"],
        text: "#5a4306",
      },
      Diamond: {
        outer: ["#6fd0ff", "#1f66d1"],
        mid: ["#bfeeff", "#5aa6ff"],
        inner: ["#8de6ff", "#3d86e8"],
        text: "#0f3a6b",
      },
    };

    const tone = palette[badge.tier] || palette.Bronze;
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawRoundedRect = (x, y, w, h, r) => {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    };

    const drawSparkle = (x, y, size, alpha) => {
      const arm = size / 2;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(x, y - arm);
      ctx.lineTo(x + arm * 0.3, y - arm * 0.3);
      ctx.lineTo(x + arm, y);
      ctx.lineTo(x + arm * 0.3, y + arm * 0.3);
      ctx.lineTo(x, y + arm);
      ctx.lineTo(x - arm * 0.3, y + arm * 0.3);
      ctx.lineTo(x - arm, y);
      ctx.lineTo(x - arm * 0.3, y - arm * 0.3);
      ctx.closePath();
      ctx.fillStyle = "rgba(224,242,254,0.95)";
      ctx.shadowColor = "rgba(224,242,254,0.7)";
      ctx.shadowBlur = 10;
      ctx.fill();
 
      ctx.restore();
    };

    const outerGradient = ctx.createLinearGradient(0, 0, size, size);
    outerGradient.addColorStop(0, tone.outer[0]);
    outerGradient.addColorStop(1, tone.outer[1]);
    drawRoundedRect(0, 0, size, size, 140);
    ctx.fillStyle = outerGradient;
    ctx.fill();

    const midInset = 38;
    const midSize = size - midInset * 2;
    const midGradient = ctx.createLinearGradient(midInset, midInset, size - midInset, size - midInset);
    midGradient.addColorStop(0, tone.mid[0]);
    midGradient.addColorStop(1, tone.mid[1]);
    drawRoundedRect(midInset, midInset, midSize, midSize, 120);
    ctx.fillStyle = midGradient;
    ctx.fill();

    const innerInset = 64;
    const innerSize = size - innerInset * 2;
    const innerGradient = ctx.createLinearGradient(innerInset, innerInset, size - innerInset, size - innerInset);
    innerGradient.addColorStop(0, tone.inner[0]);
    innerGradient.addColorStop(1, tone.inner[1]);
    drawRoundedRect(innerInset, innerInset, innerSize, innerSize, 104);
    ctx.fillStyle = innerGradient;
    ctx.fill();

    if (badge.tier === "Diamond") {
      const highlight = ctx.createRadialGradient(150, 150, 10, 150, 150, 140);
      highlight.addColorStop(0, "rgba(255,255,255,0.65)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = highlight;
      drawRoundedRect(innerInset + 6, innerInset + 6, innerSize - 12, innerSize - 12, 96);
      ctx.fill();

      const shimmer = ctx.createLinearGradient(0, 0, size, size);
      shimmer.addColorStop(0, "rgba(255,255,255,0)");
      shimmer.addColorStop(0.5, "rgba(255,255,255,0.35)");
      shimmer.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = shimmer;
      drawRoundedRect(innerInset + 8, innerInset + 8, innerSize - 16, innerSize - 16, 92);
      ctx.fill();
      ctx.restore();

      drawSparkle(350, 170, 20, 0.95);
      drawSparkle(200, 330, 16, 0.9);
      drawSparkle(300, 260, 14, 0.85);
      drawSparkle(260, 200, 12, 0.8);
    }

    ctx.save();
    drawRoundedRect(innerInset + 12, innerInset + 12, innerSize - 24, innerSize - 24, 96);
    ctx.clip();
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.restore();

    ctx.fillStyle = tone.text;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 52px Arial, sans-serif";
    ctx.fillText(String(badge.tier).toUpperCase(), size / 2, size / 2 - 32);
    ctx.font = "600 30px Arial, sans-serif";
    ctx.fillText(`${badge.count} jobs`, size / 2, size / 2 + 8);

    canvas.toBlob((blob) => {
      if (!blob) {
        const fallbackUrl = canvas.toDataURL("image/png");
        const fallbackLink = document.createElement("a");
        fallbackLink.href = fallbackUrl;
        fallbackLink.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        fallbackLink.remove();
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
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
    <div className="min-h-screen bg-bgLight dark:bg-darkBg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">Profile</h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-6">
          <div className="space-y-6">
            <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-6">
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
                  <p className="text-base font-semibold text-textDark dark:text-darkText">{user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</p>
                </div>
              </div>
            </div>

            {user?.role === "student" && (
              <>
                <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-textDark dark:text-darkText">Skills</h3>
                  <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-1">Update your skills to improve task matching.</p>

                  {skillsError && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                      {skillsError}
                    </div>
                  )}

                  <div className="mt-4 flex flex-col md:flex-row gap-3">
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="flex-1 px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                    >
                      <option value="">Select a skill</option>
                      {availableSkills
                        .filter((skill) => !skills.includes(skill))
                        .map((skill) => (
                          <option key={skill} value={skill}>
                            {skill}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition"
                    >
                      Add Skill
                    </button>
                  </div>
                  {availableSkills.length === 0 && (
                    <div className="mt-3 text-textDark/60 dark:text-darkText/60 text-sm">
                      No skills found from current jobs.
                    </div>
                  )}

                  {skills.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light/80 dark:bg-darkBorder text-sm text-textDark dark:text-darkText"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-textDark/60 dark:text-darkText/60 hover:text-primary"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-textDark/60 dark:text-darkText/60 text-sm">No skills added yet.</div>
                  )}

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={saveSkills}
                      disabled={skillsSaving}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {skillsSaving ? "Saving..." : "Save Skills"}
                    </button>
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-textDark dark:text-darkText">Saved jobs</h3>
                      <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-1">Quick access to jobs you saved.</p>
                    </div>
                    <Link to="/student/jobs?saved=1" className="text-primary font-semibold text-sm">View more</Link>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    {savedJobs.length === 0 && (
                      <div className="text-textDark/60 dark:text-darkText/60">No saved jobs yet.</div>
                    )}
                    {savedJobs.slice(0, 2).map((job) => (
                      <div key={job._id} className="rounded-2xl border border-light/60 dark:border-darkBorder p-4 bg-white/80 dark:bg-darkCard/80">
                        <h4 className="font-semibold text-textDark dark:text-darkText">{job.title}</h4>
                        <p className="text-sm text-textDark/60 dark:text-darkText/60">{job.companyName || "Client"}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.location || "Remote"}</span>
                          <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.employmentType || "Flexible"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {user?.role === "student" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <p className="text-xs tracking-widest text-textDark/60 dark:text-darkText/60">STUDENT RANK</p>
                <div className="mt-6 text-center">
                  <div className="relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 rounded-full" />
                    <div className="absolute inset-2 rounded-full bg-white/10 dark:bg-darkBorder/50 border-2 border-primary/50 dark:border-primary/70 box-border shadow-[inset_0_1px_3px_rgba(255,255,255,0.22),inset_0_-2px_4px_rgba(0,0,0,0.16),0_4px_8px_rgba(0,0,0,0.08)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-extrabold text-primary tracking-tight">
                        {rankStats?.rankPosition || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm font-semibold text-textDark dark:text-darkText">Rank</div>
                  <div className="mt-4 flex items-center justify-center">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/20 text-xs font-semibold text-textDark dark:text-darkText shadow-md">
                      Jobs Completed: {completedJobs}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <p className="text-xs tracking-widest text-textDark/60 dark:text-darkText/60">REVIEWS</p>
                <div className="mt-6 text-center">
                  <div className="relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 rounded-full" />
                    <div className="absolute inset-2 rounded-full bg-white/10 dark:bg-darkBorder/50 border-2 border-primary/50 dark:border-primary/70 box-border shadow-[inset_0_1px_3px_rgba(255,255,255,0.22),inset_0_-2px_4px_rgba(0,0,0,0.16),0_4px_8px_rgba(0,0,0,0.08)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-extrabold text-primary tracking-tight">
                        {reviewSummary.average}
                        <span className="ml-1 text-xl font-semibold text-primary/80">★</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm font-semibold text-textDark dark:text-darkText">Reviews</div>
                  <div className="mt-4 flex items-center justify-center">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/20 text-xs font-semibold text-textDark dark:text-darkText shadow-md">
                      {reviewSummary.count} reviews
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-textDark/60 dark:text-darkText/60">Based on completed jobs</div>
              </div>
              <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs tracking-widest text-textDark/60 dark:text-darkText/60">BADGES</p>
                </div>
                <div className="mt-2 flex items-start justify-between">
                  <div>
                    <div className="text-3xl font-bold text-primary">{badges.length}</div>
                    <div className="text-xs text-textDark/60 dark:text-darkText/60">Badges earned</div>
                  </div>
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-light/80 to-accent/30 dark:from-darkBorder/60 dark:to-darkCard" />
                    <svg className="absolute inset-2 w-16 h-16 text-textDark/20 dark:text-darkText/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 10.5c1.5-1.5 5.5-1.5 7 0" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 13.5c1-.8 3-.8 4 0" />
                    </svg>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-xs uppercase text-textDark/60 dark:text-darkText/60">Locked Badge</p>
                  <p className="text-base font-semibold text-textDark dark:text-darkText">
                    {badges.length > 0
                      ? `${badges[0].skill} ${badges[0].tier} Badge`
                      : "Complete jobs to unlock badges"}
                  </p>
                </div>
                {nextBadge && (
                  <div className="mt-2 text-xs text-textDark/60 dark:text-darkText/60">
                    Next badge: {nextBadge.skill} {nextBadge.nextTier} in {nextBadge.remaining} jobs
                  </div>
                )}
                <div className="mt-4 text-xs text-textDark/60 dark:text-darkText/60">Earn criteria: Bronze 4, Silver 8, Gold 20, Diamond 40 jobs per skill.</div>
                {displayBadges.length > 0 && (
                  <>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAllBadges(true)}
                        className="text-xs font-semibold text-primary"
                      >
                        View more
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {displayBadges.slice(0, 4).map((badge) => {
                      const tone = getBadgeTone(badge.tier);
                      const isDiamond = badge.tier === "Diamond";
                      return (
                        <div
                          key={`${badge.skill}-${badge.tier}`}
                          className={`relative rounded-2xl bg-white/80 dark:bg-darkCard/80 border border-light/60 dark:border-darkBorder p-3 ${
                            isDiamond ? "shadow-sm dark:shadow-[0_12px_24px_rgba(15,23,42,0.35)]" : ""
                          }`}
                        >
                          {isDiamond && (
                            <div className="absolute -inset-2 rounded-3xl bg-cyan-400/10 blur-2xl pointer-events-none hidden dark:block" />
                          )}
                          <div className="relative mx-auto w-20 h-20">
                            <div
                              className={`absolute inset-0 rounded-[26px] bg-gradient-to-br ${tone.frame} ${
                                isDiamond ? "border border-cyan-100/50" : ""
                              }`}
                            />
                            <div
                              className={`absolute inset-[6px] rounded-[20px] bg-gradient-to-br ${tone.frameEdge} ${
                                isDiamond ? "shadow-[inset_0_2px_10px_rgba(255,255,255,0.45)]" : "shadow-inner"
                              }`}
                            />
                            <div
                              className={`absolute inset-[10px] rounded-[16px] ${
                                isDiamond
                                  ? "bg-gradient-to-br from-cyan-200/70 via-cyan-100/30 to-blue-500/40"
                                  : `bg-gradient-to-br ${tone.core}`
                              }`}
                            />
                            {isDiamond && (
                              <div className="absolute inset-[10px] rounded-[16px] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-90 -translate-x-full animate-[diamond-shimmer_5s_ease-in-out_infinite]" />
                                <svg
                                  className="absolute top-2 right-2 w-4 h-4 text-cyan-50 drop-shadow-[0_0_8px_rgba(224,242,254,0.8)] animate-[diamond-sparkle_2.8s_ease-in-out_infinite]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                                </svg>
                                <svg
                                  className="absolute top-3 left-3 w-3.5 h-3.5 text-cyan-50/95 drop-shadow-[0_0_7px_rgba(224,242,254,0.75)] animate-[diamond-sparkle_3.6s_ease-in-out_infinite]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                                </svg>
                                <svg
                                  className="absolute bottom-3 left-3 w-3.5 h-3.5 text-cyan-50/95 drop-shadow-[0_0_7px_rgba(224,242,254,0.75)] animate-[diamond-sparkle_3.4s_ease-in-out_infinite]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                                </svg>
                                <svg
                                  className="absolute top-6 left-8 w-3 h-3 text-cyan-50/95 drop-shadow-[0_0_6px_rgba(224,242,254,0.7)] animate-[diamond-sparkle_4.2s_ease-in-out_infinite]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                                </svg>
                                <svg
                                  className="absolute top-9 left-5 w-2.5 h-2.5 text-white/90 drop-shadow-[0_0_6px_rgba(224,242,254,0.8)] animate-[diamond-sparkle_3.2s_ease-in-out_infinite]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                                </svg>
                                <svg
                                  className="absolute bottom-6 right-6 w-2.5 h-2.5 text-cyan-50/95 drop-shadow-[0_0_6px_rgba(224,242,254,0.75)] animate-[diamond-sparkle_3.8s_ease-in-out_infinite]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                                </svg>
                                <svg
                                  className="absolute top-9 right-5 w-2 h-2 text-white/90 drop-shadow-[0_0_5px_rgba(224,242,254,0.8)] animate-[diamond-sparkle_3.1s_ease-in-out_infinite]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                                </svg>
                              </div>
                            )}
                            <div
                              className={`absolute inset-[12px] rounded-[14px] ${
                                isDiamond
                                  ? "bg-gradient-to-br from-white/60 via-white/15 to-transparent"
                                  : ""
                              } shadow-[inset_0_2px_5px_rgba(255,255,255,0.35),inset_0_-4px_8px_rgba(0,0,0,0.18)]`}
                            />
                            {isDiamond && null}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <div
                                className={`text-[11px] ${isDiamond ? "font-extrabold" : "font-semibold"} tracking-widest uppercase ${tone.text}`}
                              >
                                {badge.tier}
                              </div>
                              <div className={`text-[10px] ${isDiamond ? "font-semibold" : "font-bold"} ${tone.text}`}>
                                {badge.count} jobs
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-center text-xs font-semibold text-textDark dark:text-darkText">
                            {badge.skill}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadBadge(badge)}
                            className="mt-2 w-full text-[11px] font-semibold text-primary"
                          >
                            Download badge
                          </button>
                        </div>
                      );
                    })}
                    </div>
                  </>
                )}
                {progressItems.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase text-textDark/60 dark:text-darkText/60">Next badge progress</p>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visibleProgress.map((item) => (
                        <div
                          key={`${item.skill}-${item.nextTier}`}
                          className="rounded-xl border border-light/60 dark:border-darkBorder bg-white/70 dark:bg-darkCard/70 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-textDark dark:text-darkText">{item.skill}</div>
                            <div className="text-xs font-semibold text-textDark/60 dark:text-darkText/60">
                              {item.current}/{item.target}
                            </div>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-light/80 dark:bg-darkBorder overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getProgressBarClass(item.nextTier)}`}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-textDark/60 dark:text-darkText/60">
                            {item.remaining} jobs left to reach {item.nextTier}
                          </div>
                        </div>
                      ))}
                    </div>
                    {progressItems.length > 0 && (
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowAllProgress(true)}
                          className="text-xs font-semibold text-primary"
                        >
                          View more
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {user?.role === "student" && (
          <div className="mt-6 bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-textDark dark:text-darkText">Recent reviews</h3>
                <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-1">What clients say about you.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.length === 0 && (
                <div className="text-textDark/60 dark:text-darkText/60">No reviews yet.</div>
              )}
              {reviews.map((review, index) => (
                <div key={`${review.jobTitle}-${index}`} className="rounded-2xl border border-light/60 dark:border-darkBorder p-4 bg-white/80 dark:bg-darkCard/80">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-textDark dark:text-darkText">{review.jobTitle}</h4>
                      <p className="text-sm text-textDark/60 dark:text-darkText/60">{review.clientName}</p>
                    </div>
                    <div className="text-primary font-semibold text-sm">{review.rating}★</div>
                  </div>
                  {review.review && (
                    <p className="text-sm text-textDark/70 dark:text-darkText/70 mt-2">{review.review}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {showAllProgress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowAllProgress(false)}
            />
            <div className="relative w-full max-w-2xl mx-4 rounded-2xl bg-white dark:bg-darkCard border border-light/60 dark:border-darkBorder p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-textDark dark:text-darkText">Next badge progress</h3>
                <button
                  type="button"
                  onClick={() => setShowAllProgress(false)}
                  className="text-textDark/60 dark:text-darkText/60 hover:text-primary"
                >
                  ✕
                </button>
              </div>
              <div className="progress-modal-scroll mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-auto pr-1">
                {progressItems.map((item) => (
                  <div
                    key={`${item.skill}-${item.nextTier}-modal`}
                    className="rounded-xl border border-light/60 dark:border-darkBorder bg-white/70 dark:bg-darkCard/70 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-textDark dark:text-darkText">{item.skill}</div>
                      <div className="text-xs font-semibold text-textDark/60 dark:text-darkText/60">
                        {item.current}/{item.target}
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-light/80 dark:bg-darkBorder overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarClass(item.nextTier)}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-textDark/60 dark:text-darkText/60">
                      {item.remaining} jobs left to reach {item.nextTier}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {showAllBadges && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowAllBadges(false)}
            />
            <div className="relative w-full max-w-3xl mx-4 rounded-2xl bg-white dark:bg-darkCard border border-light/60 dark:border-darkBorder p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-textDark dark:text-darkText">All badges</h3>
                <button
                  type="button"
                  onClick={() => setShowAllBadges(false)}
                  className="text-textDark/60 dark:text-darkText/60 hover:text-primary"
                >
                  ✕
                </button>
              </div>
              <div className="badges-modal-scroll mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-auto pr-1">
                {displayBadges.map((badge) => {
                  const tone = getBadgeTone(badge.tier);
                  const isDiamond = badge.tier === "Diamond";
                  return (
                    <div
                      key={`${badge.skill}-${badge.tier}-modal`}
                      className={`relative rounded-2xl bg-white/80 dark:bg-darkCard/80 border border-light/60 dark:border-darkBorder p-4 ${
                        isDiamond ? "shadow-sm dark:shadow-[0_12px_24px_rgba(15,23,42,0.35)]" : ""
                      }`}
                    >
                      {isDiamond && (
                        <div className="absolute -inset-2 rounded-3xl bg-cyan-400/10 blur-2xl pointer-events-none hidden dark:block" />
                      )}
                      <div className="relative mx-auto w-24 h-24">
                        <div
                          className={`absolute inset-0 rounded-[26px] bg-gradient-to-br ${tone.frame} ${
                            isDiamond ? "border border-cyan-100/50" : ""
                          }`}
                        />
                        <div
                          className={`absolute inset-[6px] rounded-[20px] bg-gradient-to-br ${tone.frameEdge} ${
                            isDiamond ? "shadow-[inset_0_2px_10px_rgba(255,255,255,0.45)]" : "shadow-inner"
                          }`}
                        />
                        <div
                          className={`absolute inset-[10px] rounded-[16px] ${
                            isDiamond
                              ? "bg-gradient-to-br from-cyan-200/70 via-cyan-100/30 to-blue-500/40"
                              : `bg-gradient-to-br ${tone.core}`
                          }`}
                        />
                        {isDiamond && (
                          <div className="absolute inset-[10px] rounded-[16px] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-90 -translate-x-full animate-[diamond-shimmer_5s_ease-in-out_infinite]" />
                            <svg
                              className="absolute top-2 right-2 w-4 h-4 text-cyan-50 drop-shadow-[0_0_8px_rgba(224,242,254,0.8)] animate-[diamond-sparkle_2.8s_ease-in-out_infinite]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                            </svg>
                            <svg
                              className="absolute top-3 left-3 w-3.5 h-3.5 text-cyan-50/95 drop-shadow-[0_0_7px_rgba(224,242,254,0.75)] animate-[diamond-sparkle_3.6s_ease-in-out_infinite]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                            </svg>
                            <svg
                              className="absolute bottom-3 left-3 w-3.5 h-3.5 text-cyan-50/95 drop-shadow-[0_0_7px_rgba(224,242,254,0.75)] animate-[diamond-sparkle_3.4s_ease-in-out_infinite]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                            </svg>
                            <svg
                              className="absolute top-6 left-8 w-3 h-3 text-cyan-50/95 drop-shadow-[0_0_6px_rgba(224,242,254,0.7)] animate-[diamond-sparkle_4.2s_ease-in-out_infinite]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                            </svg>
                            <svg
                              className="absolute top-9 left-5 w-2.5 h-2.5 text-white/90 drop-shadow-[0_0_6px_rgba(224,242,254,0.8)] animate-[diamond-sparkle_3.2s_ease-in-out_infinite]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                            </svg>
                            <svg
                              className="absolute bottom-6 right-6 w-2.5 h-2.5 text-cyan-50/95 drop-shadow-[0_0_6px_rgba(224,242,254,0.75)] animate-[diamond-sparkle_3.8s_ease-in-out_infinite]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                            </svg>
                            <svg
                              className="absolute top-9 right-5 w-2 h-2 text-white/90 drop-shadow-[0_0_5px_rgba(224,242,254,0.8)] animate-[diamond-sparkle_3.1s_ease-in-out_infinite]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 2l2.2 4.6L19 9l-4.8 2.4L12 16l-2.2-4.6L5 9l4.8-2.4L12 2z" />
                            </svg>
                          </div>
                        )}
                        <div
                          className={`absolute inset-[12px] rounded-[14px] ${
                            isDiamond
                              ? "bg-gradient-to-br from-white/60 via-white/15 to-transparent"
                              : ""
                          } shadow-[inset_0_2px_5px_rgba(255,255,255,0.35),inset_0_-4px_8px_rgba(0,0,0,0.18)]`}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className={`text-[12px] ${isDiamond ? "font-extrabold" : "font-semibold"} tracking-widest uppercase ${tone.text}`}>
                            {badge.tier}
                          </div>
                          <div className={`text-[11px] ${isDiamond ? "font-semibold" : "font-bold"} ${tone.text}`}>
                            {badge.count} jobs
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-center text-xs font-semibold text-textDark dark:text-darkText">
                        {badge.skill}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
