import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { getJobPicks } from "../api/landingApi";

const LandingPage = () => {
    const [jobPicks, setJobPicks] = useState([]);
    const [loadingPicks, setLoadingPicks] = useState(true);

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: "ease-out-cubic",
            once: false,
            mirror: true,
            offset: 120,
        });

        const onLoad = () => AOS.refreshHard();
        window.addEventListener("load", onLoad);
        return () => window.removeEventListener("load", onLoad);
    }, []);

    useEffect(() => {
        const fetchJobPicks = async () => {
            try {
                const res = await getJobPicks();
                setJobPicks(res.data || []);
            } catch (e) {
                setJobPicks([]);
            } finally {
                setLoadingPicks(false);
                setTimeout(() => AOS.refresh(), 50);
            }
        };

        fetchJobPicks();
    }, []);

    return (
        <div className="bg-bgLight dark:bg-darkBg text-textDark dark:text-darkText">
            {/* Hero */}
            <section id="home" className="pt-20 pb-12 scroll-mt-24">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
                    <div data-aos="fade-right" data-aos-delay="50">
                        <p className="text-primary font-semibold tracking-wide text-xs">ML POWERED MICRO JOBS</p>
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-2">
                            SkillLink —
                            <span className="text-primary"> Hyperlocal Student Micro Jobs</span>
                        </h1>
                        <p className="text-textDark/70 dark:text-darkText/70 mt-3 text-base">
                            An intelligent marketplace that matches students with nearby micro tasks using ML based recommendations, ranking, and fraud detection.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3" data-aos="fade-up" data-aos-delay="150">
                            <a
                                href="#job-picks"
                                className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-secondary transition"
                            >
                                Explore Tasks
                            </a>
                            <a
                                href="#how-it-works"
                                className="border border-primary text-primary px-6 py-3 rounded-full font-semibold hover:bg-accent/20 transition"
                            >
                                How It Works
                            </a>
                        </div>
                        <div className="mt-4 text-xs text-textDark/60 dark:text-darkText/60">
                            Built for students, households, and small businesses
                        </div>
                    </div>
                    <div className="relative" data-aos="fade-left" data-aos-delay="100">
                        <div className="bg-gradient-to-br from-white to-light/60 dark:from-darkCard dark:to-darkBorder rounded-3xl shadow-2xl p-6 border border-light/60 dark:border-darkBorder">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-textDark/60 dark:text-darkText/60">ML Matching Preview</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-accent/30 text-primary">Verified</span>
                                    <div className="w-8 h-8 rounded-full bg-accent/30"></div>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                {[
                                    { label: "Skill Match", value: "92/100", meta: "UI/UX + Canva" },
                                    { label: "Distance", value: "3.2 km", meta: "Near Campus" },
                                    { label: "Reliability", value: "4.8★", meta: "23 tasks" },
                                    { label: "Fraud Risk", value: "Low", meta: "Verified" },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-2xl bg-white/70 dark:bg-darkCard/70 border border-light/60 dark:border-darkBorder p-4 shadow-sm" data-aos="zoom-in" data-aos-delay="120">
                                        <div className="text-xs text-textDark/60 dark:text-darkText/60">{item.label}</div>
                                        <div className="mt-2 text-lg font-semibold text-primary">{item.value}</div>
                                        <div className="mt-2 text-[11px] text-textDark/60 dark:text-darkText/60">{item.meta}</div>
                                        <div className="mt-2 h-1.5 rounded-full bg-light/80 dark:bg-darkBorder">
                                            <div className="h-1.5 rounded-full bg-primary" style={{ width: item.label === "Fraud Risk" ? "30%" : "80%" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 rounded-3xl blur-[1px]"></div>
                    </div>
                </div>
            </section>

            {/* Trusted Logos */}
            <section className="bg-primary text-white py-5" data-aos="fade-up">
                <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-6 items-center text-center text-sm">
                    {['Campus Clubs', 'Local Tutors', 'Student Creators', 'SMB Partners', 'Community NGOs'].map((brand) => (
                        <div key={brand} className="opacity-90">{brand}</div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-10 scroll-mt-24" data-aos="fade-up">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold">How SkillLink works</h2>
                        <p className="text-textDark/60 dark:text-darkText/60 mt-2 text-sm">
                            ML powered matching connects the right student to the right micro task.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="hidden md:block absolute left-6 right-6 top-8 h-px bg-textDark/30 dark:bg-darkBorder" />
                        <div className="grid md:grid-cols-4 gap-6">
                            {[
                                { title: "Post a task", text: "Clients create a micro task with budget and location." },
                                { title: "ML ranks students", text: "Skill match, distance, ratings, and reliability scored." },
                                { title: "Fraud checks", text: "Suspicious activity is flagged automatically." },
                                { title: "Hire faster", text: "Top ranked students get notified to respond quickly." },
                            ].map((step, index) => (
                                <div key={step.title} className="bg-inputBg dark:bg-darkCard border border-light/60 dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:shadow-md transition" data-aos="fade-up" data-aos-delay={index * 80}>
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                                        {index + 1}
                                    </div>
                                    <h3 className="mt-3 font-semibold text-lg">{step.title}</h3>
                                    <p className="mt-2 text-sm text-textDark/60 dark:text-darkText/60">{step.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Job Picks */}
            <section id="job-picks" className="py-10 scroll-mt-24" data-aos="fade-up">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Recommended micro tasks</h2>
                        <Link to="/auth?mode=signup" className="text-primary font-semibold">View all tasks</Link>
                    </div>
                    {loadingPicks ? (
                        <div className="text-primary">Loading recommendations...</div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {jobPicks.length === 0 && (
                                <div className="text-textDark/60 dark:text-darkText/60">No recommendations available.</div>
                            )}
                            {jobPicks.map((job) => (
                                <div key={job._id} className="bg-inputBg dark:bg-darkCard border border-light/60 dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:shadow-md transition" data-aos="fade-up">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg">{job.title}</h3>
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
                                        <button className="text-primary font-semibold text-sm">View Task</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Latest Opportunities */}
            <section id="services" className="py-10 bg-white/70 dark:bg-darkCard/40 scroll-mt-24" data-aos="fade-up">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Supported student friendly services</h2>
                        <Link to="/auth?mode=signup" className="text-primary font-semibold">View all services</Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Academic tutoring",
                                desc: "Home tutoring, doubt solving, exam prep",
                            },
                            {
                                title: "Digital & online services",
                                desc: "Content writing, PPTs, Canva, social media",
                            },
                            {
                                title: "Technical support",
                                desc: "Laptop setup, app install, basic IT help",
                            },
                            {
                                title: "Community micro tasks",
                                desc: "Event volunteering, surveys, campus tasks",
                            },
                            {
                                title: "Personal assistance",
                                desc: "Form filling, travel booking, documentation",
                            },
                            {
                                title: "Testing & QA",
                                desc: "Website/app testing and bug reporting",
                            },
                        ].map((item) => (
                            <div key={item.title} className="bg-inputBg dark:bg-darkCard border border-light/60 dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:shadow-md transition" data-aos="fade-up">
                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                <p className="mt-2 text-sm text-textDark/60 dark:text-darkText/60">{item.desc}</p>
                                <Link to="/auth?mode=signup" className="mt-4 inline-block text-primary font-semibold text-sm">Learn more</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose */}
            <section id="why" className="py-10 scroll-mt-24" data-aos="fade-up">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center">Why choose SkillLink</h2>
                    <p className="text-center text-textDark/60 dark:text-darkText/60 mt-2 text-sm">
                        ML based matching, ranking, and fraud protection designed for student friendly micro tasks.
                    </p>
                    <div className="grid md:grid-cols-4 gap-5 mt-6">
                        {[
                            {
                                text: "Skill based recommendations",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z" />
                                    </svg>
                                ),
                            },
                            {
                                text: "Hyperlocal discovery",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
                                    </svg>
                                ),
                            },
                            {
                                text: "Fraud detection & trust",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                    </svg>
                                ),
                            },
                            {
                                text: "Smart pricing insights",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                ),
                            },
                        ].map((item) => (
                            <div key={item.text} className="bg-inputBg dark:bg-darkCard border border-light/60 dark:border-darkBorder rounded-2xl p-5 text-center hover:shadow-md transition" data-aos="fade-up">
                                <div className="w-12 h-12 rounded-full bg-accent/30 text-primary mx-auto flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <p className="mt-4 text-sm font-semibold">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section id="cta" className="py-10 bg-primary text-white scroll-mt-24" data-aos="fade-up">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-xs tracking-widest">STUDENT MICRO JOBS</p>
                    <h2 className="text-3xl font-bold mt-2">Find trusted tasks. Get matched faster.</h2>
                    <div className="mt-6 flex justify-center gap-3">
                        <Link to="/auth?mode=signup" className="bg-white text-primary px-6 py-2 rounded-full font-semibold text-sm">Get Started</Link>
                        <a href="#how-it-works" className="border border-white px-6 py-2 rounded-full font-semibold text-sm">Learn More</a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10" data-aos="fade-up">
                <div className="container mx-auto px-4 grid md:grid-cols-4 gap-6 text-sm">
                    <div>
                        <div className="text-xl font-extrabold">
                            <span className="text-primary">Skill</span>Link
                        </div>
                        <p className="mt-2 text-textDark/60 dark:text-darkText/60">
                            ML powered, hyperlocal micro jobs marketplace for students.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold">For Students</h4>
                        <ul className="mt-2 space-y-1 text-textDark/60 dark:text-darkText/60">
                            <li>Browse Tasks</li>
                            <li>Skill Profile</li>
                            <li>Support</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold">For Clients</h4>
                        <ul className="mt-2 space-y-1 text-textDark/60 dark:text-darkText/60">
                            <li>Post Tasks</li>
                            <li>ML Ranked Students</li>
                            <li>Contact</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold">Company</h4>
                        <ul className="mt-2 space-y-1 text-textDark/60 dark:text-darkText/60">
                            <li>About</li>
                            <li>ML Insights</li>
                            <li>Privacy</li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
