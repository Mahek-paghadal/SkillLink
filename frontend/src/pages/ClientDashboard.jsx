import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/authApi";
import {
    createJob,
    deleteJob,
    getApplicants,
    getClientJobs,
    getJobRoles,
    getShareableStudents,
    hireApplicant,
    rejectApplicant,
    closeJob,
    updateJob,
    submitClientReview,
} from "../api/jobApi";

const ClientDashboard = () => {
    const EMPLOYMENT_OPTIONS = [
        "Part Time Onsite",
        "Part Time Remote",
        "Full Time Onsite",
        "Full Time Remote",
    ];
    const LEVEL_OPTIONS = ["Easy", "Medium", "Hard"];
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        employmentType: "",
        level: "",
        salary: "",
        jobRole: "",
        companyName: "",
    });
    const [editingJobId, setEditingJobId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [applicantsByJob, setApplicantsByJob] = useState({});
    const [reviewForms, setReviewForms] = useState({});
    const [reviewSubmitting, setReviewSubmitting] = useState({});
    const [reviewErrors, setReviewErrors] = useState({});
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareMode, setShareMode] = useState("global");
    const [shareStudents, setShareStudents] = useState([]);
    const [shareLoading, setShareLoading] = useState(false);
    const [shareError, setShareError] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [jobRoleOptions, setJobRoleOptions] = useState([]);
    const [jobRoleLoading, setJobRoleLoading] = useState(false);
    const [jobRoleError, setJobRoleError] = useState("");
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate();
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    const backendOrigin = apiBase.replace(/\/api\/?$/, "");

    const fetchJobs = async () => {
        try {
            const res = await getClientJobs({ status: "open" });
            setJobs(res.data || []);
        } catch (e) {
            console.error("Failed to load jobs:", e);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                setUser(res.data);
                setForm((prev) => ({ ...prev, companyName: res.data?.name || "" }));
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
        fetchJobs();
    }, [navigate]);

    useEffect(() => {
        const fetchRoles = async () => {
            setJobRoleLoading(true);
            setJobRoleError("");
            try {
                const res = await getJobRoles();
                setJobRoleOptions(res.data?.roles || []);
            } catch (e) {
                setJobRoleOptions([]);
                setJobRoleError("Failed to load job roles");
            } finally {
                setJobRoleLoading(false);
            }
        };
        fetchRoles();
    }, []);

    const notifyJobsUpdated = () => {
        window.dispatchEvent(new Event("jobs-updated"));
    };

    useEffect(() => {
        if (!showShareModal || shareMode !== "targeted") return;
        const fetchShareStudents = async () => {
            setShareLoading(true);
            setShareError("");
            try {
                const res = await getShareableStudents();
                setShareStudents(res.data?.students || []);
            } catch (e) {
                setShareStudents([]);
                setShareError(e.response?.data?.message || "Failed to load students");
            } finally {
                setShareLoading(false);
            }
        };
        fetchShareStudents();
    }, [showShareModal, shareMode]);

    useEffect(() => {
        if (!openDropdown) return;
        const handleOutsideClick = (event) => {
            if (event.target.closest("[data-dropdown-root]")) return;
            setOpenDropdown(null);
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [openDropdown]);

    const toggleStudentSelection = (studentId) => {
        setSelectedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            location: "",
            employmentType: "",
            level: "",
            salary: "",
            jobRole: "",
            companyName: user?.name || "",
        });
        setEditingJobId(null);
    };

    const submitJob = async ({ visibility, allowedStudents }) => {
        setError("");
        if (!form.title || !form.description) {
            setError("Title and description are required.");
            return false;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                tags: form.jobRole ? [form.jobRole] : [],
            };
            if (visibility === "targeted") {
                payload.visibility = "targeted";
                payload.allowedStudents = allowedStudents || [];
            }
            await createJob(payload);
            await fetchJobs();
            notifyJobsUpdated();
            resetForm();
            return true;
        } catch (e) {
            setError(e.response?.data?.message || "Failed to save job");
            return false;
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bgLight dark:bg-darkBg">
                <div className="text-primary text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bgLight dark:bg-darkBg">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">
                                Welcome to your dashboard
                            </h2>
                            <p className="text-textDark/70 dark:text-darkText/70">Client Account</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/client/jobs")}
                            className="px-4 py-2 rounded-full border border-primary text-primary font-semibold text-sm hover:bg-primary/10 transition"
                        >
                            View all jobs
                        </button>
                    </div>
                </div>

                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">
                            {editingJobId ? "Edit Job" : "Add a Job"}
                        </h3>
                        {editingJobId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-primary font-semibold text-sm"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                    {error && (
                        <div className="mb-4 p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Job title"
                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        />
                        <input
                            type="text"
                            value={form.companyName}
                            onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                            placeholder="Company / Client name"
                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        />
                        <input
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                            placeholder="Location"
                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        />
                        <div className="relative" data-dropdown-root>
                            <button
                                type="button"
                                onClick={() => setOpenDropdown((prev) => (prev === "employmentType" ? null : "employmentType"))}
                                className="w-full flex items-center justify-between px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg text-left transition text-textDark dark:text-darkText hover:border-primary"
                            >
                                <span className={form.employmentType ? "text-textDark dark:text-darkText" : "text-textDark/50 dark:text-darkText/50"}>
                                    {form.employmentType || "Employment time/type"}
                                </span>
                                <svg className={`h-4 w-4 text-textDark/60 dark:text-darkText/60 transition ${openDropdown === "employmentType" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openDropdown === "employmentType" && (
                                <div className="absolute z-20 mt-2 w-full rounded-xl border border-light/60 dark:border-darkBorder bg-white dark:bg-darkCard shadow-lg overflow-hidden">
                                    {EMPLOYMENT_OPTIONS.map((option) => (
                                        <button
                                            type="button"
                                            key={option}
                                            onClick={() => {
                                                setForm((prev) => ({ ...prev, employmentType: option }));
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition ${
                                                form.employmentType === option
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-textDark dark:text-darkText hover:bg-light/60 dark:hover:bg-darkBorder/60"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative" data-dropdown-root>
                            <button
                                type="button"
                                onClick={() => setOpenDropdown((prev) => (prev === "level" ? null : "level"))}
                                className="w-full flex items-center justify-between px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg text-left transition text-textDark dark:text-darkText hover:border-primary"
                            >
                                <span className={form.level ? "text-textDark dark:text-darkText" : "text-textDark/50 dark:text-darkText/50"}>
                                    {form.level || "Level"}
                                </span>
                                <svg className={`h-4 w-4 text-textDark/60 dark:text-darkText/60 transition ${openDropdown === "level" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openDropdown === "level" && (
                                <div className="absolute z-20 mt-2 w-full rounded-xl border border-light/60 dark:border-darkBorder bg-white dark:bg-darkCard shadow-lg overflow-hidden">
                                    {LEVEL_OPTIONS.map((option) => (
                                        <button
                                            type="button"
                                            key={option}
                                            onClick={() => {
                                                setForm((prev) => ({ ...prev, level: option }));
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition ${
                                                form.level === option
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-textDark dark:text-darkText hover:bg-light/60 dark:hover:bg-darkBorder/60"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            value={form.salary}
                            onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))}
                            placeholder="Salary / Budget"
                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        />
                        <div className="relative" data-dropdown-root>
                            <button
                                type="button"
                                onClick={() => setOpenDropdown((prev) => (prev === "jobRole" ? null : "jobRole"))}
                                className="w-full flex items-center justify-between px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg text-left transition text-textDark dark:text-darkText hover:border-primary"
                            >
                                <span className={form.jobRole ? "text-textDark dark:text-darkText" : "text-textDark/50 dark:text-darkText/50"}>
                                    {form.jobRole || "Job role"}
                                </span>
                                <svg className={`h-4 w-4 text-textDark/60 dark:text-darkText/60 transition ${openDropdown === "jobRole" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openDropdown === "jobRole" && (
                                <div className="absolute z-20 mt-2 w-full rounded-xl border border-light/60 dark:border-darkBorder bg-white dark:bg-darkCard shadow-lg overflow-hidden">
                                    {jobRoleLoading && (
                                        <div className="px-4 py-2 text-sm text-textDark/60 dark:text-darkText/60">Loading...</div>
                                    )}
                                    {!jobRoleLoading && jobRoleOptions.length === 0 && (
                                        <div className="px-4 py-2 text-sm text-textDark/60 dark:text-darkText/60">
                                            {jobRoleError || "No job roles available"}
                                        </div>
                                    )}
                                    {jobRoleOptions.map((option) => (
                                        <button
                                            type="button"
                                            key={option}
                                            onClick={() => {
                                                setForm((prev) => ({ ...prev, jobRole: option }));
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition ${
                                                form.jobRole === option
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-textDark dark:text-darkText hover:bg-light/60 dark:hover:bg-darkBorder/60"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Job description"
                        className="mt-4 w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                    />
                    <div className="mt-4 flex flex-col md:flex-row gap-3">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={async () => {
                                if (editingJobId) {
                                    setError("");
                                    if (!form.title || !form.description) {
                                        setError("Title and description are required.");
                                        return;
                                    }
                                    setSaving(true);
                                    try {
                                        const payload = {
                                            ...form,
                                            tags: form.jobRole ? [form.jobRole] : [],
                                        };
                                        await updateJob(editingJobId, payload);
                                        await fetchJobs();
                                        notifyJobsUpdated();
                                        resetForm();
                                    } catch (e) {
                                        setError(e.response?.data?.message || "Failed to save job");
                                    } finally {
                                        setSaving(false);
                                    }
                                    return;
                                }

                                setShareError("");
                                setShareMode("global");
                                setSelectedStudentIds([]);
                                setShowShareModal(true);
                            }}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? "Saving..." : editingJobId ? "Update Job" : "Add Job"}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-light dark:bg-darkBorder text-textDark dark:text-darkText px-6 py-2 rounded-lg hover:bg-accent/30 dark:hover:bg-accent/20 transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-textDark dark:text-darkText mb-6">Your Jobs</h3>
                    {jobs.length === 0 && (
                        <div className="text-textDark/60 dark:text-darkText/60">No jobs created yet.</div>
                    )}
                    <div className="space-y-6">
                        {jobs.map((job) => (
                            <div key={job._id} className="rounded-2xl border border-light/60 dark:border-darkBorder p-6 bg-white/70 dark:bg-darkCard/70">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div>
                                        <h4 className="font-semibold text-xl text-textDark dark:text-darkText">{job.title}</h4>
                                        <p className="text-sm text-textDark/60 dark:text-darkText/60">{job.companyName || "Client"}</p>
                                        <p className="text-textDark/70 dark:text-darkText/70 mt-2">{job.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.location || "Remote"}</span>
                                            <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.employmentType || "Flexible"}</span>
                                            <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.level || "Any level"}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingJobId(job._id);
                                                setForm({
                                                    title: job.title || "",
                                                    description: job.description || "",
                                                    location: job.location || "",
                                                    employmentType: job.employmentType || "",
                                                    level: job.level || "",
                                                    salary: job.salary || "",
                                                    jobRole: (job.tags || [])[0] || "",
                                                    companyName: job.companyName || user?.name || "",
                                                });
                                                setError("");
                                            }}
                                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                await deleteJob(job._id);
                                                await fetchJobs();
                                                notifyJobsUpdated();
                                                setApplicantsByJob((prev) => {
                                                    const next = { ...prev };
                                                    delete next[job._id];
                                                    return next;
                                                });
                                            }}
                                            className="bg-light dark:bg-darkBorder text-textDark dark:text-darkText px-4 py-2 rounded-lg hover:bg-accent/30 dark:hover:bg-accent/20 transition"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                await closeJob(job._id);
                                                await fetchJobs();
                                                notifyJobsUpdated();
                                            }}
                                            className="text-primary font-semibold"
                                        >
                                            Close job
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (applicantsByJob[job._id]) {
                                                    setApplicantsByJob((prev) => {
                                                        const next = { ...prev };
                                                        delete next[job._id];
                                                        return next;
                                                    });
                                                    return;
                                                }
                                                const res = await getApplicants(job._id);
                                                setApplicantsByJob((prev) => ({
                                                    ...prev,
                                                    [job._id]: res.data,
                                                }));
                                            }}
                                            className="text-primary font-semibold"
                                        >
                                            {applicantsByJob[job._id] ? "Hide applicants" : "View applicants"}
                                        </button>
                                    </div>
                                </div>

                                {applicantsByJob[job._id] && (
                                    <div className="mt-5 border-t border-light/60 dark:border-darkBorder pt-4">
                                        <h5 className="font-semibold text-textDark dark:text-darkText">Applicants</h5>
                                        {(applicantsByJob[job._id].applications || []).length === 0 && (
                                            <div className="text-textDark/60 dark:text-darkText/60 text-sm mt-2">No applicants yet.</div>
                                        )}
                                        <div className="mt-3 space-y-3">
                                            {(applicantsByJob[job._id].applications || []).map((app) => {
                                                const studentProfileImage = app?.studentId?.profileImage
                                                    ? `${backendOrigin}${app.studentId.profileImage}`
                                                    : "";
                                                const studentInitial = (app.studentName || app.studentId?.name || "Student").charAt(0);
                                                const currentReview = reviewForms[app._id] || { rating: 5, review: "" };
                                                return (
                                                <div key={app._id} className="rounded-xl border border-light/60 dark:border-darkBorder p-4 bg-inputBg dark:bg-darkCard">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-primary font-semibold overflow-hidden">
                                                                {studentProfileImage ? (
                                                                    <img
                                                                        src={studentProfileImage}
                                                                        alt={`${app.studentName || app.studentId?.name || "Student"} profile`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    studentInitial || "S"
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-textDark dark:text-darkText">
                                                                    {app.studentName || app.studentId?.name || "Student"}
                                                                </p>
                                                                <p className="text-sm text-textDark/60 dark:text-darkText/60">
                                                                    {app.studentEmail || app.studentId?.email || ""}
                                                                </p>
                                                                <p className="text-xs text-textDark/60 dark:text-darkText/60">
                                                                    {app.contactNumber || ""}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                app.status === "hired"
                                                                    ? "bg-accent/40 text-primary"
                                                                    : "bg-accent/20 text-primary"
                                                            }`}>
                                                                {app.status}
                                                            </span>
                                                            {app.status !== "hired" && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={async () => {
                                                                            await hireApplicant(job._id, app._id);
                                                                            const res = await getApplicants(job._id);
                                                                            setApplicantsByJob((prev) => ({
                                                                                ...prev,
                                                                                [job._id]: res.data,
                                                                            }));
                                                                            await fetchJobs();
                                                                            notifyJobsUpdated();
                                                                        }}
                                                                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
                                                                    >
                                                                        Hire
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={async () => {
                                                                            await rejectApplicant(job._id, app._id);
                                                                            setApplicantsByJob((prev) => ({
                                                                                ...prev,
                                                                                [job._id]: {
                                                                                    ...(prev[job._id] || {}),
                                                                                    applications: (prev[job._id]?.applications || []).filter(
                                                                                        (item) => item._id !== app._id
                                                                                    ),
                                                                                },
                                                                            }));
                                                                        }}
                                                                        className="bg-light dark:bg-darkBorder text-textDark dark:text-darkText px-4 py-2 rounded-lg hover:bg-accent/30 dark:hover:bg-accent/20 transition"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {(app.studentSkills || []).length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {app.studentSkills.map((skill) => (
                                                                <span key={skill} className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder text-xs">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {app.experience && (
                                                        <p className="text-sm text-textDark/70 dark:text-darkText/70 mt-2">
                                                            {app.experience}
                                                        </p>
                                                    )}
                                                    {app.coverMessage && (
                                                        <p className="text-sm text-textDark/70 dark:text-darkText/70 mt-3">{app.coverMessage}</p>
                                                    )}
                                                    {app.status === "completed" && (
                                                        <div className="mt-4 border-t border-light/60 dark:border-darkBorder pt-4">
                                                            <h6 className="text-sm font-semibold text-textDark dark:text-darkText">Client review</h6>
                                                            {app.clientRating ? (
                                                                <div className="mt-2 text-sm text-textDark/70 dark:text-darkText/70">
                                                                    <div>Rating: {app.clientRating}★</div>
                                                                    {app.clientReview && (
                                                                        <div className="mt-1">{app.clientReview}</div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="mt-3 space-y-3">
                                                                    {reviewErrors[app._id] && (
                                                                        <div className="p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                                                                            {reviewErrors[app._id]}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <label className="text-sm text-textDark/70 dark:text-darkText/70">Rating</label>
                                                                        <select
                                                                            value={currentReview.rating}
                                                                            onChange={(e) =>
                                                                                setReviewForms((prev) => ({
                                                                                    ...prev,
                                                                                    [app._id]: {
                                                                                        ...currentReview,
                                                                                        rating: Number(e.target.value),
                                                                                    },
                                                                                }))
                                                                            }
                                                                            className="px-3 py-2 rounded-lg border border-light dark:border-darkBorder bg-inputBg dark:bg-darkCard text-textDark dark:text-darkText"
                                                                        >
                                                                            {[5, 4, 3, 2, 1].map((value) => (
                                                                                <option key={value} value={value}>{value}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <textarea
                                                                        rows={3}
                                                                        value={currentReview.review}
                                                                        onChange={(e) =>
                                                                            setReviewForms((prev) => ({
                                                                                ...prev,
                                                                                [app._id]: {
                                                                                    ...currentReview,
                                                                                    review: e.target.value,
                                                                                },
                                                                            }))
                                                                        }
                                                                        placeholder="Share feedback about the student"
                                                                        className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        disabled={reviewSubmitting[app._id]}
                                                                        onClick={async () => {
                                                                            setReviewErrors((prev) => ({ ...prev, [app._id]: "" }));
                                                                            setReviewSubmitting((prev) => ({ ...prev, [app._id]: true }));
                                                                            try {
                                                                                await submitClientReview(job._id, app._id, currentReview);
                                                                                const res = await getApplicants(job._id);
                                                                                setApplicantsByJob((prev) => ({
                                                                                    ...prev,
                                                                                    [job._id]: res.data,
                                                                                }));
                                                                            } catch (e) {
                                                                                setReviewErrors((prev) => ({
                                                                                    ...prev,
                                                                                    [app._id]: e.response?.data?.message || "Failed to submit review",
                                                                                }));
                                                                            } finally {
                                                                                setReviewSubmitting((prev) => ({ ...prev, [app._id]: false }));
                                                                            }
                                                                        }}
                                                                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {reviewSubmitting[app._id] ? "Submitting..." : "Submit review"}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {app.resumeLink && (
                                                        <a
                                                            href={app.resumeLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-primary text-sm font-semibold mt-2 inline-block"
                                                        >
                                                            Resume / Portfolio
                                                        </a>
                                                    )}
                                                    {app.resumeFile && (
                                                        <a
                                                            href={`${backendOrigin}${app.resumeFile}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-primary text-sm font-semibold mt-2 ml-3 inline-block"
                                                        >
                                                            Download resume
                                                        </a>
                                                    )}
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {showShareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowShareModal(false)}
                        />
                        <div className="relative w-full max-w-3xl mx-4 rounded-2xl bg-white dark:bg-darkCard border border-light/60 dark:border-darkBorder p-6 shadow-xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-textDark dark:text-darkText">Post job</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowShareModal(false)}
                                    className="text-textDark/60 dark:text-darkText/60 hover:text-primary"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-textDark/60 dark:text-darkText/60">
                                Choose how you want to share this job.
                            </p>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShareMode("global")}
                                    className={`rounded-xl border px-4 py-3 text-left transition ${
                                        shareMode === "global"
                                            ? "border-primary bg-primary/10"
                                            : "border-light/60 dark:border-darkBorder"
                                    }`}
                                >
                                    <div className="font-semibold text-textDark dark:text-darkText">Post globally</div>
                                    <div className="text-xs text-textDark/60 dark:text-darkText/60">
                                        Visible to all students.
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShareMode("targeted")}
                                    className={`rounded-xl border px-4 py-3 text-left transition ${
                                        shareMode === "targeted"
                                            ? "border-primary bg-primary/10"
                                            : "border-light/60 dark:border-darkBorder"
                                    }`}
                                >
                                    <div className="font-semibold text-textDark dark:text-darkText">Share with specific students</div>
                                    <div className="text-xs text-textDark/60 dark:text-darkText/60">
                                        Only selected students will see it.
                                    </div>
                                </button>
                            </div>

                            {shareMode === "targeted" && (
                                <div className="mt-4 rounded-2xl border border-light/60 dark:border-darkBorder p-4 bg-inputBg dark:bg-darkCard">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-textDark dark:text-darkText">Select students</div>
                                            <div className="text-xs text-textDark/60 dark:text-darkText/60">
                                                Choose students you have completed jobs with.
                                            </div>
                                        </div>
                                        <div className="text-xs text-textDark/60 dark:text-darkText/60">
                                            {selectedStudentIds.length} selected
                                        </div>
                                    </div>
                                    {shareError && (
                                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                                            {shareError}
                                        </div>
                                    )}
                                    <div className="mt-3 max-h-64 overflow-auto pr-1 space-y-2">
                                        {shareLoading && (
                                            <div className="text-sm text-textDark/60 dark:text-darkText/60">Loading...</div>
                                        )}
                                        {!shareLoading && shareStudents.length === 0 && (
                                            <div className="text-sm text-textDark/60 dark:text-darkText/60">
                                                No eligible students yet.
                                            </div>
                                        )}
                                        {shareStudents.map((student) => {
                                            const rankLabel = student.rankPosition
                                                ? `${student.rankTier || "Bronze"} ${student.rankPosition}`
                                                : student.rankTier || "Bronze";
                                            return (
                                                <label
                                                    key={student._id}
                                                    className="flex items-center justify-between gap-3 rounded-xl border border-light/60 dark:border-darkBorder bg-white/80 dark:bg-darkCard/80 px-3 py-2"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudentIds.includes(student._id)}
                                                            onChange={() => toggleStudentSelection(student._id)}
                                                            className="h-4 w-4 accent-primary"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-semibold text-textDark dark:text-darkText">
                                                                {student.name || "Student"}
                                                            </div>
                                                            <div className="text-xs text-textDark/60 dark:text-darkText/60">
                                                                {student.email || ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 text-[11px] text-textDark/60 dark:text-darkText/60">
                                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                                                            Rank: {rankLabel}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full bg-accent/20 text-textDark dark:text-darkText font-semibold">
                                                            Jobs completed: {student.completedJobsWithClient ?? 0}
                                                        </span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowShareModal(false)}
                                    className="px-5 py-2 rounded-lg border border-light/60 dark:border-darkBorder text-textDark dark:text-darkText hover:bg-light/60 dark:hover:bg-darkBorder/60 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={async () => {
                                        if (shareMode === "targeted") {
                                            if (selectedStudentIds.length === 0) {
                                                setShareError("Select at least one student.");
                                                return;
                                            }
                                            const ok = await submitJob({
                                                visibility: "targeted",
                                                allowedStudents: selectedStudentIds,
                                            });
                                            if (ok) setShowShareModal(false);
                                            return;
                                        }

                                        const ok = await submitJob({ visibility: "global" });
                                        if (ok) setShowShareModal(false);
                                    }}
                                    className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Posting..." : "Post job"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ClientDashboard;
