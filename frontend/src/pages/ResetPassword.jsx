import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/authApi";
import ThemeToggle from "../components/ThemeToggle";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/forgot-password");
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (form.newPassword !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (form.newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await resetPassword({
                token,
                newPassword: form.newPassword,
            });
            setSuccess("Password reset successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bgLight dark:bg-darkBg flex items-center justify-center p-4">
            <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>
                <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">Reset Password</h2>
                <p className="text-textDark/70 dark:text-darkText/70 mb-6">Enter your new password.</p>

                {error && (
                    <div className="mb-4 p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-accent/30 border border-accent text-primary rounded-lg text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textDark dark:text-darkText mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition pr-12 text-textDark dark:text-darkText placeholder:text-textDark/50 dark:placeholder:text-darkText/50"
                                    placeholder="New Password"
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textDark/60 dark:text-darkText/60 hover:text-textDark dark:hover:text-darkText"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textDark dark:text-darkText mb-2">
                                Confirm Password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText placeholder:text-textDark/50 dark:placeholder:text-darkText/50"
                                placeholder="Confirm Password"
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
