import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

export default function C9_Jobs_Internships() {
    const navigate = useNavigate();
    const [allOpportunities, setAllOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("Any location");
    const [jobType, setJobType] = useState("All types");
    const [sortBy, setSortBy] = useState("Newest first");
    const [savedJobs, setSavedJobs] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const loadJobs = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await apiRequest("/api/jobs");
                const jobs = response.data?.jobs || response.data?.data?.jobs || [];
                if (!Array.isArray(jobs)) throw new Error("The jobs response has an unexpected format.");

                const mappedJobs = jobs.map((job) => {
                    const minExp = Number(job.experience_min || 0);
                    const maxExp = job.experience_max == null ? null : Number(job.experience_max);
                    const minSalary = Number(job.salary_min || 0);
                    const maxSalary = job.salary_max == null ? null : Number(job.salary_max);
                    const company = job.company_name || job.company?.name || "Company not specified";
                    const locationLabel =
                        [job.city, job.state, job.country].filter(Boolean).join(", ") ||
                        job.location ||
                        "Location not specified";
                    const skills = Array.isArray(job.required_skills) ? job.required_skills : [];

                    return {
                        ...job,
                        id: job.id ?? job.job_id,
                        title: job.job_title || job.title || "Untitled position",
                        company,
                        initials: company
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase(),
                        location: locationLabel,
                        type: job.employment_type || job.type || "Not specified",
                        level:
                            maxExp == null
                                ? `${minExp}+ years experience`
                                : `${minExp}–${maxExp} years experience`,
                        salary:
                            minSalary || maxSalary
                                ? maxSalary == null
                                    ? `₹${minSalary.toLocaleString("en-IN")}+`
                                    : `₹${minSalary.toLocaleString("en-IN")} – ₹${maxSalary.toLocaleString("en-IN")}`
                                : "Salary not specified",
                        description: job.job_description || job.description || "",
                        skills: skills.map((skill) =>
                            typeof skill === "string"
                                ? skill
                                : skill.skill_name || skill.name || "Skill"
                        ),
                        assessmentTitle: job.assessment_title,
                        assessmentStatus: job.assessment_status,
                        passingScore: job.passing_score,
                        durationMinutes: job.duration_minutes,
                        postedAt: job.created_at || job.posted_at,
                        applicationDeadline: job.application_deadline,
                        isInternship: String(job.employment_type || "").toLowerCase() === "internship",
                    };
                });

                if (isMounted) setAllOpportunities(mappedJobs);
            } catch (err) {
                console.error("Failed to load jobs:", err);
                if (isMounted) setError(err.message || "Failed to load jobs.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadJobs();
        return () => {
            isMounted = false;
        };
    }, []);

    const locations = useMemo(
        () => [...new Set(allOpportunities.map((job) => job.location).filter(Boolean))].sort(),
        [allOpportunities]
    );

    const jobTypes = useMemo(
        () => [...new Set(allOpportunities.map((job) => job.type).filter(Boolean))].sort(),
        [allOpportunities]
    );

    const filteredOpportunities = useMemo(() => {
        const term = keyword.trim().toLowerCase();

        const results = allOpportunities.filter((job) => {
            const keywordMatch =
                !term ||
                job.title.toLowerCase().includes(term) ||
                job.company.toLowerCase().includes(term) ||
                job.skills.some((skill) => skill.toLowerCase().includes(term));

            const locationMatch = location === "Any location" || job.location === location;
            const typeMatch = jobType === "All types" || job.type === jobType;
            return keywordMatch && locationMatch && typeMatch;
        });

        return [...results].sort((a, b) => {
            if (sortBy === "Newest first") {
                return new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime();
            }
            if (sortBy === "Salary — high to low") {
                const salaryValue = (job) => Number(String(job.salary).replace(/[^\d]/g, "")) || 0;
                return salaryValue(b) - salaryValue(a);
            }
            return 0;
        });
    }, [allOpportunities, keyword, location, jobType, sortBy]);

    const resetFilters = () => {
        setKeyword("");
        setLocation("Any location");
        setJobType("All types");
        setSortBy("Newest first");
    };

    const toggleSavedJob = (jobId) => {
        setSavedJobs((current) =>
            current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]
        );
    };

    const openJobDetails = (job) => {
        navigate("/candidate/job-details", { state: { job } });
    };

    const downloadReport = () => {
        const report = [
            "SKILLVERIFY — JOB OPPORTUNITIES REPORT",
            "======================================",
            "",
            `Keyword: ${keyword || "None"}`,
            `Location: ${location}`,
            `Job type: ${jobType}`,
            `Sorted by: ${sortBy}`,
            `Matching opportunities: ${filteredOpportunities.length}`,
            "",
            ...filteredOpportunities.flatMap((job) => [
                `${job.title} — ${job.company}`,
                `${job.location} • ${job.type} • ${job.level}`,
                `Salary: ${job.salary}`,
                `Required skills: ${job.skills.join(" · ") || "Not specified"}`,
                `Application deadline: ${job.applicationDeadline || "Not specified"}`,
                "",
            ]),
            "Jobs are loaded from the backend marketplace.",
            "Skill match scores are not displayed because matching has not been evaluated.",
        ].join("\n");

        const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "SkillVerify-Job-Opportunities-Report.txt";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? ""
            : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    };

    const inputClass =
        "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
                <header className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-2xl text-white shadow-lg shadow-blue-900/10">
                            <span aria-hidden="true">▣</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">SkillVerify marketplace</p>
                            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                                Jobs &amp; internships
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Explore published opportunities and review the skills employers are looking for.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <button
                            type="button"
                            onClick={() => navigate("/candidate/skill-dna")}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                            <span aria-hidden="true">⌘</span> My Skill DNA
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/candidate/applications")}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <span aria-hidden="true">▤</span> My applications
                        </button>
                        <button
                            type="button"
                            onClick={downloadReport}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            <span aria-hidden="true">↓</span> Download report
                        </button>
                    </div>
                </header>

                <section className="mb-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Published jobs</p>
                        <p className="mt-2 text-2xl font-extrabold text-slate-900">{allOpportunities.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Matching filters</p>
                        <p className="mt-2 text-2xl font-extrabold text-blue-600">{filteredOpportunities.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saved this session</p>
                        <p className="mt-2 text-2xl font-extrabold text-teal-600">{savedJobs.length}</p>
                    </div>
                </section>

                <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Find opportunities</h2>
                                <p className="mt-1 text-xs text-slate-500">Refine your search</p>
                            </div>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">
                                ☷
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="job-keyword" className="mb-2 block text-xs font-bold text-slate-700">
                                    Keyword
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                                    <input
                                        id="job-keyword"
                                        type="search"
                                        value={keyword}
                                        onChange={(event) => setKeyword(event.target.value)}
                                        placeholder="Job title, company, skill..."
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="job-location" className="mb-2 block text-xs font-bold text-slate-700">Location</label>
                                <select id="job-location" value={location} onChange={(event) => setLocation(event.target.value)} className={inputClass}>
                                    <option value="Any location">Any location</option>
                                    {locations.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="job-type" className="mb-2 block text-xs font-bold text-slate-700">Employment type</label>
                                <select id="job-type" value={jobType} onChange={(event) => setJobType(event.target.value)} className={inputClass}>
                                    <option value="All types">All types</option>
                                    {jobTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                            </div>

                            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
                                    <span aria-hidden="true">⌘</span> Skill-based hiring
                                </div>
                                <p className="mt-2 text-xs leading-5 text-blue-800/80">
                                    Skill match scores are not shown until verified-skill matching is available. Review each job’s requirements before applying.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                            >
                                ↺ Reset filters
                            </button>
                        </div>
                    </aside>

                    <section className="min-w-0">
                        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Available opportunities</h2>
                                <p className="mt-1 text-sm text-slate-500">Published listings from participating companies.</p>
                            </div>
                            <div className="w-full sm:w-52">
                                <label htmlFor="job-sort" className="mb-1.5 block text-xs font-semibold text-slate-500">Sort results</label>
                                <select id="job-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={inputClass}>
                                    <option value="Newest first">Newest first</option>
                                    <option value="Salary — high to low">Salary — high to low</option>
                                    <option value="Best match">Default order</option>
                                </select>
                            </div>
                        </div>

                        {/* <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-sm text-slate-600">
                                <span className="font-bold text-slate-900">{filteredOpportunities.length}</span>{" "}
                                {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"} found
                            </p>
                            <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-teal-500" /> Live from the marketplace API
                            </span>
                        </div> */}

                        {loading ? (
                            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                                <h3 className="text-base font-bold text-slate-900">Loading opportunities</h3>
                                <p className="mt-2 text-sm text-slate-500">Fetching published jobs from the marketplace.</p>
                            </div>
                        ) : error ? (
                            <div className="rounded-3xl border border-red-200 bg-white px-5 py-14 text-center shadow-sm">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">!</div>
                                <h3 className="mt-4 text-base font-bold text-slate-900">Could not load jobs</h3>
                                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{error}</p>
                                <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                                    Try again
                                </button>
                            </div>
                        ) : filteredOpportunities.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">⌕</div>
                                <h3 className="mt-4 text-base font-bold text-slate-900">No matching opportunities</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Try a different keyword, location, or employment type.
                                </p>
                                <button type="button" onClick={resetFilters} className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOpportunities.map((job) => {
                                    const isSaved = savedJobs.includes(job.id);
                                    return (
                                        <article key={job.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg sm:p-6">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex min-w-0 gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-sm font-extrabold text-white shadow-sm sm:h-14 sm:w-14">
                                                        {job.initials || "CO"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="break-words text-base font-extrabold leading-snug text-slate-900 sm:text-lg">{job.title}</h3>
                                                        <p className="mt-1.5 text-sm font-semibold text-slate-600">{job.company}</p>
                                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                                                            {job.location && <span className="inline-flex items-center gap-1.5">⌖ {job.location}</span>}
                                                            {job.type && <span className="inline-flex items-center gap-1.5">▣ {job.type}</span>}
                                                            {job.level && <span className="inline-flex items-center gap-1.5">◇ {job.level}</span>}
                                                            {formatDate(job.postedAt) && <span className="inline-flex items-center gap-1.5">◷ {formatDate(job.postedAt)}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2 self-start rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                                                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                                                    Match not evaluated
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap gap-2">
                                                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">{job.salary}</span>
                                                {job.isInternship && <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-100">Internship</span>}
                                                {job.assessmentStatus === "Published" && <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-100">Assessment available</span>}
                                                {job.applicationDeadline && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-100">Deadline: {formatDate(job.applicationDeadline) || job.applicationDeadline}</span>}
                                            </div>

                                            {job.description && (
                                                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>
                                            )}

                                            {job.skills.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Required skills</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {job.skills.slice(0, 8).map((skill) => (
                                                            <span key={`${job.id}-${skill}`} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700">{skill}</span>
                                                        ))}
                                                        {job.skills.length > 8 && <span className="px-2 py-1.5 text-xs text-slate-500">+{job.skills.length - 8} more</span>}
                                                    </div>
                                                </div>
                                            )}

                                            {job.assessmentStatus === "Published" && (
                                                <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/60 p-3.5">
                                                    <p className="text-sm font-semibold text-teal-900">{job.assessmentTitle || "Job assessment"} is available</p>
                                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-teal-800">
                                                        {job.passingScore != null && <span>Passing score: {job.passingScore}%</span>}
                                                        {job.durationMinutes && <span>Duration: {job.durationMinutes} minutes</span>}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                                                <p className="text-xs leading-5 text-slate-500">
                                                    <span className="font-bold text-slate-700">Job reference:</span> {job.id ?? "Not available"}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSavedJob(job.id)}
                                                        aria-pressed={isSaved}
                                                        title={isSaved ? "Remove saved job" : "Save job"}
                                                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSaved
                                                                ? "border-teal-200 bg-teal-50 text-teal-700"
                                                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                            }`}
                                                    >
                                                        <span aria-hidden="true">{isSaved ? "✓" : "☆"}</span>
                                                        <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openJobDetails(job)}
                                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    >
                                                        View details <span aria-hidden="true">→</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center">
                    <button type="button" onClick={() => navigate("/candidate/skill-dna")} className="w-fit font-semibold transition hover:text-blue-700">
                        ← Back to Skill DNA
                    </button>
                    <span>Job listings are loaded from the SkillVerify backend marketplace.</span>
                </footer>
            </div>
        </main>
    );
}
