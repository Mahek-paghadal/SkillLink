import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { getStudentOverview } from "../api/studentApi";
import {
    getJobs,
    applyToJob,
    getStudentApplications,
} from "../api/jobApi";

const StudentDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
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
    const [includeResume, setIncludeResume] = useState(false);
    const [includePortfolio, setIncludePortfolio] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyMessages, setApplyMessages] = useState({});
    const [applySkillWarning, setApplySkillWarning] = useState("");
    const [modelRecommendations, setModelRecommendations] = useState([]);
    const [modelLoading, setModelLoading] = useState(false);
    const [modelError, setModelError] = useState("");
    const [overviewError, setOverviewError] = useState("");
    const [showAllRecommendations, setShowAllRecommendations] = useState(false);
    const navigate = useNavigate();
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const backendOrigin = apiBase.replace(/\/api\/?$/, "");
    const modelApiBase =
        process.env.REACT_APP_JOB_RECOMMENDATION_API_URL || "http://localhost:8000";

    useEffect(() => {
        window.scrollTo(0, 0);
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
                setOverviewError("");
            } catch (error) {
                console.error("Failed to fetch student overview:", error);
                setOverviewError("Failed to load dashboard data. Please try again.");
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
        fetchOverview();
        fetchJobs();
        fetchApplications();
    }, [navigate]);

    useEffect(() => {
        const fetchModelRecommendations = async () => {
            const skills = overview?.studentProfile?.skills || [];
            if (skills.length === 0) {
                setModelRecommendations([]);
                return;
            }

            if (!jobs || jobs.length === 0) {
                setModelRecommendations([]);
                return;
            }

            setModelLoading(true);
            setModelError("");
            try {
                const base = modelApiBase.replace(/\/$/, "");
                const jobPayload = jobs.map((job) => ({
                    id: job._id,
                    title: job.title,
                    description: job.description,
                    company: job.companyName || job.createdBy?.name || "",
                    location: job.location,
                    employmentType: job.employmentType,
                    level: job.level,
                    salary: job.salary,
                    tags: job.tags || [],
                }));
                const response = await fetch(`${base}/recommendations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ skills, limit: 20, jobs: jobPayload }),
                });

                if (!response.ok) {
                    throw new Error("Failed to load model recommendations");
                }

                const data = await response.json();
                setModelRecommendations(data.recommendations || []);
            } catch (error) {
                console.error("Model recommendation error:", error);
                setModelError("Model recommendations are unavailable right now.");
                setModelRecommendations([]);
            } finally {
                setModelLoading(false);
            }
        };

        fetchModelRecommendations();
    }, [overview, modelApiBase, jobs]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-darkBg">
                <div className="text-primary text-xl">Loading...</div>
            </div>
        );
    }

    const profile = overview?.profile;
    const stats = overview?.stats;
    const filteredRecommendations = (modelRecommendations || []).filter(
        (job) => (job.score ?? 0) > 0
    );
    const hasMoreRecommendations = filteredRecommendations.length > 4;
    const recommendationCount = overview?.hasSkills
        ? filteredRecommendations.length
        : (stats?.totalRecommendations ?? 0);
    const recommendations = showAllRecommendations
        ? filteredRecommendations
        : filteredRecommendations.slice(0, 4);
    const appliedJobIds = new Set((applications || []).map((app) => app.jobId?._id || app.jobId));

    const setApplyMessage = (jobId, message) => {
        setApplyMessages((prev) => ({
            ...prev,
            [jobId]: message,
        }));
    };

    const validateApplication = () => {
        if (!applyForm.fullName.trim() || !applyForm.email.trim() || !applyForm.phone.trim() || !applyForm.coverMessage.trim()) {
            return "Please fill all required fields.";
        }
        if (!includeResume && !includePortfolio) {
            return "Please provide a resume upload or a portfolio link.";
        }
        if (includeResume && !resumeFile) {
            return "Please upload your resume file.";
        }
        if (includePortfolio && !applyForm.resumeLink.trim()) {
            return "Please add your portfolio link.";
        }
        return "";
    };

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
                            <Link to="/student/profile" className="mt-4 inline-block text-primary font-semibold text-sm">
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
                            value: recommendationCount,
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

                {overviewError && (
                    <div className="mb-8 p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                        {overviewError}
                    </div>
                )}


                {/* Recommended Tasks (from skills) */}
                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder mb-8" data-aos="fade-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">Recommended micro tasks</h3>
                        <Link to="/student/skills" className="text-primary font-semibold text-sm">Update skills</Link>
                    </div>
                    {modelError && (
                        <div className="mb-4 p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                            {modelError}
                        </div>
                    )}
                    {!overview?.hasSkills && (
                        <div className="mb-6 rounded-2xl border border-light/60 dark:border-darkBorder bg-white/70 dark:bg-darkCard/70 p-5">
                            <p className="text-sm text-textDark/70 dark:text-darkText/70">Add skills to unlock personalized recommendations.</p>
                            <p className="text-xs text-textDark/50 dark:text-darkText/50 mt-1">We match jobs based on your skills and interests.</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modelLoading && (
                            <div className="text-textDark/60 dark:text-darkText/60">Loading recommendations...</div>
                        )}
                        {!modelLoading && overview?.hasSkills && recommendations.length === 0 && (
                            <div className="text-textDark/60 dark:text-darkText/60">No matches found.</div>
                        )}
                        {recommendations.map((job, index) => (
                            (() => {
                                const isApplied = job.id ? appliedJobIds.has(job.id) : false;
                                return (
                            <div key={`${job.title}-${index}`} className="rounded-2xl border border-light/60 dark:border-darkBorder p-5 bg-white/70 dark:bg-darkCard/70 hover:shadow-md transition" data-aos="fade-up" data-aos-delay={index * 60}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">{job.title}</h4>
                                        <p className="text-sm text-textDark/60 dark:text-darkText/60">
                                            {job.company || "Recommendation"}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center text-primary font-bold">
                                        {(job.company || "R").charAt(0)}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">
                                        {job.location || job.position || "Role match"}
                                    </span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">
                                        {job.employmentType || "Model"}
                                    </span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">
                                        {job.level || (job.score ? `Score ${Math.round(job.score * 100) / 100}` : "Match")}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-primary font-semibold text-sm flex items-center">
                                        <span className="mr-2 inline-flex items-center justify-center w-5 h-5 rounded-full border border-amber-400 text-[10px] font-bold text-amber-700 bg-amber-100">
                                            ₹
                                        </span>
                                        {job.salary || "Budget suggested by ML"}
                                    </div>
                                    {isApplied ? (
                                        <span className="text-xs font-semibold text-primary">Applied</span>
                                    ) : (
                                        <button
                                            className="text-primary font-semibold text-sm"
                                            onClick={() => {
                                                if (!overview?.hasSkills) {
                                                    setApplySkillWarning("Add skills to apply for jobs.");
                                                    return;
                                                }
                                                if (!job.id) {
                                                    return;
                                                }
                                                setApplySkillWarning("");
                                                setApplyJobId(job.id);
                                                setApplyForm({
                                                    fullName: profile?.name || "",
                                                    email: profile?.email || "",
                                                    phone: "",
                                                    coverMessage: "",
                                                    experience: "",
                                                    resumeLink: "",
                                                });
                                                setResumeFile(null);
                                                setIncludeResume(false);
                                                setIncludePortfolio(false);
                                                setApplyMessage(job.id, { error: "", success: "" });
                                            }}
                                        >
                                            Apply
                                        </button>
                                    )}
                                </div>
                                {applyMessages[job.id]?.success && (
                                    <div className="mt-3 text-xs text-primary">{applyMessages[job.id].success}</div>
                                )}
                            </div>
                                );
                            })()
                        ))}
                    </div>
                        {hasMoreRecommendations && (
                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                    onClick={() => setShowAllRecommendations((prev) => !prev)}
                                className="text-primary font-semibold text-sm"
                            >
                                {showAllRecommendations ? "View less" : "View more"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Jobs from clients */}
                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder mb-8" data-aos="fade-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">Jobs from clients</h3>
                        <Link
                            to="/student/jobs"
                            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-secondary transition"
                        >
                            Explore more
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {jobs.length === 0 && (
                            <div className="text-textDark/60 dark:text-darkText/60">No jobs available yet.</div>
                        )}
                        {jobs.slice(0, 4).map((job, index) => {
                            const clientProfileImage = job?.createdBy?.profileImage
                                ? `${backendOrigin}${job.createdBy.profileImage}`
                                : "";
                            const clientInitial = (job.companyName || job.createdBy?.name || "Client").charAt(0);
                            const isApplied = appliedJobIds.has(job._id);
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
                                    <div className="text-primary font-semibold text-sm flex items-center">
                                        <span className="mr-2 inline-flex items-center justify-center w-5 h-5 rounded-full border border-amber-400 text-[10px] font-bold text-amber-700 bg-amber-100">
                                            ₹
                                        </span>
                                        {job.salary || "Budget discussed"}
                                    </div>
                                    {isApplied ? (
                                        <span className="text-xs font-semibold text-primary">Applied</span>
                                    ) : (
                                        <button
                                            className="text-primary font-semibold text-sm"
                                            onClick={() => {
                                                if (!overview?.hasSkills) {
                                                    setApplySkillWarning("Add skills to apply for jobs.");
                                                    return;
                                                }
                                                setApplySkillWarning("");
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
                                                setIncludeResume(false);
                                                setIncludePortfolio(false);
                                                setApplyMessage(job._id, { error: "", success: "" });
                                            }}
                                        >
                                            Apply
                                        </button>
                                    )}
                                </div>
                                {applyMessages[job._id]?.success && (
                                    <div className="mt-3 text-xs text-primary">{applyMessages[job._id].success}</div>
                                )}
                                {applySkillWarning && (
                                    <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3">
                                        <span className="text-sm text-textDark/70 dark:text-darkText/70">
                                            {applySkillWarning}
                                        </span>
                                        <Link to="/student/skills" className="text-primary font-semibold text-sm">
                                            Add skills
                                        </Link>
                                    </div>
                                )}

                            </div>
                            );
                        })}
                    </div>
                </div>


                {applyJobId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                        <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-darkCard shadow-2xl border border-light/60 dark:border-darkBorder p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-xl font-bold text-textDark dark:text-darkText">Application Form</h4>
                                    <p className="text-sm text-textDark/60 dark:text-darkText/60">
                                        {(recommendations.find((item) => item.id === applyJobId)?.title
                                            || jobs.find((item) => item._id === applyJobId)?.title
                                            || "Job")}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setApplyJobId(null);
                                        setResumeFile(null);
                                        setIncludeResume(false);
                                        setIncludePortfolio(false);
                                        setApplyMessage(applyJobId, { error: "", success: "" });
                                    }}
                                    className="text-sm font-semibold text-primary hover:text-secondary"
                                >
                                    Close
                                </button>
                            </div>
                            {(applyMessages[applyJobId]?.error || applyMessages[applyJobId]?.success) && (
                                <div className="mt-3">
                                    {applyMessages[applyJobId]?.error && (
                                        <div className="p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                                            {applyMessages[applyJobId].error}
                                        </div>
                                    )}
                                    {applyMessages[applyJobId]?.success && (
                                        <div className="p-3 bg-accent/30 border border-accent text-primary rounded-lg text-sm">
                                            {applyMessages[applyJobId].success}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mt-4 space-y-3">
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
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-4 text-sm text-textDark/70 dark:text-darkText/70">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={includeResume}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setIncludeResume(checked);
                                                    if (!checked) {
                                                        setResumeFile(null);
                                                    }
                                                }}
                                                className="accent-primary"
                                            />
                                            Resume upload
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={includePortfolio}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setIncludePortfolio(checked);
                                                    if (!checked) {
                                                        setApplyForm((prev) => ({ ...prev, resumeLink: "" }));
                                                    }
                                                }}
                                                className="accent-primary"
                                            />
                                            Portfolio link
                                        </label>
                                    </div>
                                    {includeResume && (
                                        <div className="space-y-2">
                                            <label className="text-sm text-textDark/70 dark:text-darkText/70">
                                                Upload resume (PDF/DOC, max 5MB)
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
                                    )}
                                    {includePortfolio && (
                                        <input
                                            type="text"
                                            value={applyForm.resumeLink}
                                            onChange={(e) => setApplyForm((prev) => ({ ...prev, resumeLink: e.target.value }))}
                                            placeholder="Portfolio link"
                                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="mt-5 flex flex-col md:flex-row gap-3">
                                <button
                                    type="button"
                                    disabled={applyLoading}
                                    onClick={async () => {
                                        setApplyLoading(true);
                                        setApplyMessage(applyJobId, { error: "", success: "" });
                                        try {
                                            const validationMessage = validateApplication();
                                            if (validationMessage) {
                                                setApplyMessage(applyJobId, { error: validationMessage, success: "" });
                                                return;
                                            }
                                            const formData = new FormData();
                                            const payload = {
                                                ...applyForm,
                                                resumeLink: includePortfolio ? applyForm.resumeLink : "",
                                            };
                                            Object.entries(payload).forEach(([key, value]) => {
                                                formData.append(key, value || "");
                                            });
                                            if (includeResume && resumeFile) {
                                                formData.append("resume", resumeFile);
                                            }
                                            await applyToJob(applyJobId, formData);
                                            setApplyMessage(applyJobId, { error: "", success: "Application submitted successfully." });
                                            setApplyJobId(null);
                                            setResumeFile(null);
                                            setIncludeResume(false);
                                            setIncludePortfolio(false);
                                            const updatedApplications = await getStudentApplications();
                                            setApplications(updatedApplications.data || []);
                                        } catch (error) {
                                            setApplyMessage(applyJobId, { error: error.response?.data?.message || "Failed to apply", success: "" });
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
                                        setIncludeResume(false);
                                        setIncludePortfolio(false);
                                        setApplyMessage(applyJobId, { error: "", success: "" });
                                    }}
                                    className="bg-light dark:bg-darkBorder text-textDark dark:text-darkText px-6 py-2 rounded-lg hover:bg-accent/30 dark:hover:bg-accent/20 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
                    <Link to="/student/profile" className="bg-inputBg dark:bg-darkCard rounded-2xl p-6 border border-light/60 dark:border-darkBorder hover:shadow-md transition">
                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">Build your skill profile</h4>
                        <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-2">Add skills, availability, and portfolio.</p>
                    </Link>
                    <Link to="/student/jobs" className="bg-inputBg dark:bg-darkCard rounded-2xl p-6 border border-light/60 dark:border-darkBorder hover:shadow-md transition">
                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">Track applications</h4>
                        <p className="text-textDark/60 dark:text-darkText/60 text-sm mt-2">View your responses and shortlists.</p>
                    </Link>
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
