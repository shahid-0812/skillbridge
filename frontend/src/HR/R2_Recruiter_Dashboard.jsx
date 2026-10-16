import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../services/api";

const ActionCard = ({ icon, title, description, actionLabel, onClick, accent = "indigo" }) => {
  const accents = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    sky: "bg-sky-50 text-sky-600 ring-sky-100",
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${accents[accent]}`}>
        <span className="text-xl" aria-hidden="true">{icon}</span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 min-h-10 text-sm leading-6 text-slate-500">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
      >
        {actionLabel} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
};

export default function R2_Recruiter_Dashboard() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadCompany = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/hr/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await apiRequest("/api/hr/company/me");
        if (active) {
          setCompany(response?.data?.company ?? null);
        }
      } catch (err) {
        if (!active) return;
        setError(err?.message || "We couldn't load your company workspace.");
        // A 401/403 means this account cannot access the HR workspace.
        if (/401|403|unauthorized|forbidden|hr access|company membership/i.test(err?.message || "")) {
          localStorage.removeItem("token");
          navigate("/hr/login", { replace: true });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCompany();
    return () => { active = false; };
  }, [navigate]);

  const companyName = company?.company_name || "Your company";
  const companyInitials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "HR";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/hr/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 px-2 pb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-200">
              S
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">SkillVerify</p>
              <p className="mt-0.5 text-xs text-slate-500">Recruiter workspace</p>
            </div>
          </div>

          <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <nav className="space-y-1">
            <button type="button" className="flex w-full items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-left text-sm font-semibold text-indigo-700">
              <span aria-hidden="true">▦</span> Dashboard
            </button>
            <button type="button" onClick={() => navigate("/hr/create-job")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700">
              <span aria-hidden="true">＋</span> Post a job
            </button>
            <button type="button" onClick={() => navigate("/hr/jobs")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700">
              <span aria-hidden="true">▤</span> Manage jobs
            </button>
            <button type="button" onClick={() => navigate("/hr/applications")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700">
              <span aria-hidden="true">♙</span> Applications
            </button>
            <button type="button" onClick={() => navigate("/hr/settings")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700">
              <span aria-hidden="true">⚙</span> Company settings
            </button>
          </nav>

          <div className="mt-auto rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-sky-50 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg text-indigo-600 shadow-sm">✦</div>
            <p className="mt-3 text-sm font-semibold text-slate-800">Skills-first hiring</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Build assessments around the skills your roles require.</p>
            <button type="button" onClick={() => navigate("/hr/create-job")} className="mt-3 text-xs font-bold text-indigo-700 hover:text-indigo-900">
              Create a job →
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">Recruiter workspace</p>
              <h1 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="max-w-48 truncate text-sm font-semibold text-slate-800">{companyName}</p>
                <p className="text-xs text-slate-500">HR account</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700" title={companyName}>
                {companyInitials}
              </div>
              <button type="button" onClick={handleLogout} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                Sign out
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-9">
            {loading ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  Loading your company workspace…
                </div>
              </div>
            ) : error ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-800">Unable to load the recruiter dashboard</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
                  Try again
                </button>
              </div>
            ) : (
              <>
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-100 sm:p-9">
                  <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
                  <div className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10" />
                  <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
                    <div className="max-w-2xl">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-50">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Company workspace connected
                      </span>
                      <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                        Welcome, {companyName}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                        Create a job, define the skills you need, and prepare a manual assessment for candidates.
                      </p>
                    </div>
                    <button type="button" onClick={() => navigate("/hr/create-job")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50">
                      <span className="text-lg leading-none">＋</span> Post a job
                    </button>
                  </div>
                </section>

                <section className="mt-7">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold tracking-tight">Get started</h2>
                    <p className="mt-1 text-sm text-slate-500">Choose the next step for your hiring workflow.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <ActionCard
                      icon="＋"
                      title="Create a job"
                      description="Add the job title, description, location, work setting, and experience requirements."
                      actionLabel="Start job posting"
                      onClick={() => navigate("/hr/create-job")}
                      accent="indigo"
                    />
                    <ActionCard
                      icon="▤"
                      title="Manage job postings"
                      description="Continue to the job management page to review your postings."
                      actionLabel="Open jobs"
                      onClick={() => navigate("/hr/jobs")}
                      accent="violet"
                    />
                    <ActionCard
                      icon="✓"
                      title="Review applications"
                      description="Open the recruiter application area when your jobs begin receiving applications."
                      actionLabel="View applications"
                      onClick={() => navigate("/hr/applications")}
                      accent="sky"
                    />
                  </div>
                </section>

                <section className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold tracking-tight">Company profile</h2>
                        <p className="mt-1 text-sm text-slate-500">Details returned by your backend.</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Connected</span>
                    </div>
                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Company</dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{company?.company_name || "Not provided"}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Industry</dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{company?.industry || "Not added yet"}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Location</dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
                          {[company?.city, company?.state, company?.country].filter(Boolean).join(", ") || "Not added yet"}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Website</dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{company?.website_url || "Not added yet"}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 text-xs leading-5 text-slate-400">
                      Company information is loaded from <code className="rounded bg-slate-100 px-1 py-0.5">GET /api/hr/company/me</code>. Edit-company navigation can be connected when the settings page is integrated.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="font-bold tracking-tight">How job publishing works</h2>
                    <p className="mt-1 text-sm text-slate-500">Your SkillVerify recruiter workflow</p>
                    <ol className="mt-5 space-y-4">
                      {[
                        ["01", "Job details", "Describe the role and its location."],
                        ["02", "Required skills", "Set the skills and proficiency levels."],
                        ["03", "Manual assessment", "Add MCQ questions and choose the passing score."],
                        ["04", "Publish", "Review the details and publish the job."],
                      ].map(([number, title, description]) => (
                        <li key={number} className="flex gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">{number}</span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{title}</p>
                            <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <button type="button" onClick={() => navigate("/hr/create-job")} className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                      Start the process
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
