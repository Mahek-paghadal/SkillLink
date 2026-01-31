import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/authApi";
import {
    createJob,
    deleteJob,
    getApplicants,
    getClientJobs,
    getClientHistory,
    hireApplicant,
    rejectApplicant,
    closeJob,
    archiveClientJob,
    clearClientHistory,
    updateJob,
} from "../api/jobApi";

const ClientDashboard = () => {
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
        tags: "",
        companyName: "",
    });
    const [editingJobId, setEditingJobId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [applicantsByJob, setApplicantsByJob] = useState({});
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    const fetchJobs = async () => {
        try {
            const res = await getClientJobs();
            setJobs(res.data || []);
        } catch (e) {
            console.error("Failed to load jobs:", e);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await getClientHistory();
            setHistory(res.data || []);
        } catch (e) {
            console.error("Failed to load history:", e);
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
        fetchHistory();
    }, [navigate]);

    const stats = useMemo(() => {
        let pending = 0;
        let hired = 0;
        Object.values(applicantsByJob).forEach((item) => {
            (item?.applications || []).forEach((app) => {
                if (app.status === "hired") hired += 1;
                else pending += 1;
            });
        });
        return {
            activeJobs: jobs.length,
            hired,
            pending,
        };
    }, [jobs, applicantsByJob]);

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            location: "",
            employmentType: "",
            level: "",
            salary: "",
            tags: "",
            companyName: user?.name || "",
        });
        setEditingJobId(null);
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
                    <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">
                        Welcome to your dashboard
                    </h2>
                    <p className="text-textDark/70 dark:text-darkText/70">Client Account</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-textDark/70 dark:text-darkText/70 text-sm">Active Jobs</p>
                                <p className="text-2xl font-bold text-primary mt-1">{stats.activeJobs}</p>
                            </div>
                            <div className="w-12 h-12 bg-accent/30 dark:bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-textDark/70 dark:text-darkText/70 text-sm">Hired Students</p>
                                <p className="text-2xl font-bold text-primary mt-1">{stats.hired}</p>
                            </div>
                            <div className="w-12 h-12 bg-accent/30 dark:bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-textDark/70 dark:text-darkText/70 text-sm">Pending Applications</p>
                                <p className="text-2xl font-bold text-primary mt-1">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-accent/30 dark:bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
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
                        <input
                            type="text"
                            value={form.employmentType}
                            onChange={(e) => setForm((prev) => ({ ...prev, employmentType: e.target.value }))}
                            placeholder="Employment type"
                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        />
                        <input
                            type="text"
                            value={form.level}
                            onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                            placeholder="Level"
                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        />
                        <input
                            type="text"
                            value={form.salary}
                            onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))}
                            placeholder="Salary / Budget"
                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        />
                        <input
                            type="text"
                            value={form.tags}
                            onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                            placeholder="Tags (comma separated)"
                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        />
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
                                setError("");
                                if (!form.title || !form.description) {
                                    setError("Title and description are required.");
                                    return;
                                }
                                setSaving(true);
                                try {
                                    const payload = {
                                        ...form,
                                        tags: form.tags
                                            ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                                            : [],
                                    };
                                    if (editingJobId) {
                                        await updateJob(editingJobId, payload);
                                    } else {
                                        await createJob(payload);
                                    }
                                    await fetchJobs();
                                    resetForm();
                                } catch (e) {
                                    setError(e.response?.data?.message || "Failed to save job");
                                } finally {
                                    setSaving(false);
                                }
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
                                                    tags: (job.tags || []).join(", "),
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
                                                await fetchHistory();
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
                                            {(applicantsByJob[job._id].applications || []).map((app) => (
                                                <div key={app._id} className="rounded-xl border border-light/60 dark:border-darkBorder p-4 bg-inputBg dark:bg-darkCard">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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
                                                                            await fetchHistory();
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
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8 mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-textDark dark:text-darkText">Job history</h3>
                        {history.length > 0 && (
                            <button
                                type="button"
                                onClick={async () => {
                                    await clearClientHistory();
                                    setHistory([]);
                                }}
                                className="text-primary font-semibold text-sm"
                            >
                                Clear history
                            </button>
                        )}
                    </div>
                    {history.length === 0 && (
                        <div className="text-textDark/60 dark:text-darkText/60">No past jobs yet.</div>
                    )}
                    <div className="space-y-4">
                        {history.map((job) => (
                            <div key={job._id} className="rounded-2xl border border-light/60 dark:border-darkBorder p-5 bg-white/70 dark:bg-darkCard/70">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">{job.title}</h4>
                                        <p className="text-sm text-textDark/60 dark:text-darkText/60">{job.companyName || "Client"}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await archiveClientJob(job._id);
                                            setHistory((prev) => prev.filter((item) => item._id !== job._id));
                                        }}
                                        className="text-primary font-semibold text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.location || "Remote"}</span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.employmentType || "Flexible"}</span>
                                    <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.level || "Any level"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
