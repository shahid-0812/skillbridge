import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiRequest from "../services/api";

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const normalizeStatus = (value) => String(value || "").trim().toLowerCase();

const getStatusLabel = (application) => {
    const status = normalizeStatus(application.status);
    const attemptStatus = normalizeStatus(application.latest_attempt_status);
    if (status.includes("reject")) return "Rejected";
    if (status.includes("interview")) return "Interviewing";
    if (status.includes("shortlist")) return "Shortlisted";
    if (status.includes("offer")) return "Offer";
    if (status.includes("pass") || status.includes("complete") || attemptStatus === "completed") {
        const score = Number(application.assessment_score);
        const passing = Number(application.passing_score);
        if (Number.isFinite(score) && Number.isFinite(passing) && passing > 0 && score < passing) return "Below requirement";
        return "Recommended";
    }
    if (status.includes("fail")) return "Below requirement";
    return "Review";
};

const getLocation = (candidate) =>
    [candidate.city, candidate.state, candidate.country].filter(Boolean).join(", ") || "Location not provided";

const getCandidateName = (candidate) =>
    [candidate.first_name, candidate.last_name].filter(Boolean).join(" ").trim() || candidate.candidate_name || "Candidate";

export default function R12_Applications() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get("jobId");

    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [company, setCompany] = useState(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadApplications = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");
        try {
            const query = jobId ? `?jobId=${encodeURIComponent(jobId)}` : "";
            const response = await apiRequest(`/api/hr/applications${query}`);
            const data = response?.data || {};
            const rows = Array.isArray(data.applications) ? data.applications : [];
            setApplications(rows);
            setJob(data.job || null);
            setCompany(data.company || null);
        } catch (err) {
            setError(err.message || "Could not load applications.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadApplications();
        // Load when jobId changes.
    }, [jobId]);

    const enrichedApplications = useMemo(() => applications.map((application) => ({
        ...application,
        candidateDisplayName: getCandidateName(application),
        candidateLocation: getLocation(application),
        displayStatus: getStatusLabel(application),
    })), [applications]);

    const counts = useMemo(() => {
        const countFor = (label) => enrichedApplications.filter((item) => item.displayStatus === label).length;
        return {
            All: enrichedApplications.length,
            Recommended: countFor("Recommended"),
            "Below requirement": countFor("Below requirement"),
            Interviewing: countFor("Interviewing"),
            Rejected: countFor("Rejected"),
        };
    }, [enrichedApplications]);

    const filteredCandidates = useMemo(() => {
        const query = search.trim().toLowerCase();
        return enrichedApplications.filter((candidate) => {
            const matchesFilter = activeFilter === "All" ||
                (activeFilter === "Interviewing"
                    ? candidate.displayStatus === "Interviewing"
                    : candidate.displayStatus === activeFilter);
            const haystack = [
                candidate.candidateDisplayName,
                candidate.job_title,
                candidate.candidateLocation,
                candidate.email,
                candidate.status,
            ].filter(Boolean).join(" ").toLowerCase();
            return matchesFilter && haystack.includes(query);
        });
    }, [enrichedApplications, activeFilter, search]);

    const averageScore = useMemo(() => {
        const scores = enrichedApplications
            .map((item) => Number(item.assessment_score))
            .filter((score) => Number.isFinite(score) && score >= 0);
        if (!scores.length) return null;
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }, [enrichedApplications]);

    const scoreColor = (score) => {
        const number = Number(score);
        if (!Number.isFinite(number)) return "#64748b";
        if (number >= 85) return "#059669";
        if (number >= 70) return "#d97706";
        return "#dc2626";
    };

    const statusStyle = (status) => {
        if (status === "Recommended" || status === "Shortlisted" || status === "Offer") {
            return "bg-emerald-50 text-emerald-700 ring-emerald-200";
        }
        if (status === "Interviewing") return "bg-blue-50 text-blue-700 ring-blue-200";
        if (status === "Below requirement") return "bg-amber-50 text-amber-700 ring-amber-200";
        if (status === "Rejected") return "bg-rose-50 text-rose-700 ring-rose-200";
        return "bg-slate-100 text-slate-700 ring-slate-200";
    };

    const exportCsv = () => {
        const rows = filteredCandidates.map((candidate) => ({
            Candidate: candidate.candidateDisplayName,
            Email: candidate.email || "",
            Job: candidate.job_title || "",
            Location: candidate.candidateLocation,
            "Assessment Score": candidate.assessment_score ?? "",
            Status: candidate.displayStatus,
            "Applied At": candidate.applied_at || "",
        }));
        const headers = Object.keys(rows[0] || {
            Candidate: "", Email: "", Job: "", Location: "",
            "Assessment Score": "", Status: "", "Applied At": "",
        });
        const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const csv = [headers.map(escape).join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\r\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `applications${jobId ? `-job-${jobId}` : ""}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const filters = ["All", "Recommended", "Below requirement", "Interviewing", "Rejected"];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-500 text-lg text-white shadow-lg shadow-blue-200">
                            <i className="fa-solid fa-shield-halved" />
                        </div>
                        <div>
                            <div className="font-extrabold tracking-tight">SkillVerify</div>
                            <div className="text-xs text-slate-500">Recruiter Workspace</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-slate-500 sm:inline"><i className="fa-solid fa-briefcase mr-2" />Hiring pipeline</span>
                        <button type="button" onClick={() => navigate("/hr/jobs")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            <i className="fa-solid fa-arrow-left mr-2" />Jobs
                        </button>
                    </div>
                </div>
            </header>

            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-end lg:px-8">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">
                            <i className="fa-solid fa-users" />Candidate pipeline
                        </div>
                        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Applications</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            {job?.job_title || (jobId ? `Applications for job #${jobId}` : "Applications across your company's jobs")}
                            {company?.company_name ? ` · ${company.company_name}` : ""}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg text-indigo-700"><i className="fa-solid fa-user-check" /></div>
                        <div>
                            <div className="font-extrabold">{counts.Recommended} recommended</div>
                            <div className="text-xs text-slate-500">Based on returned application status</div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-7 sm:px-6 lg:px-8">
                {error && (
                    <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
                        <div><i className="fa-solid fa-circle-exclamation mr-2" />{error}</div>
                        <button onClick={() => loadApplications(true)} type="button" className="self-start rounded-lg border border-rose-300 px-3 py-2 font-bold hover:bg-rose-100">Try again</button>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: "Total applications", value: loading ? "…" : applications.length, icon: "fa-users" },
                        { label: "Recommended", value: loading ? "…" : counts.Recommended, icon: "fa-star" },
                        { label: "Interviewing", value: loading ? "…" : counts.Interviewing, icon: "fa-comments" },
                        { label: "Average assessment score", value: loading ? "…" : averageScore === null ? "—" : `${averageScore}%`, icon: "fa-chart-line" },
                    ].map((metric) => (
                        <div key={metric.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><i className={`fa-solid ${metric.icon}`} /></div>
                            <div><div className="text-2xl font-black">{metric.value}</div><div className="mt-1 text-xs text-slate-500">{metric.label}</div></div>
                        </div>
                    ))}
                </div>

                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-800 p-5 text-white shadow-lg sm:p-6">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                        <div>
                            <h2 className="text-lg font-extrabold">Hiring pipeline</h2>
                            <p className="mt-1 text-sm text-blue-100/70">Counts are based on the applications currently returned by the backend.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                ["Applied", counts.All],
                                ["Recommended", counts.Recommended],
                                ["Interviewing", counts.Interviewing],
                                ["Below requirement", counts["Below requirement"]],
                            ].map(([label, value]) => <div key={label} className="min-w-28 rounded-xl bg-white/10 px-4 py-3 text-center">
                                <div className="text-xl font-black">{loading ? "…" : value}</div><div className="mt-1 text-xs text-blue-100/70">{label}</div>
                            </div>)}
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
                        <div><h2 className="font-extrabold">Candidate applications</h2><p className="mt-1 text-sm text-slate-500">Candidate information and recorded assessment outcomes.</p></div>
                        <div className="flex flex-wrap gap-2">
                            <div className="relative min-w-0 flex-1 sm:flex-none">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidates…" className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-64" />
                            </div>
                            <button type="button" onClick={() => setShowFilters((current) => !current)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><i className="fa-solid fa-filter mr-2" />Filters</button>
                            <button type="button" onClick={exportCsv} disabled={!filteredCandidates.length} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><i className="fa-solid fa-download mr-2" />Export CSV</button>
                            <button type="button" onClick={() => loadApplications(true)} disabled={refreshing} className="rounded-xl bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"><i className={`fa-solid ${refreshing ? "fa-spinner fa-spin" : "fa-rotate"} mr-2`} />Refresh</button>
                        </div>
                    </div>

                    {(showFilters || true) && <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-4">
                        {filters.map((filter) => <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${activeFilter === filter ? "border-blue-700 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                            {filter} <span className="ml-1 opacity-70">({loading ? "…" : counts[filter] ?? 0})</span>
                        </button>)}
                    </div>}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] border-collapse text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>{["Candidate", "Job", "Assessment", "Applied", "Status", "Action"].map((heading) => <th key={heading} className="px-5 py-4 font-bold">{heading}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-500"><i className="fa-solid fa-spinner fa-spin mr-2" />Loading applications…</td></tr>
                                    : filteredCandidates.map((candidate) => {
                                        const score = candidate.assessment_score;
                                        return <tr key={candidate.id} className="hover:bg-slate-50/70">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 font-extrabold text-blue-700">{candidate.candidateDisplayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
                                                    <div><div className="font-bold">{candidate.candidateDisplayName}</div><div className="mt-1 text-xs text-slate-500">{candidate.email || "Email not provided"}</div><div className="mt-1 text-xs text-slate-400">{candidate.candidateLocation}</div></div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4"><div className="font-semibold">{candidate.job_title || "—"}</div><div className="mt-1 text-xs text-slate-500">{candidate.city || ""}</div></td>
                                            <td className="px-5 py-4">{score === null || score === undefined ? <span className="text-sm text-slate-400">Not scored</span> : <div className="font-black" style={{ color: scoreColor(score) }}>{score}%<div className="mt-1 text-xs font-normal text-slate-500">{candidate.latest_attempt_status || "Score recorded"}</div></div>}</td>
                                            <td className="px-5 py-4 text-sm text-slate-600">{formatDate(candidate.applied_at)}</td>
                                            <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${statusStyle(candidate.displayStatus)}`}>{candidate.displayStatus}</span><div className="mt-1 text-xs text-slate-400">Raw: {candidate.status || "Unknown"}</div></td>
                                            <td className="px-5 py-4"><button type="button" onClick={() => navigate(`/hr/candidate-profile?applicationId=${encodeURIComponent(candidate.id)}&candidateId=${encodeURIComponent(candidate.candidate_id)}`, { state: { application: candidate } })} className="whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">View details <i className="fa-solid fa-arrow-right ml-2" /></button></td>
                                        </tr>;
                                    })}
                                {!loading && filteredCandidates.length === 0 && <tr><td colSpan={6} className="px-5 py-16 text-center"><i className="fa-solid fa-user-slash mb-3 block text-2xl text-slate-300" /><div className="font-semibold text-slate-700">No applications found</div><p className="mt-1 text-sm text-slate-500">{applications.length ? "Try changing your search or filter." : "Applications will appear here when candidates apply to your published jobs."}</p></td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center">
                        <span>Showing {filteredCandidates.length} of {applications.length} applications</span>
                        <button type="button" onClick={() => navigate("/hr/candidate-comparison")} className="self-start rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 sm:self-auto"><i className="fa-solid fa-users mr-2" />Compare candidates <i className="fa-solid fa-arrow-right ml-2" /></button>
                    </div>
                </section>
                <p className="text-xs leading-5 text-slate-400">Skill-match percentage and candidate experience are not displayed because the existing API does not currently provide those values. Status labels are derived from the stored application status and assessment outcome.</p>
            </main>
        </div>
    );
}
