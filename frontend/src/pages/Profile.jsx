import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile, logoutUser, uploadProfileImage, removeProfileImage } from "../api/authApi";
import { updateStudentSkills, getStudentOverview } from "../api/studentApi";
import { getJobs } from "../api/jobApi";
import { removeToken } from "../utils/auth";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [skillsError, setSkillsError] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [rankStats, setRankStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
  const navigate = useNavigate();

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
          const [overviewRes, jobsRes] = await Promise.all([
            getStudentOverview(),
            getJobs(),
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

          const savedIds = JSON.parse(localStorage.getItem("skilllink.savedJobs") || "[]");
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

  const handleUpload = async () => {
    if (!selectedImage) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
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
      ring: "from-primary/30 to-accent/60",
      core: "from-[#f3d2b9] to-[#c68b6a]",
      text: "text-[#5c3b2b]",
    },
    Silver: {
      ring: "from-light to-secondary/50",
      core: "from-[#d9dee6] to-[#9aa4b2]",
      text: "text-[#2b3745]",
    },
    Gold: {
      ring: "from-accent/50 to-primary/70",
      core: "from-[#f5e39a] to-[#d1a842]",
      text: "text-[#5a4306]",
    },
    Diamond: {
      ring: "from-[#8fe1ff] to-[#2f7eea]",
      core: "from-[#b8f4ff] to-[#4b9bff]",
      text: "text-[#0f3a6b]",
    },
  };
  const getBadgeTone = (tier) => badgePalette[tier] || badgePalette.Bronze;
  const nextBadge = badgeProgress?.[0] || null;

  const handleDownloadBadge = (badge) => {
    if (!badge) return;
    const title = `${badge.skill} ${badge.tier} Badge`;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="core" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="#f8fafc"/>
  <rect x="64" y="64" width="384" height="384" rx="72" fill="url(#ring)"/>
  <rect x="96" y="96" width="320" height="320" rx="60" fill="url(#core)"/>
  <text x="256" y="240" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="#1f2937">${badge.tier.toUpperCase()}</text>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#1f2937">${badge.count} jobs</text>
  <text x="256" y="332" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="#111827">${badge.skill}</text>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#6b7280">SkillLink</text>
</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
      <div className="container mx-auto px-4 py-8">
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

        <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
          <div className="mb-8 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-accent/30 dark:bg-darkBorder overflow-hidden flex items-center justify-center">
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
            <div className="flex-1">
              <p className="text-sm text-textDark/70 dark:text-darkText/70 mb-2">Profile Image</p>
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-textDark dark:text-darkText file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-secondary"
                />
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedImage || uploading}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={!user?.profileImage || uploading}
                  className="bg-light dark:bg-darkBorder text-textDark dark:text-darkText px-6 py-2 rounded-lg hover:bg-accent/30 dark:hover:bg-accent/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-textDark/70 dark:text-darkText/70">Email</p>
              <p className="text-lg font-semibold text-textDark dark:text-darkText break-all">{user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-textDark/70 dark:text-darkText/70">Role</p>
              <p className="text-lg font-semibold text-textDark dark:text-darkText">{user?.role || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-textDark/70 dark:text-darkText/70">Name</p>
              <p className="text-lg font-semibold text-textDark dark:text-darkText">{user?.name || user?.fullName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-textDark/70 dark:text-darkText/70">Joined</p>
              <p className="text-lg font-semibold text-textDark dark:text-darkText">{user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</p>
            </div>
          </div>

          {user?.role === "student" && (
            <div className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-6">
                  <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs tracking-widest text-textDark/60 dark:text-darkText/60">STUDENT RANK</p>
                        <div className="mt-2 text-3xl font-bold text-primary">{rankStats?.rankTier || "Bronze"}</div>
                        <div className="text-sm text-textDark/60 dark:text-darkText/60">Score {rankStats?.rankScore ?? 0}/100</div>
                      </div>
                      <div className="text-xs text-textDark/60 dark:text-darkText/60">
                        {rankStats?.rankPosition ? `Rank #${rankStats.rankPosition}` : "Unranked"}
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-light/70 dark:bg-darkBorder">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${rankStats?.rankScore ?? 0}%` }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded-xl bg-light/60 dark:bg-darkBorder/60 p-3">
                        <div className="text-xs text-textDark/60 dark:text-darkText/60">Jobs completed</div>
                        <div className="mt-1 text-lg font-semibold text-textDark dark:text-darkText">{completedJobs}</div>
                      </div>
                      <div className="rounded-xl bg-light/60 dark:bg-darkBorder/60 p-3">
                        <div className="text-xs text-textDark/60 dark:text-darkText/60">Current tier</div>
                        <div className="mt-1 text-lg font-semibold text-textDark dark:text-darkText">
                          {rankStats?.rankTier || "Bronze"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs tracking-widest text-textDark/60 dark:text-darkText/60">REVIEWS</p>
                        <div className="mt-2 text-3xl font-bold text-primary">{reviewSummary.average}★</div>
                        <div className="text-xs text-textDark/60 dark:text-darkText/60">{reviewSummary.count} reviews</div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-textDark/60 dark:text-darkText/60">Based on completed jobs</div>
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6">
                  <p className="text-xs tracking-widest text-textDark/60 dark:text-darkText/60">BADGES</p>
                  <div className="mt-3 flex items-start justify-between">
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
                  <div className="mt-6">
                    <p className="text-xs uppercase text-textDark/60 dark:text-darkText/60">Locked Badge</p>
                    <p className="text-base font-semibold text-textDark dark:text-darkText">
                      {badges.length > 0
                        ? `${badges[0].skill} ${badges[0].tier} Badge`
                        : "Complete jobs to unlock badges"}
                    </p>
                  </div>
                  {nextBadge && (
                    <div className="mt-3 text-xs text-textDark/60 dark:text-darkText/60">
                      Next badge: {nextBadge.skill} {nextBadge.nextTier} in {nextBadge.remaining} jobs
                    </div>
                  )}
                  <div className="mt-4 text-xs text-textDark/60 dark:text-darkText/60">Earn criteria: Bronze 4, Silver 8, Gold 20, Diamond 40 jobs per skill.</div>
                  {badges.length > 0 && (
                    <div className="mt-5 grid grid-cols-2 gap-4">
                      {badges.slice(0, 4).map((badge) => {
                        const tone = getBadgeTone(badge.tier);
                        return (
                          <div key={`${badge.skill}-${badge.tier}`} className="rounded-2xl bg-white/80 dark:bg-darkCard/80 border border-light/60 dark:border-darkBorder p-3">
                            <div className="relative mx-auto w-20 h-20">
                              <div className={`absolute inset-0 rounded-[18px] bg-gradient-to-br ${tone.ring}`} />
                              <div className={`absolute inset-[6px] rounded-[14px] bg-gradient-to-br ${tone.core} shadow-inner`} />
                              <div className="absolute inset-[10px] rounded-[10px] bg-black/20" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className={`text-[11px] font-semibold tracking-widest uppercase ${tone.text}`}>{badge.tier}</div>
                                <div className={`text-[10px] font-bold ${tone.text}`}>{badge.count} jobs</div>
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
                  )}
                  {badgeProgress.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs uppercase text-textDark/60 dark:text-darkText/60">Next badge progress</p>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {badgeProgress.map((item) => (
                          <div
                            key={`${item.skill}-${item.nextTier}`}
                            className="rounded-xl border border-light/60 dark:border-darkBorder bg-white/70 dark:bg-darkCard/70 p-3"
                          >
                            <div className="text-sm font-semibold text-textDark dark:text-darkText">{item.skill}</div>
                            <div className="text-xs text-textDark/60 dark:text-darkText/60">
                              {item.remaining} jobs left to reach {item.nextTier}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
                    {availableSkills.map((skill) => (
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
              <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-textDark dark:text-darkText">Recent reviews</h3>
                    <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-1">What clients say about you.</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-textDark dark:text-darkText">Saved jobs</h3>
                    <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-1">Quick access to jobs you saved.</p>
                  </div>
                  <Link to="/student/jobs?saved=1" className="text-primary font-semibold text-sm">View more</Link>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
