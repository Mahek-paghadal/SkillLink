import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginUser, signupUser } from "../api/authApi";
import { setToken, isAuthenticated, getUserRole } from "../utils/auth";

const AuthPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // If already authenticated, redirect away from auth page (fix back nav and direct access)
    useEffect(() => {
        if (isAuthenticated()) {
            const role = getUserRole();
            if (role === "student") navigate("/student/dashboard", { replace: true });
            else if (role === "client") navigate("/client/dashboard", { replace: true });
            else if (role === "admin") navigate("/", { replace: true });
            else navigate("/", { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const mode = searchParams.get("mode");
        if (mode === "signup") setIsLogin(false);
        if (mode === "login") setIsLogin(true);
    }, [searchParams]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Role-specific features
    const roleFeatures = {
        student: {
            title: "Unlock Your Potential",
            subtitle: "As a Student",
            features: [
                {
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    ),
                    text: "Access learning resources and courses"
                },
                {
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    ),
                    text: "Connect with mentors and peers"
                },
                {
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    ),
                    text: "Find internships and job opportunities"
                }
            ]
        },
        client: {
            title: "Find Top Talent",
            subtitle: "As a Client",
            features: [
                {
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    ),
                    text: "Post projects and find skilled students"
                },
                {
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    text: "Review portfolios and applications"
                },
                {
                    icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    text: "Manage your team and collaborations"
                }
            ]
        }
    };

    const currentFeatures = roleFeatures[role];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validation
        if (!form.email || !form.password || (!isLogin && !form.name)) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        if (!isLogin) {
            if (form.password !== form.confirmPassword) {
                setError("Passwords do not match");
                setLoading(false);
                return;
            }
            if (form.password.length < 6) {
                setError("Password must be at least 6 characters");
                setLoading(false);
                return;
            }
        }

        try {
            if (isLogin) {
                const res = await loginUser({
                    email: form.email,
                    password: form.password,
                    expectedRole: role,
                });

                if (res.data.token) {
                    setToken(res.data.token);
                    // Navigate based on role
                    const userRole = res.data.role;
                    if (userRole === "student") {
                        navigate("/student/dashboard", { replace: true });
                    } else if (userRole === "client") {
                        navigate("/client/dashboard", { replace: true });
                    } else if (userRole === "admin") {
                        navigate("/", { replace: true });
                    } else {
                        navigate("/dashboard", { replace: true });
                    }
                }
            } else {
                const res = await signupUser({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role,
                });

                // After signup, automatically login
                if (res.data.userId) {
                    const loginRes = await loginUser({
                        email: form.email,
                        password: form.password,
                        expectedRole: role,
                    });

                    if (loginRes.data.token) {
                        setToken(loginRes.data.token);
                        const userRole = loginRes.data.role;
                        if (userRole === "student") {
                            navigate("/student/dashboard", { replace: true });
                        } else if (userRole === "client") {
                            navigate("/client/dashboard", { replace: true });
                        } else if (userRole === "admin") {
                            navigate("/", { replace: true });
                        } else {
                            navigate("/dashboard", { replace: true });
                        }
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-bgLight dark:bg-darkBg flex items-start justify-center px-4 pt-6 pb-8">
            <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Panel - Role-specific Features */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-primary to-secondary dark:from-primary/80 dark:to-secondary/80 p-8 md:p-12 flex flex-col justify-center text-white relative min-h-[500px] md:min-h-auto">
                    <div className="flex flex-col justify-center h-full">
                        <div className="mb-8">
                            <p className="text-accent text-sm font-medium mb-2">{currentFeatures.subtitle}</p>
                            <h1 className="text-3xl md:text-4xl font-bold mb-6">
                                {currentFeatures.title}
                            </h1>
                        </div>
                        <div className="space-y-5">
                            {currentFeatures.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="text-accent mt-1 flex-shrink-0">
                                        {feature.icon}
                                    </div>
                                    <p className="text-lg text-white/90 leading-relaxed">{feature.text}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block border border-white/20">
                                <p className="text-sm opacity-80">presented by</p>
                                <div className="text-2xl font-bold mt-1">SkillLink</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Auth Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-inputBg dark:bg-darkCard relative">
                    
                    {/* Role Selection */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setRole("student")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                                role === "student"
                                    ? "bg-primary text-white shadow-md"
                                    : "bg-light dark:bg-darkBorder text-textDark dark:text-darkText hover:bg-accent/30 dark:hover:bg-accent/20"
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            As Student
                        </button>
                        <button
                            onClick={() => setRole("client")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                                role === "client"
                                    ? "bg-primary text-white shadow-md"
                                    : "bg-light dark:bg-darkBorder text-textDark dark:text-darkText hover:bg-accent/30 dark:hover:bg-accent/20"
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            As Client
                        </button>
                    </div>

                    {/* Welcome Message */}
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-textDark dark:text-darkText mb-2">
                            {isLogin ? "Welcome back" : "Welcome"}
                        </h2>
                        <p className="text-textDark/70 dark:text-darkText/70">
                            {isLogin ? "Please enter your credentials to continue." : "Please enter your information."}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-textDark dark:text-darkText mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText placeholder:text-textDark/50 dark:placeholder:text-darkText/50"
                                    placeholder="Your Name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-textDark dark:text-darkText mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText placeholder:text-textDark/50 dark:placeholder:text-darkText/50"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textDark dark:text-darkText mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition pr-12 text-textDark dark:text-darkText placeholder:text-textDark/50 dark:placeholder:text-darkText/50"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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

                        {!isLogin && (
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
                        )}

                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate("/forgot-password")}
                                    className="text-sm text-primary hover:text-secondary font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
                        </button>
                    </form>

                    {/* Toggle Login/Signup */}
                    <div className="mt-6 text-center">
                        <p className="text-textDark/70 dark:text-darkText/70">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                    setForm({ name: "", email: "", password: "", confirmPassword: "" });
                                }}
                                className="text-primary hover:text-secondary font-medium"
                            >
                                {isLogin ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
