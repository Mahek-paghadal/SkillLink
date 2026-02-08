import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    applyToJob,
    archiveStudentApplication,
    clearStudentHistory,
    completeApplication,
    getJobs,
    getStudentApplications,
    getStudentHistory,
} from "../api/jobApi";
import { getStudentOverview } from "../api/studentApi";

const SAVED_JOBS_KEY = "skilllink.savedJobs";

const readSavedJobs = () => {
    try {
        const raw = localStorage.getItem(SAVED_JOBS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
};

const writeSavedJobs = (ids) => {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(ids));
};

const StudentJobs = () => {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [history, setHistory] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [cityFilter, setCityFilter] = useState("all");
    const [employmentFilter, setEmploymentFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const [tagFilters, setTagFilters] = useState([]);
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [savedJobIds, setSavedJobIds] = useState(readSavedJobs());
    const [visibleJobsCount, setVisibleJobsCount] = useState(8);

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
    const [searchParams] = useSearchParams();

    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const backendOrigin = apiBase.replace(/\/api\/?$/, "");

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchOverview = async () => {
            try {
                const res = await getStudentOverview();
                setOverview(res.data);
            } catch (error) {
                navigate("/");
            }
        };

        const fetchJobs = async () => {
            try {
                const res = await getJobs();
                setJobs(res.data || []);
            } catch (error) {
                setJobs([]);
            }
        };

        const fetchApplications = async () => {
            try {
                const res = await getStudentApplications();
                setApplications(res.data || []);
            } catch (error) {
                setApplications([]);
            }
        };

        const fetchHistory = async () => {
            try {
                const res = await getStudentHistory();
                setHistory(res.data || []);
            } catch (error) {
                setHistory([]);
            }
        };

        Promise.all([
            fetchOverview(),
            fetchJobs(),
            fetchApplications(),
            fetchHistory(),
        ]).finally(() => setLoading(false));
    }, [navigate]);

    useEffect(() => {
        const applyId = searchParams.get("apply");
        if (!applyId) return;
        const job = jobs.find((item) => item._id === applyId);
        if (!job) return;
        setApplyJobId(job._id);
        setApplyForm({
            fullName: overview?.profile?.name || "",
            email: overview?.profile?.email || "",
            phone: "",
            coverMessage: "",
            experience: "",
            resumeLink: "",
        });
        setResumeFile(null);
        setIncludeResume(false);
        setIncludePortfolio(false);
        setApplyMessages({});
    }, [searchParams, jobs, overview]);

    useEffect(() => {
        const savedParam = searchParams.get("saved");
        if (savedParam === "1") {
            setShowSavedOnly(true);
        }
    }, [searchParams]);

    const availableCities = useMemo(() => {
        const values = jobs
            .map((job) => job.location)
            .filter(Boolean)
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
        return ["all", ...Array.from(new Set(values))];
    }, [jobs]);

    const availableEmploymentTypes = useMemo(() => {
        const values = jobs
            .map((job) => job.employmentType)
            .filter(Boolean)
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
        return ["all", ...Array.from(new Set(values))];
    }, [jobs]);

    const availableLevels = useMemo(() => {
        const values = jobs
            .map((job) => job.level)
            .filter(Boolean)
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
        return ["all", ...Array.from(new Set(values))];
    }, [jobs]);

    const availableTags = useMemo(() => {
        const values = jobs.flatMap((job) => job.tags || []);
        return Array.from(new Set(values.filter(Boolean)));
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        let filtered = [...jobs];
        const term = searchTerm.trim().toLowerCase();
        if (term) {
            filtered = filtered.filter((job) => {
                const text = [
                    job.title,
                    job.description,
                    job.companyName,
                    job.location,
                    job.employmentType,
                    job.level,
                    ...(job.tags || []),
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return text.includes(term);
            });
        }

        if (cityFilter !== "all") {
            filtered = filtered.filter((job) => job.location === cityFilter);
        }

        if (employmentFilter !== "all") {
            filtered = filtered.filter((job) => job.employmentType === employmentFilter);
        }

        if (levelFilter !== "all") {
            filtered = filtered.filter((job) => job.level === levelFilter);
        }

        if (tagFilters.length > 0) {
            filtered = filtered.filter((job) => {
                const tags = job.tags || [];
                return tagFilters.every((tag) => tags.includes(tag));
            });
        }

        if (showSavedOnly) {
            filtered = filtered.filter((job) => savedJobIds.includes(job._id));
        }

        return filtered;
    }, [jobs, searchTerm, cityFilter, employmentFilter, levelFilter, tagFilters, showSavedOnly, savedJobIds]);

    useEffect(() => {
        setVisibleJobsCount(8);
    }, [searchTerm, cityFilter, employmentFilter, levelFilter, tagFilters, showSavedOnly]);

    const toggleSavedJob = (jobId) => {
        setSavedJobIds((prev) => {
            const next = prev.includes(jobId)
                ? prev.filter((id) => id !== jobId)
                : [...prev, jobId];
            writeSavedJobs(next);
            return next;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-darkBg">
                <div className="text-primary text-xl">Loading...</div>
            </div>
        );
    }

    const profile = overview?.profile;

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
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <p className="text-primary text-xs font-semibold tracking-widest">STUDENT JOBS</p>
                            <h2 className="text-3xl font-bold text-textDark dark:text-darkText mt-2">All jobs</h2>
                            <p className="text-textDark/60 dark:text-darkText/60 mt-2">
                                Browse, filter, and save jobs that match your interests.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search by title, company, tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        />
                        <select
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        >
                            {availableCities.map((city) => (
                                <option key={city} value={city}>
                                    {city === "all" ? "All cities" : city}
                                </option>
                            ))}
                        </select>
                        <select
                            value={employmentFilter}
                            onChange={(e) => setEmploymentFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        >
                            {availableEmploymentTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type === "all" ? "All employment types" : type}
                                </option>
                            ))}
                        </select>
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        >
                            {availableLevels.map((level) => (
                                <option key={level} value={level}>
                                    {level === "all" ? "All levels" : level}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => {
                                const active = tagFilters.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            setTagFilters((prev) =>
                                                prev.includes(tag)
                                                    ? prev.filter((item) => item !== tag)
                                                    : [...prev, tag]
                                            );
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs border ${
                                            active
                                                ? "bg-primary text-white border-primary"
                                                : "bg-light/80 dark:bg-darkBorder text-textDark/70 dark:text-darkText/70 border-light/60 dark:border-darkBorder"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="ml-auto flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSavedOnly((prev) => !prev)}
                                className="text-primary font-semibold text-sm"
                            >
                                {showSavedOnly ? "Show all jobs" : `Saved jobs (${savedJobIds.length})`}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setCityFilter("all");
                                    setEmploymentFilter("all");
                                    setLevelFilter("all");
                                    setTagFilters([]);
                                    setShowSavedOnly(false);
                                }}
                                className="text-textDark/60 dark:text-darkText/60 text-sm"
                            >
                                Reset filters
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">Jobs from clients</h3>
                        <span className="text-sm text-textDark/60 dark:text-darkText/60">{filteredJobs.length} jobs</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredJobs.length === 0 && (
                            <div className="text-textDark/60 dark:text-darkText/60">
                                No jobs match your filters.
                            </div>
                        )}
                        {filteredJobs.slice(0, visibleJobsCount).map((job, index) => {
                            const clientProfileImage = job?.createdBy?.profileImage
                                ? `${backendOrigin}${job.createdBy.profileImage}`
                                : "";
                            const clientInitial = (job.companyName || job.createdBy?.name || "Client").charAt(0);
                            const isSaved = savedJobIds.includes(job._id);
                            return (
                                <div key={job._id || `${job.title}-${index}`} className="rounded-2xl border border-light/60 dark:border-darkBorder p-5 bg-white/70 dark:bg-darkCard/70 hover:shadow-md transition">
                                    <div className="flex items-start justify-between gap-3">
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
                                                <p className="text-sm text-textDark/60 dark:text-darkText/60">
                                                    {job.companyName || "Client"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleSavedJob(job._id)}
                                            className={`p-2 rounded-full border ${isSaved ? "border-primary bg-primary/20" : "border-light/60 dark:border-darkBorder"}`}
                                            aria-label={isSaved ? "Unsave job" : "Save job"}
                                        >
                                            <svg
                                                className={`w-4 h-4 ${isSaved ? "text-primary" : "text-textDark/60 dark:text-darkText/60"}`}
                                                viewBox="0 0 24 24"
                                                fill={isSaved ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-sm text-textDark/70 dark:text-darkText/70 mt-3">
                                        {job.description}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                        <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.location || "Remote"}</span>
                                        <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.employmentType || "Flexible"}</span>
                                        <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.level || "Any level"}</span>
                                        {(job.tags || []).slice(0, 3).map((tag) => (
                                            <span key={tag} className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-primary font-semibold text-sm">{job.salary || "Budget discussed"}</div>
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
                                                setApplyMessage(job._id, { error: "", success: "" });
                                            }}
                                        >
                                            Apply
                                        </button>
                                    </div>
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
                                            {(applyMessages[job._id]?.error || applyMessages[job._id]?.success) && (
                                                <div className="mt-3">
                                                    {applyMessages[job._id]?.error && (
                                                        <div className="p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                                                            {applyMessages[job._id].error}
                                                        </div>
                                                    )}
                                                    {applyMessages[job._id]?.success && (
                                                        <div className="p-3 bg-accent/30 border border-accent text-primary rounded-lg text-sm">
                                                            {applyMessages[job._id].success}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                            <div className="mt-4 flex flex-col md:flex-row gap-3">
                                                <button
                                                    type="button"
                                                    disabled={applyLoading}
                                                    onClick={async () => {
                                                        setApplyLoading(true);
                                                        try {
                                                            const validationMessage = validateApplication();
                                                            if (validationMessage) {
                                                                setApplyMessage(job._id, { error: validationMessage, success: "" });
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
                                                            await applyToJob(job._id, formData);
                                                            setApplyMessage(job._id, { error: "", success: "Application submitted successfully." });
                                                            setApplyJobId(null);
                                                            setResumeFile(null);
                                                            setIncludeResume(false);
                                                            setIncludePortfolio(false);
                                                            const updatedApplications = await getStudentApplications();
                                                            setApplications(updatedApplications.data || []);
                                                        } catch (error) {
                                                            setApplyMessage(job._id, { error: error.response?.data?.message || "Failed to apply", success: "" });
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
                                                        setApplyMessage(job._id, { error: "", success: "" });
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
                {filteredJobs.length > visibleJobsCount && (
                    <div className="mt-6 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setVisibleJobsCount((prev) => prev + 4)}
                            className="text-primary font-semibold text-sm"
                        >
                            View more jobs
                        </button>
                    </div>
                )}

                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">Current applications</h3>
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

                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder mb-8">
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
            </div>
        </div>
    );
};

export default StudentJobs;
