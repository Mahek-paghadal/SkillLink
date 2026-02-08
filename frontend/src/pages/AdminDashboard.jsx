import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/authApi";
import {
    getStats,
    listUsers,
    listJobs,
    updateJobStatus,
    deleteJob,
    listApplications,
    updateApplicationStatus,
    deleteApplication,
} from "../api/adminApi";

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, statsRes, usersRes, jobsRes, appsRes] = await Promise.all([
                    getProfile(),
                    getStats(),
                    listUsers(),
                    listJobs(),
                    listApplications(),
                ]);
                setUser(profileRes.data);
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setJobs(jobsRes.data);
                setApplications(appsRes.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

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
                {/* Welcome Card */}
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8 mb-6">
                    <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">
                        Welcome, Admin!
                    </h2>
                    <p className="text-textDark/70 dark:text-darkText/70">Administrator Account</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-textDark/70 dark:text-darkText/70 text-sm">Total Students</p>
                                <p className="text-2xl font-bold text-primary mt-1">{stats?.students || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-accent/30 dark:bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-textDark/70 dark:text-darkText/70 text-sm">Total Clients</p>
                                <p className="text-2xl font-bold text-primary mt-1">{stats?.clients || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-accent/30 dark:bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-textDark/70 dark:text-darkText/70 text-sm">Total Admins</p>
                                <p className="text-2xl font-bold text-primary mt-1">{stats?.admins || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-accent/30 dark:bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-textDark/70 dark:text-darkText/70 text-sm">Total Users</p>
                                <p className="text-2xl font-bold text-primary mt-1">{stats?.totalUsers || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-accent/30 dark:bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-6">
                        <h4 className="text-lg font-bold text-textDark dark:text-darkText mb-4">Jobs overview</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/70 dark:bg-darkCard/70 rounded-xl p-4 border border-light/60 dark:border-darkBorder">
                                <p className="text-xs text-textDark/60 dark:text-darkText/60">Open</p>
                                <p className="text-xl font-bold text-primary">{stats?.jobs?.open || 0}</p>
                            </div>
                            <div className="bg-white/70 dark:bg-darkCard/70 rounded-xl p-4 border border-light/60 dark:border-darkBorder">
                                <p className="text-xs text-textDark/60 dark:text-darkText/60">Closed</p>
                                <p className="text-xl font-bold text-primary">{stats?.jobs?.closed || 0}</p>
                            </div>
                            <div className="bg-white/70 dark:bg-darkCard/70 rounded-xl p-4 border border-light/60 dark:border-darkBorder">
                                <p className="text-xs text-textDark/60 dark:text-darkText/60">Completed</p>
                                <p className="text-xl font-bold text-primary">{stats?.jobs?.completed || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-6">
                        <h4 className="text-lg font-bold text-textDark dark:text-darkText mb-4">Applications overview</h4>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white/70 dark:bg-darkCard/70 rounded-xl p-4 border border-light/60 dark:border-darkBorder">
                                <p className="text-xs text-textDark/60 dark:text-darkText/60">Pending</p>
                                <p className="text-xl font-bold text-primary">{stats?.applications?.pending || 0}</p>
                            </div>
                            <div className="bg-white/70 dark:bg-darkCard/70 rounded-xl p-4 border border-light/60 dark:border-darkBorder">
                                <p className="text-xs text-textDark/60 dark:text-darkText/60">Hired</p>
                                <p className="text-xl font-bold text-primary">{stats?.applications?.hired || 0}</p>
                            </div>
                            <div className="bg-white/70 dark:bg-darkCard/70 rounded-xl p-4 border border-light/60 dark:border-darkBorder">
                                <p className="text-xs text-textDark/60 dark:text-darkText/60">Rejected</p>
                                <p className="text-xl font-bold text-primary">{stats?.applications?.rejected || 0}</p>
                            </div>
                            <div className="bg-white/70 dark:bg-darkCard/70 rounded-xl p-4 border border-light/60 dark:border-darkBorder">
                                <p className="text-xs text-textDark/60 dark:text-darkText/60">Completed</p>
                                <p className="text-xl font-bold text-primary">{stats?.applications?.completed || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-textDark dark:text-darkText mb-6">All Users</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-darkBorder">
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Email</th>
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Role</th>
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-b dark:border-darkBorder hover:bg-light/50 dark:hover:bg-darkBorder/50">
                                        <td className="py-3 px-4 text-textDark dark:text-darkText">{u.email}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-sm ${
                                                u.role === 'admin' ? 'bg-accent/40 dark:bg-accent/30 text-primary' :
                                                u.role === 'student' ? 'bg-accent/30 dark:bg-accent/20 text-primary' :
                                                'bg-accent/20 dark:bg-accent/10 text-primary'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-textDark/70 dark:text-darkText/70">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Jobs List */}
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8 mt-8">
                    <h3 className="text-2xl font-bold text-textDark dark:text-darkText mb-6">All Jobs</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-darkBorder">
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Title</th>
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Client</th>
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Status</th>
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr key={job._id} className="border-b dark:border-darkBorder hover:bg-light/50 dark:hover:bg-darkBorder/50">
                                        <td className="py-3 px-4 text-textDark dark:text-darkText">{job.title}</td>
                                        <td className="py-3 px-4 text-textDark/70 dark:text-darkText/70">
                                            {job.createdBy?.name || job.createdBy?.email || "Client"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={job.status}
                                                onChange={async (e) => {
                                                    const res = await updateJobStatus(job._id, e.target.value);
                                                    setJobs((prev) => prev.map((item) => (item._id === job._id ? res.data : item)));
                                                }}
                                                className="px-3 py-2 rounded-lg border border-light dark:border-darkBorder bg-inputBg dark:bg-darkCard text-textDark dark:text-darkText"
                                            >
                                                <option value="open">open</option>
                                                <option value="closed">closed</option>
                                                <option value="completed">completed</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await deleteJob(job._id);
                                                    setJobs((prev) => prev.filter((item) => item._id !== job._id));
                                                }}
                                                className="text-primary font-semibold text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Applications List */}
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8 mt-8">
                    <h3 className="text-2xl font-bold text-textDark dark:text-darkText mb-6">All Applications</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-darkBorder">
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Job</th>
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Student</th>
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Client</th>
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Status</th>
                                    <th className="text-left py-3 px-4 text-textDark dark:text-darkText font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app._id} className="border-b dark:border-darkBorder hover:bg-light/50 dark:hover:bg-darkBorder/50">
                                        <td className="py-3 px-4 text-textDark dark:text-darkText">{app.jobId?.title || "Job"}</td>
                                        <td className="py-3 px-4 text-textDark/70 dark:text-darkText/70">
                                            {app.studentName || app.studentId?.name || "Student"}
                                        </td>
                                        <td className="py-3 px-4 text-textDark/70 dark:text-darkText/70">
                                            {app.clientId?.name || app.clientId?.email || "Client"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={app.status}
                                                onChange={async (e) => {
                                                    const res = await updateApplicationStatus(app._id, e.target.value);
                                                    setApplications((prev) => prev.map((item) => (item._id === app._id ? res.data : item)));
                                                }}
                                                className="px-3 py-2 rounded-lg border border-light dark:border-darkBorder bg-inputBg dark:bg-darkCard text-textDark dark:text-darkText"
                                            >
                                                <option value="pending">pending</option>
                                                <option value="hired">hired</option>
                                                <option value="rejected">rejected</option>
                                                <option value="completed">completed</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await deleteApplication(app._id);
                                                    setApplications((prev) => prev.filter((item) => item._id !== app._id));
                                                }}
                                                className="text-primary font-semibold text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
