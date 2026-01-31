import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getStudentJobsByCategory } from "../api/studentApi";

const StudentCategoryJobs = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await getStudentJobsByCategory(category);
                setTitle(res.data?.title || "Jobs");
                setJobs(res.data?.jobs || []);
            } catch (e) {
                navigate("/student/dashboard", { replace: true });
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [category, navigate]);

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
                            <p className="text-primary text-xs font-semibold tracking-widest">CATEGORY</p>
                            <h2 className="text-3xl font-bold text-textDark dark:text-darkText mt-2">{title}</h2>
                        </div>
                        <Link to="/student/dashboard" className="text-primary font-semibold">
                            Back to dashboard
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.length === 0 && (
                        <div className="text-textDark/60 dark:text-darkText/60">No jobs available in this category.</div>
                    )}
                    {jobs.map((job, index) => (
                        <div key={`${job.title}-${index}`} className="rounded-2xl border border-light/60 dark:border-darkBorder p-5 bg-white/70 dark:bg-darkCard/70 hover:shadow-md transition">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-lg text-textDark dark:text-darkText">{job.title}</h4>
                                    <p className="text-sm text-textDark/60 dark:text-darkText/60">{job.company}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center text-primary font-bold">
                                    {job.company?.[0] || "S"}
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.location}</span>
                                <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.employmentType}</span>
                                <span className="px-2 py-1 rounded-full bg-light/80 dark:bg-darkBorder">{job.level}</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-primary font-semibold text-sm">{job.salary || "Budget suggested by ML"}</div>
                                <button className="text-primary font-semibold text-sm">Apply</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentCategoryJobs;
