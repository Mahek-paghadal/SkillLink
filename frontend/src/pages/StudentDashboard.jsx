import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { getStudentOverview } from "../api/studentApi";
import {
    getJobs,
    applyToJob,
    getStudentApplications,
    getStudentHistory,
    completeApplication,
    archiveStudentApplication,
    clearStudentHistory,
} from "../api/jobApi";

const StudentDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [applyJobId, setApplyJobId] = useState(null);
    const [applyForm, setApplyForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        coverMessage: "",
        experience: "",
        resumeLink: "",
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyError, setApplyError] = useState("");
    const [applySuccess, setApplySuccess] = useState("");
    const [applications, setApplications] = useState([]);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const backendOrigin = apiBase.replace(/\/api\/?$/, "");

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: "ease-out-cubic",
            once: false,
            mirror: true,
            offset: 120,
        });

        const fetchOverview = async () => {
            try {
                const res = await getStudentOverview();
                setOverview(res.data);
                if (!res.data?.hasSkills) {
                    navigate("/profile", { replace: true });
                    return;
                }
            } catch (error) {
                console.error("Failed to fetch student overview:", error);
                navigate("/");
            } finally {
                setLoading(false);
                setTimeout(() => AOS.refresh(), 50);
            }
        };
        const fetchJobs = async () => {
            try {
                const res = await getJobs();
                setJobs(res.data || []);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            }
        };
        const fetchApplications = async () => {
            try {
                const res = await getStudentApplications();
                setApplications(res.data || []);
            } catch (error) {
                console.error("Failed to fetch applications:", error);
            }
        };
        const fetchHistory = async () => {
            try {
                const res = await getStudentHistory();
                setHistory(res.data || []);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            }
        };
        fetchOverview();
        fetchJobs();
        fetchApplications();
        fetchHistory();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-darkBg">
                <div className="text-primary text-xl">Loading...</div>
            </div>
        );
    }

    const profile = overview?.profile;
    const stats = overview?.stats;
    const recommendations = overview?.recommendations || [];
    const insights = overview?.insights || [];

    return (
        <div className="min-h-screen bg-bgLight dark:bg-darkBg">
            <div className="container mx-auto px-4 py-8">
                {/* Hero */}
                <div className="bg-gradient-to-br from-white to-light/70 dark:from-darkCard dark:to-darkBorder rounded-3xl shadow-xl p-8 mb-8 border border-light/60 dark:border-darkBorder" data-aos="fade-up">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <p className="text-primary text-xs font-semibold tracking-widest">STUDENT DASHBOARD</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-textDark dark:text-darkText mt-2">
                                Welcome back{profile?.name ? `, ${profile.name}` : ""}
                            </h2>
                            <p className="text-textDark/70 dark:text-darkText/70 mt-2">
                                Your ML powered micro task hub with recommendations, insights, and trust signals.
                            </p>
                        </div>
                        <div className="w-full md:w-64 bg-inputBg dark:bg-darkCard rounded-2xl p-5 border border-light/60 dark:border-darkBorder">
                            <div className="text-sm text-textDark/70 dark:text-darkText/70">Profile completion</div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-2xl font-bold text-primary">{stats?.profileCompletion || 0}%</span>
                                <span className="text-xs text-textDark/60 dark:text-darkText/60">Updated</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-light/70 dark:bg-darkBorder">
                                <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{ width: `${stats?.profileCompletion || 0}%` }}
                                />
                            </div>
                            <Link to="/profile" className="mt-4 inline-block text-primary font-semibold text-sm">
                                Complete profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            label: "Match Score",
                            value: stats?.matchScore ? `${stats.matchScore}/100` : "-",
                            icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z" />
                            ),
                        },
                        {
                            label: "Reliability",
                            value: stats?.reliabilityScore ? `${stats.reliabilityScore}★` : "-",
                            icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.122 6.54a1 1 0 00.95.69h6.874c.969 0 1.371 1.24.588 1.81l-5.56 4.04a1 1 0 00-.364 1.118l2.122 6.54c.3.921-.755 1.688-1.54 1.118l-5.56-4.04a1 1 0 00-1.176 0l-5.56 4.04c-.784.57-1.838-.197-1.539-1.118l2.122-6.54a1 1 0 00-.364-1.118l-5.56-4.04c-.783-.57-.38-1.81.588-1.81h6.874a1 1 0 00.95-.69l2.122-6.54z" />
                            ),
                        },
                        {
                            label: "Recommendations",
                            value: stats?.totalRecommendations ?? 0,
                            icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                            ),
                        },
                        {
                            label: "Applications",
                            value: stats?.activeApplications ?? 0,
                            icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                            ),
                        },
                    ].map((card) => (
                        <div key={card.label} className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-sm p-6 border border-light/60 dark:border-darkBorder" data-aos="fade-up">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-textDark/70 dark:text-darkText/70 text-sm">{card.label}</p>
                                    <p className="text-2xl font-bold text-primary mt-1">{card.value}</p>
                                </div>
                                <div className="w-11 h-11 bg-accent/30 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {card.icon}
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {insights.map((insight) => (
                        <div key={insight.title} className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-sm p-6 border border-light/60 dark:border-darkBorder" data-aos="zoom-in">
                            <p className="text-xs text-textDark/60 dark:text-darkText/60">{insight.title}</p>
                            <p className="text-2xl font-bold text-primary mt-2">{insight.value}</p>
                            <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-2">{insight.hint}</p>
                        </div>
                    ))}
                </div>

                {/* Recommended Tasks (from skills) */}
                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder mb-8" data-aos="fade-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">Recommended micro tasks</h3>
                        <Link to="/profile" className="text-primary font-semibold text-sm">Update skills</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recommendations.map((job, index) => (
                            <div key={`${job.title}-${index}`} className="rounded-2xl border border-light/60 dark:border-darkBorder p-5 bg-white/70 dark:bg-darkCard/70 hover:shadow-md transition" data-aos="fade-up" data-aos-delay={index * 60}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">{job.title}</h4>
                                        <p className="text-sm text-textDark/60 dark:text-darkText/60">{job.company}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center text-primary font-bold">
                                        {job.company?.[0] || "S"}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.location}</span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.employmentType}</span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.level}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-primary font-semibold text-sm">{job.salary || "Budget suggested by ML"}</div>
                                    <button className="text-primary font-semibold text-sm">Apply</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Jobs from clients */}
                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder mb-8" data-aos="fade-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">Jobs from clients</h3>
                    </div>
                    {applyError && (
                        <div className="mb-4 p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                            {applyError}
                        </div>
                    )}
                    {applySuccess && (
                        <div className="mb-4 p-3 bg-accent/30 border border-accent text-primary rounded-lg text-sm">
                            {applySuccess}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {jobs.length === 0 && (
                            <div className="text-textDark/60 dark:text-darkText/60">No jobs available yet.</div>
                        )}
                        {jobs.map((job, index) => {
                            const clientProfileImage = job?.createdBy?.profileImage
                                ? `${backendOrigin}${job.createdBy.profileImage}`
                                : "";
                            const clientInitial = (job.companyName || job.createdBy?.name || "Client").charAt(0);
                            return (
                            <div key={job._id || `${job.title}-${index}`} className="rounded-2xl border border-light/60 dark:border-darkBorder p-5 bg-white/70 dark:bg-darkCard/70 hover:shadow-md transition" data-aos="fade-up" data-aos-delay={index * 60}>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center text-primary font-bold overflow-hidden">
                                        {clientProfileImage ? (
                                            <img
                                                src={clientProfileImage}
                                                alt={`${job.companyName || job.createdBy?.name || "Client"} profile`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            clientInitial || "C"
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">{job.title}</h4>
                                        <p className="text-sm text-textDark/60 dark:text-darkText/60">{job.companyName || "Client"}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-textDark/70 dark:text-darkText/70 mt-3">{job.description}</p>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.location || "Remote"}</span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.employmentType || "Flexible"}</span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.level || "Any level"}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-primary font-semibold text-sm">{job.salary || "Budget discussed"}</div>
                                    <button
                                        className="text-primary font-semibold text-sm"
                                        onClick={() => {
                                            setApplyJobId(job._id);
                                            setApplyForm({
                                                fullName: profile?.name || "",
                                                email: profile?.email || "",
                                                phone: "",
                                                coverMessage: "",
                                                experience: "",
                                                resumeLink: "",
                                            });
                                            setResumeFile(null);
                                            setApplyError("");
                                            setApplySuccess("");
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>

                                {applyJobId === job._id && (
                                    <div className="mt-5 border-t border-light/60 dark:border-darkBorder pt-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-semibold text-textDark dark:text-darkText">Application Form</h5>
                                            <button
                                                type="button"
                                                onClick={() => setApplyJobId(null)}
                                                className="text-sm font-semibold text-primary hover:text-secondary"
                                            >
                                                Close
                                            </button>
                                        </div>
                                        <div className="mt-3 space-y-3">
                                            <input
                                                type="text"
                                                value={applyForm.fullName}
                                                onChange={(e) => setApplyForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                                placeholder="Full name"
                                                className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                                            />
                                            <input
                                                type="email"
                                                value={applyForm.email}
                                                onChange={(e) => setApplyForm((prev) => ({ ...prev, email: e.target.value }))}
                                                placeholder="Email address"
                                                className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                                            />
                                            <input
                                                type="text"
                                                value={applyForm.phone}
                                                onChange={(e) => setApplyForm((prev) => ({ ...prev, phone: e.target.value }))}
                                                placeholder="Contact number"
                                                className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                                            />
                                            <textarea
                                                rows={3}
                                                value={applyForm.coverMessage}
                                                onChange={(e) => setApplyForm((prev) => ({ ...prev, coverMessage: e.target.value }))}
                                                placeholder="Cover message"
                                                className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                                            />
                                            <textarea
                                                rows={3}
                                                value={applyForm.experience}
                                                onChange={(e) => setApplyForm((prev) => ({ ...prev, experience: e.target.value }))}
                                                placeholder="Past experience (optional)"
                                                className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                                            />
                                            <input
                                                type="text"
                                                value={applyForm.resumeLink}
                                                onChange={(e) => setApplyForm((prev) => ({ ...prev, resumeLink: e.target.value }))}
                                                placeholder="Resume / portfolio link (optional)"
                                                className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                                            />
                                            <div className="space-y-2">
                                                <label className="text-sm text-textDark/70 dark:text-darkText/70">
                                                    Or upload resume (PDF/DOC, max 5MB)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                                    className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                                                />
                                                {resumeFile && (
                                                    <p className="text-xs text-textDark/60 dark:text-darkText/60">
                                                        Selected: {resumeFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-col md:flex-row gap-3">
                                            <button
                                                type="button"
                                                disabled={applyLoading}
                                                onClick={async () => {
                                                    setApplyLoading(true);
                                                    setApplyError("");
                                                    setApplySuccess("");
                                                    try {
                                                        const formData = new FormData();
                                                        Object.entries(applyForm).forEach(([key, value]) => {
                                                            formData.append(key, value || "");
                                                        });
                                                        if (resumeFile) {
                                                            formData.append("resume", resumeFile);
                                                        }
                                                        await applyToJob(job._id, formData);
                                                        setApplySuccess("Application submitted successfully.");
                                                        setApplyJobId(null);
                                                        setResumeFile(null);
                                                        const updatedApplications = await getStudentApplications();
                                                        setApplications(updatedApplications.data || []);
                                                    } catch (error) {
                                                        setApplyError(error.response?.data?.message || "Failed to apply");
                                                    } finally {
                                                        setApplyLoading(false);
                                                    }
                                                }}
                                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {applyLoading ? "Submitting..." : "Submit Application"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setApplyJobId(null);
                                                    setResumeFile(null);
                                                }}
                                                className="bg-light dark:bg-darkBorder text-textDark dark:text-darkText px-6 py-2 rounded-lg hover:bg-accent/30 dark:hover:bg-accent/20 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                </div>

                {/* My Applications */}
                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder mb-8" data-aos="fade-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">My applications</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {applications.filter((app) => app.status === "pending" || app.status === "hired").length === 0 && (
                            <div className="text-textDark/60 dark:text-darkText/60">No applications yet.</div>
                        )}
                        {applications
                            .filter((app) => app.status === "pending" || app.status === "hired")
                            .map((app) => (
                                <div key={app._id} className="rounded-2xl border border-light/60 dark:border-darkBorder p-5 bg-white/70 dark:bg-darkCard/70">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-lg text-textDark dark:text-darkText">
                                                {app.jobId?.title || "Job"}
                                            </h4>
                                            <p className="text-sm text-textDark/60 dark:text-darkText/60">
                                                {app.jobId?.companyName || "Client"}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            app.status === "hired"
                                                ? "bg-accent/40 text-primary"
                                                : "bg-accent/20 text-primary"
                                        }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                        <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{app.jobId?.location || "Remote"}</span>
                                        <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{app.jobId?.employmentType || "Flexible"}</span>
                                        <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{app.jobId?.level || "Any level"}</span>
                                    </div>
                                    {app.status === "hired" && (
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await completeApplication(app.jobId?._id, app._id);
                                                    const updatedApplications = await getStudentApplications();
                                                    const updatedHistory = await getStudentHistory();
                                                    setApplications(updatedApplications.data || []);
                                                    setHistory(updatedHistory.data || []);
                                                }}
                                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
                                            >
                                                Mark completed
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                {/* Job History */}
                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder mb-8" data-aos="fade-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">Job history</h3>
                        {history.length > 0 && (
                            <button
                                type="button"
                                onClick={async () => {
                                    await clearStudentHistory();
                                    setHistory([]);
                                }}
                                className="text-primary font-semibold text-sm"
                            >
                                Clear history
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {history.length === 0 && (
                            <div className="text-textDark/60 dark:text-darkText/60">No completed jobs yet.</div>
                        )}
                        {history.map((app) => (
                            <div key={app._id} className="rounded-2xl border border-light/60 dark:border-darkBorder p-5 bg-white/70 dark:bg-darkCard/70">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">
                                            {app.jobId?.title || "Job"}
                                        </h4>
                                        <p className="text-sm text-textDark/60 dark:text-darkText/60">
                                            {app.jobId?.companyName || "Client"}
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs bg-accent/40 text-primary">completed</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{app.jobId?.location || "Remote"}</span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{app.jobId?.employmentType || "Flexible"}</span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{app.jobId?.level || "Any level"}</span>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await archiveStudentApplication(app._id);
                                            setHistory((prev) => prev.filter((item) => item._id !== app._id));
                                        }}
                                        className="text-primary font-semibold text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
                    <Link to="/profile" className="bg-inputBg dark:bg-darkCard rounded-2xl p-6 border border-light/60 dark:border-darkBorder hover:shadow-md transition">
                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">Build your skill profile</h4>
                        <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-2">Add skills, availability, and portfolio.</p>
                    </Link>
                    <div className="bg-inputBg dark:bg-darkCard rounded-2xl p-6 border border-light/60 dark:border-darkBorder hover:shadow-md transition">
                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">Track applications</h4>
                        <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-2">View your responses and shortlists.</p>
                    </div>
                    <div className="bg-inputBg dark:bg-darkCard rounded-2xl p-6 border border-light/60 dark:border-darkBorder hover:shadow-md transition">
                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">Trust & safety</h4>
                        <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-2">Fraud checks and verified clients only.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
