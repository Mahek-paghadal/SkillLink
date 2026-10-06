import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    archiveClientJob,
    clearClientHistory,
    closeJob,
    getClientHistory,
    getClientJobs,
} from "../api/jobApi";

const PAGE_SIZE = 6;

const ClientJobs = () => {
    const [tab, setTab] = useState("current");
    const [currentJobs, setCurrentJobs] = useState([]);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmContext, setConfirmContext] = useState({
        action: "",
        jobId: null,
        message: "",
    });
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [currentRes, pendingRes, historyRes] = await Promise.all([
                getClientJobs({ status: "current" }),
                getClientJobs({ status: "pending" }),
                getClientHistory(),
            ]);
            setCurrentJobs(currentRes.data || []);
            setPendingJobs(pendingRes.data || []);
            setHistory(historyRes.data || []);
        } catch (error) {
            navigate("/client/dashboard");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        setPage(1);
    }, [tab]);

    const openConfirm = ({ action, jobId, message }) => {
        setConfirmContext({ action, jobId: jobId || null, message });
        setConfirmOpen(true);
    };

    const closeConfirm = () => {
        setConfirmOpen(false);
        setConfirmContext({ action: "", jobId: null, message: "" });
    };

    const handleConfirm = async () => {
        const { action, jobId } = confirmContext;
        if (!action) return;
        if (action === "close" && jobId) {
            await closeJob(jobId);
            await loadData();
        }
        if (action === "remove" && jobId) {
            await archiveClientJob(jobId);
            setHistory((prev) => prev.filter((item) => item._id !== jobId));
        }
        if (action === "clear-history") {
            await clearClientHistory();
            setHistory([]);
        }
        closeConfirm();
    };

    const items =
        tab === "current"
            ? currentJobs
            : tab === "pending"
                ? pendingJobs
                : history;
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const pagedItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return items.slice(start, start + PAGE_SIZE);
    }, [items, page]);

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
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-primary text-xs font-semibold tracking-widest">CLIENT JOBS</p>
                            <h2 className="text-3xl font-bold text-textDark dark:text-darkText mt-2">Manage jobs</h2>
                            <p className="text-textDark/60 dark:text-darkText/60 mt-2">
                                Review current, pending, and historical jobs.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/client/dashboard")}
                            className="text-primary font-semibold text-sm"
                        >
                            Back to dashboard
                        </button>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setTab("current")}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            tab === "current"
                                ? "bg-primary text-white"
                                : "bg-light/80 dark:bg-darkBorder text-textDark dark:text-darkText"
                        }`}
                    >
                        Current jobs ({currentJobs.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("pending")}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            tab === "pending"
                                ? "bg-primary text-white"
                                : "bg-light/80 dark:bg-darkBorder text-textDark dark:text-darkText"
                        }`}
                    >
                        Pending jobs ({pendingJobs.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("history")}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            tab === "history"
                                ? "bg-primary text-white"
                                : "bg-light/80 dark:bg-darkBorder text-textDark dark:text-darkText"
                        }`}
                    >
                        Job history ({history.length})
                    </button>
                    {tab === "history" && history.length > 0 && (
                        <button
                            type="button"
                            onClick={async () => {
                                openConfirm({
                                    action: "clear-history",
                                    message: "This will permanently remove all jobs from history.",
                                });
                            }}
                            className="ml-auto text-primary font-semibold text-sm"
                        >
                            Clear history
                        </button>
                    )}
                </div>

                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-6">
                    {pagedItems.length === 0 && (
                        <div className="text-textDark/60 dark:text-darkText/60">
                            {tab === "current"
                                ? "No active jobs yet."
                                : tab === "pending"
                                    ? "No pending jobs yet."
                                    : "No past jobs yet."}
                        </div>
                    )}
                    <div className="space-y-4">
                        {pagedItems.map((job) => (
                            <div key={job._id} className="rounded-2xl border border-light/60 dark:border-darkBorder p-5 bg-white/70 dark:bg-darkCard/70">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold text-lg text-textDark dark:text-darkText">{job.title}</h4>
                                        <p className="text-sm text-textDark/60 dark:text-darkText/60">{job.companyName || "Client"}</p>
                                        <p className="text-textDark/70 dark:text-darkText/70 mt-2">{job.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.location || "Remote"}</span>
                                            <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.employmentType || "Flexible"}</span>
                                            <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.level || "Any level"}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tab === "history" ? (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    openConfirm({
                                                        action: "remove",
                                                        jobId: job._id,
                                                        message: "This will remove the job from your history.",
                                                    });
                                                }}
                                                className="text-primary font-semibold text-sm"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    openConfirm({
                                                        action: "close",
                                                        jobId: job._id,
                                                        message: "Closing a job stops new applications and cannot be undone.",
                                                    });
                                                }}
                                                className="text-primary font-semibold text-sm"
                                            >
                                                Close job
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-light/80 dark:bg-darkBorder text-textDark dark:text-darkText disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-sm text-textDark/60 dark:text-darkText/60">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg bg-light/80 dark:bg-darkBorder text-textDark dark:text-darkText disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeConfirm}
                    />
                    <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-darkCard border border-light/60 dark:border-darkBorder p-6 shadow-xl">
                        <div className="text-lg font-semibold text-textDark dark:text-darkText">
                            Are you sure you want to proceed?
                        </div>
                        <p className="mt-2 text-sm text-textDark/60 dark:text-darkText/60">
                            {confirmContext.message || "This action is sensitive and cannot be undone."}
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeConfirm}
                                className="px-4 py-2 rounded-lg border border-light/60 dark:border-darkBorder text-textDark dark:text-darkText hover:bg-light/60 dark:hover:bg-darkBorder/60 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-secondary transition"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientJobs;
