import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentProfile, updateStudentSkills } from "../api/studentApi";

const AddSkills = () => {
    const navigate = useNavigate();
    const [skills, setSkills] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await getStudentProfile();
                const existingSkills = res.data?.skills || [];
                if (existingSkills.length > 0) {
                    navigate("/student/dashboard", { replace: true });
                    return;
                }
                setSkills(existingSkills);
            } catch (e) {
                navigate("/student/dashboard", { replace: true });
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [navigate]);

    const addSkill = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        if (skills.includes(trimmed)) {
            setInput("");
            return;
        }
        setSkills((prev) => [...prev, trimmed]);
        setInput("");
    };

    const removeSkill = (skill) => {
        setSkills((prev) => prev.filter((item) => item !== skill));
    };

    const handleContinue = async () => {
        setError("");
        if (skills.length === 0) {
            setError("Please add at least one skill or skip for now.");
            return;
        }
        setSaving(true);
        try {
            await updateStudentSkills(skills);
            navigate("/profile", { replace: true });
        } catch (e) {
            setError(e.response?.data?.message || "Failed to save skills");
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
        <div className="min-h-[calc(100vh-64px)] bg-bgLight dark:bg-darkBg flex items-start justify-center px-4 pt-6 pb-8">
            <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-2xl w-full max-w-4xl p-8 md:p-10">
                <div className="mb-6">
                    <p className="text-primary text-xs font-semibold tracking-widest">STUDENT PROFILE</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-textDark dark:text-darkText mt-2">Add Your Skills</h2>
                    <p className="text-textDark/70 dark:text-darkText/70 mt-2">
                        Tell us what you&apos;re good at. We&apos;ll use this to personalize your micro task recommendations.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-2xl p-6 mb-6">
                    <label className="block text-sm font-medium text-textDark dark:text-darkText mb-2">
                        Add a skill
                    </label>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addSkill();
                                }
                            }}
                            placeholder="e.g., Excel, Java, Content Writing"
                            className="flex-1 px-4 py-3 bg-inputBg dark:bg-darkBorder border border-light dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText placeholder:text-textDark/50 dark:placeholder:text-darkText/50"
                        />
                        <button
                            type="button"
                            onClick={addSkill}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition"
                        >
                            Add Skill
                        </button>
                    </div>

                    {skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light/80 dark:bg-darkBorder text-sm text-textDark dark:text-darkText"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="text-textDark/60 dark:text-darkText/60 hover:text-primary"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/student/dashboard", { replace: true })}
                        className="w-full md:w-auto text-primary font-semibold px-6 py-3 rounded-lg border border-primary/40 hover:bg-primary/10 transition"
                    >
                        Skip for now
                    </button>
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={saving}
                        className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSkills;
