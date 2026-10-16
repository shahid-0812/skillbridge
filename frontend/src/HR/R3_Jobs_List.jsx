import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

const FILTERS = ["All", "Draft", "Published", "Closed"];

const normalizeJob = (job) => ({
  ...job,
  id: job.id ?? job.job_id,
  title: job.jobTitle ?? job.job_title ?? job.title ?? "Untitled job",
  location: [job.city, job.state, job.country].filter(Boolean).join(", ") || job.location || job.work_setting || "Location not specified",
  type: job.employmentType ?? job.employment_type ?? job.type ?? "Not specified",
  workSetting: job.workSetting ?? job.work_setting ?? "",
  status: String(job.status ?? "Draft").toLowerCase() === "active" ? "Published" : (job.status ?? "Draft"),
  createdAt: job.createdAt ?? job.created_at ?? null,
  deadline: job.applicationDeadline ?? job.application_deadline ?? null,
});

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const statusClass = (status) => {
  const value = String(status).toLowerCase();
  if (value === "published" || value === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (value === "closed" || value === "completed") return "bg-slate-100 text-slate-600 ring-slate-500/20";
  return "bg-amber-50 text-amber-700 ring-amber-600/20";
};

export default function R3_Jobs_List() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState(null);
  const [notice, setNotice] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/api/hr/jobs");
      const list = response?.data?.jobs ?? response?.jobs ?? response?.data ?? [];
      if (!Array.isArray(list)) throw new Error("The jobs endpoint returned an unexpected response format.");
      setJobs(list.map(normalizeJob));
    } catch (err) {
      setError(err.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const counts = useMemo(() => ({
    All: jobs.length,
    Draft: jobs.filter((job) => String(job.status).toLowerCase() === "draft").length,
    Published: jobs.filter((job) => ["published", "active"].includes(String(job.status).toLowerCase())).length,
    Closed: jobs.filter((job) => ["closed", "completed"].includes(String(job.status).toLowerCase())).length,
  }), [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = jobs.filter((job) => {
      const status = String(job.status).toLowerCase();
      const filterMatch = activeFilter === "All" ||
        (activeFilter === "Published" ? ["published", "active"].includes(status) :
          activeFilter === "Closed" ? ["closed", "completed"].includes(status) : status === "draft");
      const searchMatch = !query || [job.title, job.location, job.type, job.status]
        .some((value) => String(value ?? "").toLowerCase().includes(query));
      return filterMatch && searchMatch;
    });
    return result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "status") return String(a.status).localeCompare(String(b.status));
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "oldest" ? aDate - bDate : bDate - aDate;
    });
  }, [jobs, activeFilter, search, sortBy]);

  const publishJob = async (job) => {
    if (!job.id || String(job.status).toLowerCase() === "published") return;
    setPublishingId(job.id);
    setNotice("");
    setError("");
    try {
      await apiRequest(`/api/hr/jobs/${encodeURIComponent(job.id)}/publish`, { method: "POST", body: JSON.stringify({}) });
      setNotice(`“${job.title}” was published successfully.`);
      await loadJobs();
    } catch (err) {
      setError(err.message || "Could not publish this job. Check required skills and assessment readiness.");
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Recruitment workspace</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Manage jobs</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">Create openings, track publication status, and manage your hiring pipeline.</p>
          </div>
          <button onClick={() => navigate("/hr/create-job")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <span className="text-lg leading-none">+</span> Create job
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FILTERS.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-2xl border p-4 text-left transition ${activeFilter === filter ? "border-indigo-200 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-slate-500">{filter === "All" ? "All jobs" : filter}</span><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${activeFilter === filter ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>{counts[filter]}</span></div>
              <p className="mt-2 text-2xl font-bold">{counts[filter]}</p>
            </button>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-lg font-semibold">Your job listings</h2><p className="mt-1 text-sm text-slate-500">{filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} shown</p></div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:min-w-64"><span className="sr-only">Search jobs</span><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, location, status..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3"><span className="whitespace-nowrap text-xs font-medium text-slate-500">Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-w-28 bg-transparent py-2.5 text-sm outline-none"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="title">Title A–Z</option><option value="status">Status</option></select></label>
            </div>
          </div>

          {notice && <div role="status" className="border-b border-emerald-100 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">{notice}</div>}
          {error && <div role="alert" className="m-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button onClick={loadJobs} className="shrink-0 rounded-lg border border-rose-200 bg-white px-3 py-2 font-semibold hover:bg-rose-100">Try again</button></div>}

          {loading ? (
            <div className="space-y-4 p-6" aria-label="Loading jobs">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}<p className="text-center text-sm text-slate-500">Loading your jobs…</p></div>
          ) : filteredJobs.length === 0 ? (
            <div className="px-6 py-16 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">⌕</div><h3 className="text-base font-semibold">{jobs.length ? "No matching jobs" : "No jobs yet"}</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{jobs.length ? "Try a different search or status filter." : "Create your first job opening to start building your hiring pipeline."}</p>{!jobs.length && <button onClick={() => navigate("/hr/create-job")} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Create your first job</button>}</div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 md:hidden">{filteredJobs.map((job) => <article key={job.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold text-slate-900">{job.title}</h3><p className="mt-1 text-sm text-slate-500">{job.location}</p><p className="mt-1 text-xs text-slate-500">{job.type} · Posted {formatDate(job.createdAt)}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(job.status)}`}>{job.status}</span></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => navigate(`/hr/applications?jobId=${encodeURIComponent(job.id)}`)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">View applications</button>{String(job.status).toLowerCase() !== "published" && <button disabled={publishingId === job.id} onClick={() => publishJob(job)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{publishingId === job.id ? "Publishing…" : "Publish"}</button>}</div></article>)}</div>
              <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[850px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 font-semibold">Job</th><th className="px-5 py-4 font-semibold">Location</th><th className="px-5 py-4 font-semibold">Type</th><th className="px-5 py-4 font-semibold">Posted</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredJobs.map((job) => <tr key={job.id} className="transition hover:bg-slate-50/70"><td className="px-5 py-4"><div className="font-semibold text-slate-900">{job.title}</div><div className="mt-1 text-xs text-slate-400">Job ID: {job.id}</div></td><td className="px-5 py-4 text-sm text-slate-600">{job.location}</td><td className="px-5 py-4 text-sm text-slate-600">{job.type}</td><td className="px-5 py-4 text-sm text-slate-600">{formatDate(job.createdAt)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(job.status)}`}>{job.status}</span></td><td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><button onClick={() => navigate(`/hr/applications?jobId=${encodeURIComponent(job.id)}`)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">View</button>{String(job.status).toLowerCase() !== "published" && <button disabled={publishingId === job.id} onClick={() => publishJob(job)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-50">{publishingId === job.id ? "Publishing…" : "Publish"}</button>}</div></td></tr>)}</tbody></table></div>
            </>
          )}
          <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Applicant totals and edit/close actions are hidden until supported by the backend.</span><button onClick={loadJobs} className="self-start font-semibold text-indigo-600 hover:text-indigo-800 sm:self-auto">Refresh list ↻</button></div>
        </section>
      </div>
    </main>
  );
}
