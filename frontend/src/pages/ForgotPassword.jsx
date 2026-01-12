import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/authApi";
import ThemeToggle from "../components/ThemeToggle";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await forgotPassword({ email });
            setSuccess("Password reset link has been sent to your email!");
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
                <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">Forgot Password</h2>
                <p className="text-textDark/70 dark:text-darkText/70 mb-6">Enter your email to receive a password reset link.</p>

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
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText placeholder:text-textDark/50 dark:placeholder:text-darkText/50"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-primary hover:text-secondary font-medium">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
