import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import { getProfile, logoutUser } from "../api/authApi";
import { getStats, listUsers } from "../api/adminApi";
import ThemeToggle from "../components/ThemeToggle";

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, statsRes, usersRes] = await Promise.all([
                    getProfile(),
                    getStats(),
                    listUsers()
                ]);
                setUser(profileRes.data);
                setStats(statsRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            removeToken();
            window.location.href = "/";
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
            {/* Header */}
            <header className="bg-inputBg dark:bg-darkCard shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-textDark dark:text-darkText">SkillLink - Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Welcome Card */}
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8 mb-6">
                    <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">
                        Welcome, Admin {user?.email}!
                    </h2>
                    <p className="text-textDark/70 dark:text-darkText/70">Administrator Account</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            </div>
        </div>
    );
};

export default AdminDashboard;
