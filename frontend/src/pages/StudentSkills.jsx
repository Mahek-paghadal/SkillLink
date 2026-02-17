import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStudentProfile, updateStudentSkills } from "../api/studentApi";
import { getJobs } from "../api/jobApi";

const StudentSkills = () => {
    const navigate = useNavigate();
    const [skills, setSkills] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const [profileRes, jobsRes] = await Promise.all([
                    getStudentProfile(),
                    getJobs(),
                ]);
                setSkills(profileRes.data?.skills || []);
                const tags = (jobsRes.data || [])
                    .flatMap((job) => job.tags || [])
                    .map((tag) => String(tag).trim())
                    .filter(Boolean);
                setAvailableSkills(Array.from(new Set(tags)).sort());
            } catch (err) {
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchSkills();
    }, [navigate]);

    const addSkill = () => {
        if (!selectedSkill) return;
        if (skills.includes(selectedSkill)) {
            setSelectedSkill("");
            return;
        }
        setSkills((prev) => [...prev, selectedSkill]);
        setSelectedSkill("");
    };

    const removeSkill = (skill) => {
        setSkills((prev) => prev.filter((item) => item !== skill));
    };

    const saveSkills = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const res = await updateStudentSkills(skills);
            setSkills(res.data?.skills || []);
            setSuccess("Skills updated successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update skills");
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
                <div className="bg-inputBg dark:bg-darkCard rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <p className="text-primary text-xs font-semibold tracking-widest">STUDENT SKILLS</p>
                            <h2 className="text-3xl font-bold text-textDark dark:text-darkText mt-2">Add your skills</h2>
                            <p className="text-textDark/60 dark:text-darkText/60 mt-2">
                                Skills help us match you with better jobs and recommendations.
                            </p>
                        </div>
                        <Link to="/student/dashboard" className="text-primary font-semibold">
                            Back to dashboard
                        </Link>
                    </div>
                </div>

                <div className="bg-inputBg dark:bg-darkCard rounded-3xl shadow-lg p-8 border border-light/60 dark:border-darkBorder">
                    <div className="flex flex-col md:flex-row gap-4">
                        <select
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textDark dark:text-darkText"
                        >
                            <option value="">Select a skill</option>
                            {availableSkills.map((skill) => (
                                <option key={skill} value={skill}>
                                    {skill}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={addSkill}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition"
                        >
                            Add skill
                        </button>
                    </div>
                    {availableSkills.length === 0 && (
                        <div className="mt-3 text-sm text-textDark/60 dark:text-darkText/60">
                            No skills found from current jobs.
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-accent/20 border border-accent text-primary rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 p-3 bg-accent/30 border border-accent text-primary rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2">
                        {skills.length === 0 && (
                            <span className="text-textDark/60 dark:text-darkText/60 text-sm">No skills added yet.</span>
                        )}
                        {skills.map((skill) => (
                            <span
                                key={skill}
                                className="px-3 py-1 rounded-full bg-light/80 dark:bg-darkBorder text-sm text-textDark dark:text-darkText flex items-center gap-2"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="text-xs text-primary"
                                >
                                    Remove
                                </button>
                            </span>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row gap-3">
                        <button
                            type="button"
                            onClick={saveSkills}
                            disabled={saving}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save skills"}
                        </button>
                        <Link
                            to="/student/dashboard"
                            className="px-6 py-2 rounded-lg border border-light/60 dark:border-darkBorder text-textDark dark:text-darkText hover:bg-accent/20 transition"
                        >
                            Continue to dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSkills;
