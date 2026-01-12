import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import { getProfile, logoutUser } from "../api/authApi";
import ThemeToggle from "../components/ThemeToggle";

const ClientDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                setUser(res.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
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
                    <h1 className="text-2xl font-bold text-textDark dark:text-darkText">SkillLink - Client Dashboard</h1>
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
                        Welcome, {user?.email}!
                    </h2>
                    <p className="text-textDark/70 dark:text-darkText/70">Client Account</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-inputBg dark:bg-darkCard rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-textDark/70 dark:text-darkText/70 text-sm">Active Projects</p>
                                <p className="text-2xl font-bold text-primary mt-1">0</p>
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
                                <p className="text-2xl font-bold text-primary mt-1">0</p>
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
                                <p className="text-2xl font-bold text-primary mt-1">0</p>
                            </div>
                            <div className="w-12 h-12 bg-accent/30 dark:bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-textDark dark:text-darkText mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="p-6 border-2 border-accent dark:border-darkBorder rounded-xl hover:border-primary hover:bg-accent/20 dark:hover:bg-darkBorder transition text-left">
                            <h4 className="font-semibold text-lg text-textDark dark:text-darkText mb-2">Post a Project</h4>
                            <p className="text-textDark/70 dark:text-darkText/70 text-sm">Create a new project opportunity</p>
                        </button>
                        <button className="p-6 border-2 border-accent dark:border-darkBorder rounded-xl hover:border-primary hover:bg-accent/20 dark:hover:bg-darkBorder transition text-left">
                            <h4 className="font-semibold text-lg text-textDark dark:text-darkText mb-2">Browse Students</h4>
                            <p className="text-textDark/70 dark:text-darkText/70 text-sm">Find talented students</p>
                        </button>
                        <button className="p-6 border-2 border-accent dark:border-darkBorder rounded-xl hover:border-primary hover:bg-accent/20 dark:hover:bg-darkBorder transition text-left">
                            <h4 className="font-semibold text-lg text-textDark dark:text-darkText mb-2">My Projects</h4>
                            <p className="text-textDark/70 dark:text-darkText/70 text-sm">Manage your projects</p>
                        </button>
                        <button className="p-6 border-2 border-accent dark:border-darkBorder rounded-xl hover:border-primary hover:bg-accent/20 dark:hover:bg-darkBorder transition text-left">
                            <h4 className="font-semibold text-lg text-textDark dark:text-darkText mb-2">Settings</h4>
                            <p className="text-textDark/70 dark:text-darkText/70 text-sm">Manage your account</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
